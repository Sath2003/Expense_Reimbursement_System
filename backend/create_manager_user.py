#!/usr/bin/env python3
"""
Script to create a permanent manager user in the expense reimbursement system
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User, RoleEnum
from app.utils.password_utils import hash_password
from datetime import datetime

def create_manager_user():
    """Create a permanent manager user"""
    db = SessionLocal()
    
    try:
        # Check if manager already exists
        existing_manager = db.query(User).filter(User.email == "manager@expensehub.com").first()
        if existing_manager:
            print("✓ Manager user already exists with email: manager@expensehub.com")
            return existing_manager.id
        
        # Create new manager user
        manager = User(
            first_name="System",
            last_name="Manager",
            email="manager@expensehub.com",
            phone_number="+91-1234567890",
            password=hash_password("Manager@123"),  # Default password - should be changed
            designation="Expense Manager",
            department="Finance",
            employee_id="MGR-001",
            role_id=2,  # Manager role
            is_active=True,
            is_verified=True,
            created_at=datetime.now()
        )
        
        db.add(manager)
        db.commit()
        db.refresh(manager)
        
        print(f"✓ Manager user created successfully!")
        print(f"  Email: manager@expensehub.com")
        print(f"  Password: Manager@123 (Please change this on first login)")
        print(f"  User ID: {manager.id}")
        print(f"  Role: Manager (Can approve all expenses)")
        
        return manager.id
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error creating manager user: {str(e)}")
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_manager_user()
