from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/spending")
async def get_spending_analytics(
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get spending analytics for the organization.
    Only accessible to HR and Manager roles.
    
    Parameters:
    - period: Time period for analytics (week, month, quarter, year)
    
    Returns analytics including top spenders, category breakdown, and metrics.
    """
    # Check authorization
    user_role = current_user.get("role", "").lower()
    if user_role not in ["hr", "manager", "finance"]:
        raise HTTPException(
            status_code=403,
            detail="Only HR, Manager, and Finance roles can access analytics"
        )

    # Calculate date range based on period
    today = datetime.now().date()
    if period == "week":
        start_date = today - timedelta(days=today.weekday())
    elif period == "month":
        start_date = today.replace(day=1)
    elif period == "quarter":
        quarter_start_month = ((today.month - 1) // 3) * 3 + 1
        start_date = today.replace(month=quarter_start_month, day=1)
    else:  # year
        start_date = today.replace(month=1, day=1)

    # Query approved expenses within the period
    expenses = db.query(Expense).filter(
        and_(
            Expense.expense_date >= start_date,
            Expense.approval_status == "approved"
        )
    ).all()

    # Calculate top spenders
    spender_data = {}
    for expense in expenses:
        user = db.query(User).filter(User.id == expense.user_id).first()
        if not user:
            continue

        key = (user.id, user.name, user.department or "N/A")
        if key not in spender_data:
            spender_data[key] = {
                "total": 0,
                "count": 0,
                "amounts": []
            }
        spender_data[key]["total"] += float(expense.amount)
        spender_data[key]["count"] += 1
        spender_data[key]["amounts"].append(float(expense.amount))

    top_spenders = [
        {
            "employee_id": user_id,
            "employee_name": name,
            "department": department,
            "total_spent": round(data["total"], 2),
            "expense_count": data["count"],
            "average_expense": round(data["total"] / data["count"], 2) if data["count"] > 0 else 0
        }
        for (user_id, name, department), data in spender_data.items()
    ]
    top_spenders.sort(key=lambda x: x["total_spent"], reverse=True)
    top_spenders = top_spenders[:10]  # Top 10

    # Calculate category breakdown
    category_data = {}
    for expense in expenses:
        category = expense.category or "Uncategorized"
        if category not in category_data:
            category_data[category] = {"total": 0, "count": 0}
        category_data[category]["total"] += float(expense.amount)
        category_data[category]["count"] += 1

    total_amount = sum(e.amount for e in expenses)
    category_breakdown = [
        {
            "category_name": category,
            "total_amount": round(data["total"], 2),
            "count": data["count"],
            "percentage": round((data["total"] / total_amount * 100), 1) if total_amount > 0 else 0
        }
        for category, data in category_data.items()
    ]
    category_breakdown.sort(key=lambda x: x["total_amount"], reverse=True)

    # Calculate overall metrics
    total_expenses = len(expenses)
    total_spent = sum(e.amount for e in expenses)
    average_expense = total_spent / total_expenses if total_expenses > 0 else 0
    active_employees = len(set(e.user_id for e in expenses))

    return {
        "top_spenders": top_spenders,
        "category_breakdown": category_breakdown,
        "total_expenses": total_expenses,
        "total_amount": round(total_spent, 2),
        "average_expense": round(average_expense, 2),
        "active_employees": active_employees,
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": today.isoformat()
    }
