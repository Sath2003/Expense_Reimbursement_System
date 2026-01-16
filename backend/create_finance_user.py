#!/usr/bin/env python3
"""
Script to create a permanent finance user in the expense reimbursement system
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, RoleEnum
from app.utils.security import hash_password
from datetime import datetime

def create_finance_user():
    """Create a permanent finance user"""
    db = SessionLocal()
    
    try:
        # Check if finance user already exists
        existing_finance = db.query(User).filter(User.email == "sarah.johnson@expensehub.com").first()
        if existing_finance:
            print("✓ Finance user already exists with email: sarah.johnson@expensehub.com")
            print(f"  User ID: {existing_finance.id}")
            print(f"  Name: {existing_finance.first_name} {existing_finance.last_name}")
            print(f"  Role: {existing_finance.role.role_name if existing_finance.role else 'N/A'}")
            
            # Update password if needed
            if not verify_password("Finance@123", existing_finance.password):
                existing_finance.password = hash_password("Finance@123")
                existing_finance.is_verified = True
                existing_finance.is_active = True
                db.commit()
                db.refresh(existing_finance)
                print(f"\n✓ Password updated to: Finance@123")
            
            return existing_finance.id
        
        # Create new finance user
        finance = User(
            first_name="Sarah",
            last_name="Johnson",
            email="sarah.johnson@expensehub.com",
            phone_number="+91-9876543210",
            password=hash_password("Finance@123"),
            designation="Finance Manager",
            department="Finance",
            employee_id="FIN-001",
            role_id=3,  # Finance role
            is_active=True,
            is_verified=True,
            created_at=datetime.now()
        )
        
        db.add(finance)
        db.commit()
        db.refresh(finance)
        
        print(f"✓ Finance user created successfully!")
        print(f"  Email: sarah.johnson@expensehub.com")
        print(f"  Password: Finance@123")
        print(f"  User ID: {finance.id}")
        print(f"  Role: Finance (Can approve and track expenses)")
        
        return finance.id
        
    except Exception as e:
        print(f"✗ Error creating finance user: {str(e)}")
        db.rollback()
        return None
    finally:
        db.close()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    from app.utils.security import verify_password as verify_pwd
    try:
        return verify_pwd(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

if __name__ == "__main__":
    user_id = create_finance_user()
    sys.exit(0 if user_id else 1)
