from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.expense import Expense, ExpenseCategory, TransportationType
from app.models.user import User, EmployeeGrade
from app.database import SessionLocal
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
from datetime import date

class PolicyCheckResult:
    def __init__(self):
        self.is_compliant: bool = True
        self.violations: List[str] = []
        self.allowed_amount: Optional[Decimal] = None
        self.policy_details: Optional[Dict] = None

class PolicyService:
    @staticmethod
    def check_expense_policy(
        db: Session,
        user: User,
        category_id: int,
        amount: Decimal,
        expense_date: date,
        transport_type_id: Optional[int] = None
    ) -> PolicyCheckResult:
        """
        Check if expense complies with user's grade-based policies
        """
        result = PolicyCheckResult()
        
        # Get user's grade
        if not user.grade_id:
            result.is_compliant = True  # No grade = no policy check
            return result
        
        # Check expense category policy
        category_policy = db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
        if not category_policy:
            result.violations.append("Invalid expense category")
            result.is_compliant = False
            return result
        
        # Get policy for grade and category
        from app.database import Base
        # Note: expense_policies table exists but model may not be imported
        policy_query = """
            SELECT max_amount, frequency, requires_approval 
            FROM expense_policies 
            WHERE grade_id = :grade_id AND category_id = :category_id
        """
        policy = db.execute(policy_query, {
            "grade_id": user.grade_id,
            "category_id": category_id
        }).first()
        
        if policy:
            max_amount, frequency, requires_approval = policy
            if max_amount and amount > Decimal(str(max_amount)):
                result.violations.append(f"Amount ${amount:.2f} exceeds limit of ${max_amount:.2f}")
                result.allowed_amount = Decimal(str(max_amount))
                result.is_compliant = False
            
            # TODO: Check frequency (daily/monthly) based on existing expenses
            # This would require counting expenses in the period
        
        # Check transportation policy if applicable
        if transport_type_id:
            transport_policy_query = """
                SELECT allowed_class, max_amount, requires_ticket 
                FROM transportation_policies 
                WHERE grade_id = :grade_id AND transport_type_id = :transport_type_id
            """
            transport_policy = db.execute(transport_policy_query, {
                "grade_id": user.grade_id,
                "transport_type_id": transport_type_id
            }).first()
            
            if transport_policy:
                allowed_class, max_amount, requires_ticket = transport_policy
                if max_amount and amount > Decimal(str(max_amount)):
                    result.violations.append(f"Transport amount ${amount:.2f} exceeds limit of ${max_amount:.2f}")
                    result.is_compliant = False
        
        result.policy_details = {
            "grade_id": user.grade_id,
            "category_id": category_id,
            "transport_type_id": transport_type_id,
            "checked_amount": float(amount)
        }
        
        return result
    
    @staticmethod
    def get_user_policies(db: Session, user: User) -> List[Dict]:
        """
        Get all applicable policies for a user
        """
        if not user.grade_id:
            return []
        
        policies_query = """
            SELECT ec.name as category_name, ep.max_amount, ep.frequency, ep.requires_approval
            FROM expense_policies ep
            JOIN expense_categories ec ON ep.category_id = ec.id
            WHERE ep.grade_id = :grade_id
        """
        
        policies = db.execute(policies_query, {"grade_id": user.grade_id}).fetchall()
        
        result = []
        for policy in policies:
            result.append({
                "category": policy[0],
                "max_amount": float(policy[1]) if policy[1] else None,
                "frequency": policy[2],
                "requires_approval": policy[3]
            })
        
        return result
