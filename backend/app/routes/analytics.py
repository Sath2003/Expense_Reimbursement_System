from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/spending")
async def get_spending_analytics(
    period: str = Query("month", regex="^(week|month|quarter|year)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get spending analytics for the organization.
    Only accessible to HR and Manager roles.
    
    Parameters:
    - period: Time period for analytics (week, month, quarter, year)
    
    Returns analytics including top spenders, category breakdown, and metrics.
    """
    user_role = getattr(current_user.role, "role_name", "").lower() if current_user.role else ""
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

    # Query all expenses (not just approved) for comprehensive analytics
    expenses = db.query(Expense).filter(
        Expense.expense_date >= start_date
    ).all()

    if not expenses:
        return {
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": today.isoformat(),
            "total_amount": 0.0,
            "expense_count": 0,
            "average_amount": 0.0,
            "unique_employees": 0,
            "approval_rate": 0.0,
            "top_spenders": [],
            "category_breakdown": [],
            "status_distribution": {"approved": 0, "pending": 0, "rejected": 0},
            "monthly_trend": [],
            "employee_spending": []
        }

    # Calculate top spenders
    spender_data = {}
    for expense in expenses:
        user = db.query(User).filter(User.id == expense.user_id).first()
        if not user:
            continue

        key = (user.id, f"{user.first_name} {user.last_name}", user.employee_id or "N/A")
        if key not in spender_data:
            spender_data[key] = {
                "total": 0.0,
                "count": 0,
                "approved": 0,
            }
        spender_data[key]["total"] += float(expense.amount)
        spender_data[key]["count"] += 1
        if expense.status == "FINANCE_APPROVED":
            spender_data[key]["approved"] += 1

    top_spenders = [
        {
            "employee_id": employee_id,
            "employee_name": name,
            "total_amount": round(data["total"], 2),
            "expense_count": data["count"],
            "approved_count": data["approved"],
            "approval_rate": (data["approved"] / data["count"] * 100) if data["count"] > 0 else 0
        }
        for (_user_id, name, employee_id), data in spender_data.items()
    ]
    top_spenders.sort(key=lambda x: x["total_amount"], reverse=True)

    # Calculate category breakdown (using category name)
    category_data = {}
    for expense in expenses:
        category_name = getattr(expense.category, "name", "Uncategorized") if expense.category else "Uncategorized"
        if category_name not in category_data:
            category_data[category_name] = {"total": 0.0, "count": 0}
        category_data[category_name]["total"] += float(expense.amount)
        category_data[category_name]["count"] += 1

    total_amount = sum(float(e.amount) for e in expenses)
    category_breakdown = [
        {
            "category": category,
            "total_amount": round(data["total"], 2),
            "count": data["count"],
            "percentage": round((data["total"] / total_amount * 100), 1) if total_amount > 0 else 0
        }
        for category, data in category_data.items()
    ]
    category_breakdown.sort(key=lambda x: x["total_amount"], reverse=True)

    # Calculate status distribution
    status_counts = {}
    for expense in expenses:
        status = expense.status or "UNKNOWN"
        status_counts[status] = status_counts.get(status, 0) + 1

    # Calculate monthly trend
    monthly_data = {}
    for expense in expenses:
        month_key = expense.expense_date.strftime("%Y-%m")
        if month_key not in monthly_data:
            monthly_data[month_key] = 0.0
        monthly_data[month_key] += float(expense.amount)

    monthly_trend = [
        {
            "month": datetime.strptime(month, "%Y-%m").strftime("%b %Y"),
            "total_amount": round(amount, 2)
        }
        for month, amount in sorted(monthly_data.items())
    ]

    # Calculate overall metrics
    total_expenses = len(expenses)
    total_spent = sum(float(e.amount) for e in expenses)
    average_expense = total_spent / total_expenses if total_expenses > 0 else 0.0
    unique_employees = len(set(e.user_id for e in expenses))
    approved_expenses = len([e for e in expenses if e.status == "FINANCE_APPROVED"])
    approval_rate = (approved_expenses / total_expenses * 100) if total_expenses > 0 else 0.0

    employee_spending = top_spenders if user_role in ["finance", "hr"] else None

    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": today.isoformat(),
        "total_amount": round(total_spent, 2),
        "expense_count": total_expenses,
        "average_amount": round(average_expense, 2),
        "unique_employees": unique_employees,
        "approval_rate": round(approval_rate, 2),
        "top_spenders": top_spenders,
        "category_breakdown": category_breakdown,
        "status_distribution": {
            "approved": status_counts.get("FINANCE_APPROVED", 0),
            "pending": status_counts.get("SUBMITTED", 0) + status_counts.get("MANAGER_APPROVED", 0),
            "rejected": status_counts.get("MANAGER_REJECTED", 0) + status_counts.get("FINANCE_REJECTED", 0)
        },
        "monthly_trend": monthly_trend,
        "employee_spending": employee_spending
    }
