from sqlalchemy.orm import Session
from app.models.expense import Expense, ExpenseAttachment, ExpenseStatusEnum
from app.models.approval import ExpenseApproval, ApprovalDecision, ApprovalRole
from app.models.user import User, RoleEnum
from app.utils.audit_logger import AuditLogger
from app.services.bill_analysis_service import BillAnalysisService
from datetime import datetime
from typing import Optional, Tuple

class ApprovalService:
    
    @staticmethod
    def submit_for_hr_approval(db: Session, expense_id: int) -> Tuple[bool, Optional[str]]:
        """Submit expense to HR for receipt genuineness approval"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            if expense.status != ExpenseStatusEnum.SUBMITTED:
                return False, "Expense must be in SUBMITTED status"
            
            # Check if HR approval already exists
            existing = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.HR
            ).first()
            
            if existing:
                return False, "HR approval already exists for this expense"
            
            # Create HR approval record
            hr_approval = ExpenseApproval(
                expense_id=expense_id,
                approval_role=ApprovalRole.HR,
                decision=ApprovalDecision.PENDING
            )
            
            db.add(hr_approval)
            db.commit()
            db.refresh(hr_approval)
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error submitting for HR approval: {str(e)}"
    
        
    @staticmethod
    def reject_expense_finance(
        db: Session,
        expense_id: int,
        rejected_by: int,
        comments: str = None
    ) -> Tuple[bool, Optional[str]]:
        """Finance rejects expense due to receipt genuineness issues"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            # Get Finance approval record
            finance_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.HR
            ).first()
            
            if not finance_approval:
                return False, "No pending Finance approval found"
            
            if finance_approval.decision != ApprovalDecision.PENDING:
                return False, "Finance approval already processed"
            
            # Update approval
            finance_approval.decision = ApprovalDecision.REJECTED
            finance_approval.approved_by = rejected_by
            finance_approval.comments = comments
            finance_approval.decided_at = datetime.utcnow()
            
            # Update expense status to HR_REJECTED
            expense.status = ExpenseStatusEnum.HR_REJECTED
            
            # Log action
            AuditLogger.log(
                db=db,
                entity_type="approval",
                entity_id=finance_approval.id,
                action="finance_rejected",
                performed_by=rejected_by,
                new_value={"decision": "REJECTED", "comments": comments}
            )
            
            db.commit()
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error rejecting expense: {str(e)}"

    @staticmethod
    def approve_expense_hr(db: Session, expense_id: int, approved_by: int, comments: str = None) -> Tuple[bool, Optional[str]]:
        """HR approves expense after verifying receipt genuineness"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            # Get HR approval record
            hr_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.HR
            ).first()
            
            if not hr_approval:
                return False, "No pending HR approval found"
            
            if hr_approval.decision != ApprovalDecision.PENDING:
                return False, "HR approval already processed"
            
            # Update approval
            hr_approval.decision = ApprovalDecision.APPROVED
            hr_approval.approved_by = approved_by
            hr_approval.comments = comments
            hr_approval.decided_at = datetime.utcnow()
            
            # Update expense status to HR_APPROVED
            expense.status = ExpenseStatusEnum.HR_APPROVED
            
            # Log action
            AuditLogger.log(
                db=db,
                entity_type="approval",
                entity_id=hr_approval.id,
                action="hr_approved",
                performed_by=approved_by,
                new_value={"decision": "APPROVED", "comments": comments}
            )
            
            db.commit()
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error approving expense: {str(e)}"
    
    @staticmethod
    def reject_expense_hr(
        db: Session,
        expense_id: int,
        rejected_by: int,
        comments: str = None
    ) -> Tuple[bool, Optional[str]]:
        """HR rejects expense due to receipt genuineness issues"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            # Get HR approval record
            hr_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.HR
            ).first()
            
            if not hr_approval:
                return False, "No pending HR approval found"
            
            if hr_approval.decision != ApprovalDecision.PENDING:
                return False, "HR approval already processed"
            
            # Update approval
            hr_approval.decision = ApprovalDecision.REJECTED
            hr_approval.approved_by = rejected_by
            hr_approval.comments = comments
            hr_approval.decided_at = datetime.utcnow()
            
            # Update expense status to HR_REJECTED
            expense.status = ExpenseStatusEnum.HR_REJECTED
            
            # Log action
            AuditLogger.log(
                db=db,
                entity_type="approval",
                entity_id=hr_approval.id,
                action="hr_rejected",
                performed_by=rejected_by,
                new_value={"decision": "REJECTED", "comments": comments}
            )
            
            db.commit()
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error rejecting expense: {str(e)}"
    
    @staticmethod
    def submit_for_manager_approval(db: Session, expense_id: int) -> Tuple[bool, Optional[str]]:
        """Submit expense to manager for approval"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            if expense.status != ExpenseStatusEnum.SUBMITTED:
                return False, "Expense must be in SUBMITTED status"
            
            # Check if manager approval already exists
            existing = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.MANAGER
            ).first()
            
            if existing:
                return False, "Manager approval already exists for this expense"
            
            # Create manager approval record
            manager_approval = ExpenseApproval(
                expense_id=expense_id,
                approval_role=ApprovalRole.MANAGER,
                decision=ApprovalDecision.PENDING
            )
            
            db.add(manager_approval)
            db.commit()
            db.refresh(manager_approval)
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error submitting for approval: {str(e)}"
    
    @staticmethod
    def approve_expense_manager(
        db: Session,
        expense_id: int,
        approved_by: int,
        comments: str = None
    ) -> Tuple[bool, Optional[str]]:
        """Manager approves expense for verification (sends to Finance for final approval)"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"

            # Get manager approval record
            manager_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.MANAGER
            ).first()

            if not manager_approval:
                # Create manager approval record if it doesn't exist
                manager_approval = ExpenseApproval(
                    expense_id=expense_id,
                    approval_role=ApprovalRole.MANAGER,
                    decision=ApprovalDecision.PENDING
                )
                db.add(manager_approval)
                db.flush()

            if manager_approval.decision != ApprovalDecision.PENDING:
                return False, "Manager approval already processed"

            # Update approval
            manager_approval.decision = ApprovalDecision.APPROVED
            manager_approval.approved_by = approved_by
            manager_approval.comments = comments
            manager_approval.decided_at = datetime.utcnow()

            # Update expense status to MANAGER_APPROVED_FOR_VERIFICATION (awaiting Finance review)
            expense.status = ExpenseStatusEnum.MANAGER_APPROVED_FOR_VERIFICATION

            # Create finance approval record for the finance department to process
            finance_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.FINANCE
            ).first()

            if not finance_approval:
                finance_approval = ExpenseApproval(
                    expense_id=expense_id,
                    approval_role=ApprovalRole.FINANCE,
                    decision=ApprovalDecision.PENDING
                )
                db.add(finance_approval)

            # Log action
            AuditLogger.log(
                db=db,
                entity_type="approval",
                entity_id=manager_approval.id,
                action="manager_approved_for_verification",
                performed_by=approved_by,
                new_value={"decision": "APPROVED_FOR_VERIFICATION", "comments": comments, "status": "MANAGER_APPROVED_FOR_VERIFICATION"}
            )

            db.commit()
            return True, None

        except Exception as e:
            db.rollback()
            return False, f"Error approving expense: {str(e)}"
    
    @staticmethod
    def reject_expense_manager(
        db: Session,
        expense_id: int,
        rejected_by: int,
        comments: str = None
    ) -> Tuple[bool, Optional[str]]:
        """Manager rejects expense with AI analysis of rejection reasons"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"

            # Get manager approval record
            manager_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.MANAGER
            ).first()

            if not manager_approval:
                # Create manager approval record if it doesn't exist
                manager_approval = ExpenseApproval(
                    expense_id=expense_id,
                    approval_role=ApprovalRole.MANAGER,
                    decision=ApprovalDecision.PENDING
                )
                db.add(manager_approval)
                db.flush()

            if manager_approval.decision != ApprovalDecision.PENDING:
                return False, "Manager approval already processed"

            # Update approval
            manager_approval.decision = ApprovalDecision.REJECTED
            manager_approval.approved_by = rejected_by
            manager_approval.comments = comments
            manager_approval.decided_at = datetime.utcnow()

            # Update expense status
            expense.status = ExpenseStatusEnum.MANAGER_REJECTED

            # Get attachment for AI analysis if available
            attachment = db.query(ExpenseAttachment).filter(
                ExpenseAttachment.expense_id == expense_id
            ).first()

            # Prepare AI analysis remarks (if async support is needed in future)
            # For now, we combine manager comments with a note about AI analysis
            rejection_remarks = []
            if comments:
                rejection_remarks.append(f"Manager's Note: {comments}")

            # Add AI analysis placeholder - in production, you would call the AI service here
            # analysis = await BillAnalysisService.analyze_bill_for_rejection(...)
            # formatted_remarks = BillAnalysisService.format_rejection_remarks(analysis)
            # rejection_remarks.append(formatted_remarks)

            # Store rejection remarks in expense record
            expense.rejection_remarks = "\n".join(rejection_remarks) if rejection_remarks else "Rejected by manager"

            # Log action
            AuditLogger.log(
                db=db,
                entity_type="approval",
                entity_id=manager_approval.id,
                action="manager_rejected",
                performed_by=rejected_by,
                new_value={"decision": "REJECTED", "comments": comments, "rejection_remarks": expense.rejection_remarks}
            )

            db.commit()
            return True, None

        except Exception as e:
            db.rollback()
            return False, f"Error rejecting expense: {str(e)}"
    
    @staticmethod
    def submit_to_finance(db: Session, expense_id: int) -> Tuple[bool, Optional[str]]:
        """Submit manager-approved expense to finance"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            if expense.status != ExpenseStatusEnum.MANAGER_APPROVED:
                return False, "Expense must be manager-approved first"
            
            # Check if finance approval already exists
            existing = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.FINANCE
            ).first()
            
            if existing:
                return False, "Finance approval already exists"
            
            # Create finance approval record
            finance_approval = ExpenseApproval(
                expense_id=expense_id,
                approval_role=ApprovalRole.FINANCE,
                decision=ApprovalDecision.PENDING
            )
            
            db.add(finance_approval)
            db.commit()
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error submitting to finance: {str(e)}"
    
    @staticmethod
    def approve_expense_finance(
        db: Session,
        expense_id: int,
        approved_by: int,
        comments: str = None
    ) -> Tuple[bool, Optional[str]]:
        """Finance approves and marks as paid"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            finance_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.FINANCE
            ).first()
            
            if not finance_approval:
                return False, "No pending finance approval found"
            
            finance_approval.decision = ApprovalDecision.APPROVED
            finance_approval.approved_by = approved_by
            finance_approval.comments = comments
            finance_approval.decided_at = datetime.utcnow()
            
            # Mark as paid
            expense.status = ExpenseStatusEnum.PAID
            
            AuditLogger.log(
                db=db,
                entity_type="approval",
                entity_id=finance_approval.id,
                action="finance_approved",
                performed_by=approved_by,
                new_value={"decision": "APPROVED", "status": "PAID"}
            )
            
            db.commit()
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error approving expense: {str(e)}"
    
    @staticmethod
    def approve_expense_finance_after_verification(
        db: Session,
        expense_id: int,
        approved_by: int,
        llm_analysis: str = None,
        comments: str = None
    ) -> Tuple[bool, Optional[str]]:
        """Finance approves expense after LLM verification of bill genuineness"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"[APPROVAL] Starting approve_expense_finance_after_verification for expense {expense_id}")
            
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            # Check expense is in the correct status
            logger.info(f"[APPROVAL] Expense status = {expense.status}, type = {type(expense.status)}")
            if str(expense.status) != str(ExpenseStatusEnum.MANAGER_APPROVED_FOR_VERIFICATION):
                logger.error(f"[APPROVAL] Status check failed: {str(expense.status)} != {str(ExpenseStatusEnum.MANAGER_APPROVED_FOR_VERIFICATION)}")
                return False, f"Expense must be in MANAGER_APPROVED_FOR_VERIFICATION status, currently: {expense.status}"
            
            # Get finance approval record (or create one)
            logger.info(f"[APPROVAL] Looking for finance approval for expense {expense_id}")
            finance_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.FINANCE
            ).first()
            
            logger.info(f"[APPROVAL] finance_approval found: {finance_approval is not None}, decision: {finance_approval.decision if finance_approval else 'N/A'}")
            
            if not finance_approval:
                logger.info(f"[APPROVAL] Creating new finance approval record")
                finance_approval = ExpenseApproval(
                    expense_id=expense_id,
                    approval_role=ApprovalRole.FINANCE
                )
                db.add(finance_approval)
            
            # Debug logging for enum comparison
            decision_value = str(finance_approval.decision)
            pending_value = str(ApprovalDecision.PENDING)
            logger.info(f"[APPROVAL] decision={decision_value}, pending={pending_value}, are_equal={decision_value == pending_value}")
            
            if str(finance_approval.decision) != str(ApprovalDecision.PENDING):
                logger.error(f"[APPROVAL] Decision check failed, returning error")
                return False, f"Finance approval already processed (decision={str(finance_approval.decision)})"
            
            logger.info(f"[APPROVAL] Moving to update approval")
            finance_approval.approved_by = approved_by
            finance_approval.comments = comments
            finance_approval.decided_at = datetime.utcnow()
            
            # Update expense status to FINANCE_APPROVED (final approval)
            expense.status = ExpenseStatusEnum.FINANCE_APPROVED
            
            # Store LLM analysis if provided
            if llm_analysis:
                expense.policy_check_result = {"llm_analysis": llm_analysis, "verified": True}
            
            # Log action
            AuditLogger.log(
                db=db,
                entity_type="approval",
                entity_id=finance_approval.id,
                action="finance_approved_after_verification",
                performed_by=approved_by,
                new_value={"decision": "APPROVED", "comments": comments, "llm_analysis": llm_analysis, "status": "FINANCE_APPROVED"}
            )
            
            db.commit()
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error approving expense in Finance: {str(e)}"

    @staticmethod
    def reject_expense_finance_after_verification(
        db: Session,
        expense_id: int,
        rejected_by: int,
        llm_analysis: str = None,
        comments: str = None
    ) -> Tuple[bool, Optional[str]]:
        """Finance rejects expense after LLM verification reveals issues"""
        try:
            expense = db.query(Expense).filter(Expense.id == expense_id).first()
            if not expense:
                return False, "Expense not found"
            
            # Check expense is in the correct status
            if str(expense.status) != str(ExpenseStatusEnum.MANAGER_APPROVED_FOR_VERIFICATION):
                return False, f"Expense must be in MANAGER_APPROVED_FOR_VERIFICATION status, currently: {expense.status}"
            
            # Get finance approval record (or create one)
            finance_approval = db.query(ExpenseApproval).filter(
                ExpenseApproval.expense_id == expense_id,
                ExpenseApproval.approval_role == ApprovalRole.FINANCE
            ).first()
            
            if not finance_approval:
                finance_approval = ExpenseApproval(
                    expense_id=expense_id,
                    approval_role=ApprovalRole.FINANCE
                )
                db.add(finance_approval)
            
            if finance_approval.decision != ApprovalDecision.PENDING:
                return False, "Finance approval already processed"
            
            # Update approval
            finance_approval.decision = ApprovalDecision.REJECTED
            finance_approval.approved_by = rejected_by
            finance_approval.comments = comments
            finance_approval.decided_at = datetime.utcnow()
            
            # Update expense status
            expense.status = ExpenseStatusEnum.FINANCE_REJECTED
            
            # Store rejection remarks with LLM analysis
            rejection_remarks = []
            if llm_analysis:
                rejection_remarks.append(f"LLM Analysis: {llm_analysis}")
            if comments:
                rejection_remarks.append(f"Finance Comment: {comments}")
            
            expense.rejection_remarks = "\n".join(rejection_remarks) if rejection_remarks else "Rejected by Finance after verification"
            
            # Store LLM analysis
            if llm_analysis:
                expense.policy_check_result = {"llm_analysis": llm_analysis, "verified": False, "rejection_reason": comments}
            
            # Log action
            AuditLogger.log(
                db=db,
                entity_type="approval",
                entity_id=finance_approval.id,
                action="finance_rejected_after_verification",
                performed_by=rejected_by,
                new_value={"decision": "REJECTED", "comments": comments, "llm_analysis": llm_analysis, "status": "FINANCE_REJECTED", "rejection_remarks": expense.rejection_remarks}
            )
            
            db.commit()
            return True, None
        
        except Exception as e:
            db.rollback()
            return False, f"Error rejecting expense in Finance: {str(e)}"
