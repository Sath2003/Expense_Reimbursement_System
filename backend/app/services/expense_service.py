from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.expense import Expense, ExpenseAttachment, ExpenseStatusEnum
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.utils.audit_logger import AuditLogger
from app.utils.file_handler import FileHandler
from datetime import datetime
from typing import Optional, List, Tuple
import json

class ExpenseService:
    
    @staticmethod
    def check_duplicate_expense(
        db: Session,
        description: str,
        amount: float,
        expense_date: str,
        user_id: int
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if an identical or very similar expense already exists
        This prevents fraud where someone submits the same expense with different email
        
        Checks for:
        1. Exact match (same description, amount, date, user)
        
        Returns: (is_duplicate, error_message)
        """
        from datetime import datetime
        
        try:
            # Check for exact duplicate from same user (same description, amount, date)
            exact_duplicate = db.query(Expense).filter(
                and_(
                    Expense.user_id == user_id,
                    Expense.description == description,
                    Expense.amount == amount,
                    Expense.expense_date == expense_date,
                    Expense.status != ExpenseStatusEnum.FINANCE_REJECTED  # Rejected ones don't count
                )
            ).first()
            
            if exact_duplicate:
                return True, f"Duplicate expense found! You already submitted '{description}' for ₹{amount} on {expense_date}"
            
            return False, None
        
        except Exception as e:
            return False, f"Error checking duplicates: {str(e)}"
    
    @staticmethod
    def create_expense(
        db: Session,
        user_id: int,
        expense_data: ExpenseCreate,
        performed_by: int,
        ai_validation_data: Optional[dict] = None
    ) -> Tuple[Optional[Expense], Optional[str]]:
        """Create a new expense"""
        try:
            # Validate user exists
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return None, "User not found"
            
            # Check for duplicate/fraudulent expenses (temporarily disabled for testing)
            # is_duplicate, duplicate_error = ExpenseService.check_duplicate_expense(
            #     db=db,
            #     description=expense_data.description,
            #     amount=expense_data.amount,
            #     expense_date=str(expense_data.expense_date),
            #     user_id=user_id
            # )
            
            # if is_duplicate:
            #     return None, duplicate_error
            
            # Create expense
            new_expense = Expense(
                user_id=user_id,
                category_id=expense_data.category_id,
                transport_type_id=expense_data.transport_type_id,
                amount=expense_data.amount,
                expense_date=expense_data.expense_date,
                description=expense_data.description,
                status=ExpenseStatusEnum.SUBMITTED,
                # AI validation fields
                file_hash=ai_validation_data.get('file_hash') if ai_validation_data else None,
                extracted_text_hash=ai_validation_data.get('extracted_text_hash') if ai_validation_data else None,
                validation_score=ai_validation_data.get('validation_score') if ai_validation_data else None,
                is_ai_validated=ai_validation_data.get('is_ai_validated', False) if ai_validation_data else False,
                risk_factors=json.dumps(ai_validation_data.get('risk_factors', [])) if ai_validation_data else None
            )
            
            db.add(new_expense)
            db.flush()  # Get the ID before commit
            
            # Log action
            AuditLogger.log(
                db=db,
                entity_type="expense",
                entity_id=new_expense.id,
                action="created",
                performed_by=performed_by,
                new_value={
                    "amount": str(expense_data.amount),
                    "category_id": expense_data.category_id,
                    "description": expense_data.description
                }
            )
            
            db.commit()
            db.refresh(new_expense)
            return new_expense, None
        
        except Exception as e:
            db.rollback()
            return None, f"Error creating expense: {str(e)}"
    
    @staticmethod
    def get_expense(db: Session, expense_id: int) -> Optional[Expense]:
        """Get expense by ID"""
        return db.query(Expense).filter(Expense.id == expense_id).first()
    
    @staticmethod
    def get_user_expenses(
        db: Session,
        user_id: int,
        status: Optional[str] = None
    ) -> List[Expense]:
        """Get all expenses for a user"""
        query = db.query(Expense).filter(Expense.user_id == user_id)
        
        if status:
            query = query.filter(Expense.status == status)
        
        return query.order_by(Expense.created_at.desc()).all()
    
    @staticmethod
    def get_pending_expenses(db: Session, manager_id: int) -> List[Expense]:
        """Get expenses pending manager approval"""
        # Get all employees under this manager
        employees = db.query(User).filter(User.manager_id == manager_id).all()
        employee_ids = [emp.id for emp in employees]
        
        if not employee_ids:
            return []
        
        return db.query(Expense).filter(
            and_(
                Expense.user_id.in_(employee_ids),
                Expense.status == ExpenseStatusEnum.SUBMITTED
            )
        ).all()
    
    @staticmethod
    def update_expense(
        db: Session,
        expense_id: int,
        expense_data: ExpenseUpdate,
        performed_by: int
    ) -> Tuple[Optional[Expense], Optional[str]]:
        """Update expense (only if in SUBMITTED status)"""
        try:
            expense = ExpenseService.get_expense(db, expense_id)
            if not expense:
                return None, "Expense not found"
            
            if expense.status != ExpenseStatusEnum.SUBMITTED:
                return None, "Can only update expenses in SUBMITTED status"
            
            # Store old values
            old_values = {
                "amount": str(expense.amount),
                "description": expense.description
            }
            
            # Update fields
            if expense_data.amount:
                expense.amount = expense_data.amount
            if expense_data.description:
                expense.description = expense_data.description
            if expense_data.category_id:
                expense.category_id = expense_data.category_id
            
            # Log action
            AuditLogger.log(
                db=db,
                entity_type="expense",
                entity_id=expense_id,
                action="updated",
                performed_by=performed_by,
                old_value=old_values,
                new_value={
                    "amount": str(expense.amount),
                    "description": expense.description
                }
            )
            
            db.commit()
            db.refresh(expense)
            return expense, None
        
        except Exception as e:
            db.rollback()
            return None, f"Error updating expense: {str(e)}"
    
    @staticmethod
    def delete_expense(
        db: Session,
        expense_id: int,
        performed_by: int
    ) -> Tuple[bool, Optional[str]]:
        """Delete expense (only if in SUBMITTED status)"""
        try:
            expense = ExpenseService.get_expense(db, expense_id)
            if not expense:
                return False, "Expense not found"
            
            if expense.status != ExpenseStatusEnum.SUBMITTED:
                return False, "Can only delete expenses in SUBMITTED status"
            
            # Delete attachments
            for attachment in expense.attachments:
                FileHandler.delete_file(attachment.file_path)
            
            # Log action
            AuditLogger.log(
                db=db,
                entity_type="expense",
                entity_id=expense_id,
                action="deleted",
                performed_by=performed_by,
                old_value={
                    "amount": str(expense.amount),
                    "status": expense.status.value
                }
            )
            
            db.delete(expense)
            db.commit()
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error deleting expense: {str(e)}"
