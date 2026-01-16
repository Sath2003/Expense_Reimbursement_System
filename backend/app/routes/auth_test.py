from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Placeholder for auth routes - will be implemented in frontend phase
# For now, we'll use user_id = 1 as default for testing

@router.post("/test-login")
async def test_login(db: Session = Depends(get_db)):
    """
    Test login endpoint to get a test user ID
    Returns user ID 1 (from init.sql sample data)
    """
    return {
        "user_id": 1,
        "message": "Using test user from database",
        "email": "amit.patel@expensemgmt.com",
        "role": "EMPLOYEE"
    }
