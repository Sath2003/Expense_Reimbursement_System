from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User, RoleEnum
from app.models.expense import Expense, ExpenseStatusEnum
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/finance", tags=["finance"])

class EmployeeSpendingResponse(BaseModel):
    user_id: int
    employee_name: str
    total_spent: float
    expense_count: int
    approved_amount: float
    pending_amount: float

class FinanceStatsResponse(BaseModel):
    total_employees: int
    total_spending: float
    total_expenses: int
    average_per_employee: float

class EmployeeSpendingListResponse(BaseModel):
    employees: List[EmployeeSpendingResponse]
    stats: FinanceStatsResponse

@router.get("/employee-spending", response_model=EmployeeSpendingListResponse)
async def get_employee_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get spending summary for all employees (Finance role only)"""
    
    # Check if current user is Finance
    if current_user.role.role_name != RoleEnum.FINANCE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Finance users can view employee spending analytics"
        )
    
    try:
        # Get all employees with their spending
        employees_data = []
        
        # Get all users who submitted expenses
        users_with_expenses = db.query(User).join(Expense).distinct().all()
        
        total_spending = 0
        total_expenses = 0
        
        for user in users_with_expenses:
            # Get total spent by this employee (approved + pending)
            all_expenses = db.query(Expense).filter(
                Expense.user_id == user.id
            ).all()
            
            total_spent = sum(float(e.amount or 0) for e in all_expenses)
            expense_count = len(all_expenses)
            
            # Get approved amount
            approved_expenses = [e for e in all_expenses if e.status == ExpenseStatusEnum.APPROVED]
            approved_amount = sum(float(e.amount or 0) for e in approved_expenses)
            
            # Get pending amount (SUBMITTED or awaiting manager approval)
            pending_expenses = [e for e in all_expenses if e.status == ExpenseStatusEnum.SUBMITTED]
            pending_amount = sum(float(e.amount or 0) for e in pending_expenses)
            
            if total_spent > 0:  # Only include employees with expenses
                employee_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email
                employees_data.append({
                    "user_id": user.id,
                    "employee_name": employee_name,
                    "total_spent": total_spent,
                    "expense_count": expense_count,
                    "approved_amount": approved_amount,
                    "pending_amount": pending_amount,
                })
                
                total_spending += total_spent
                total_expenses += expense_count
        
        # Sort by total spent (descending)
        employees_data.sort(key=lambda x: x["total_spent"], reverse=True)
        
        # Calculate stats
        total_employees = len(employees_data)
        average_per_employee = total_spending / total_employees if total_employees > 0 else 0
        
        stats = FinanceStatsResponse(
            total_employees=total_employees,
            total_spending=total_spending,
            total_expenses=total_expenses,
            average_per_employee=average_per_employee,
        )
        
        return EmployeeSpendingListResponse(
            employees=employees_data,
            stats=stats
        )
        
    except Exception as e:
        print(f"Error fetching employee spending: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employee spending: {str(e)}"
        )
