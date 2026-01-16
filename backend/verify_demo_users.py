#!/usr/bin/env python3
"""
Verify and activate demo users for login
"""
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.user import User

def verify_users():
    db = SessionLocal()
    
    # Demo users to verify
    demo_emails = [
        "sathviknbmath@gmail.com",        # Employee
        "manager@expensehub.com",         # Manager
        "sarah.johnson@expensehub.com"    # Finance
    ]
    
    for email in demo_emails:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"\nUpdating user: {email}")
            print(f"  Before - Verified: {user.is_verified}, Active: {user.is_active}")
            
            # Mark as verified and active
            user.is_verified = True
            user.is_active = True
            db.commit()
            db.refresh(user)
            
            print(f"  After  - Verified: {user.is_verified}, Active: {user.is_active}")
        else:
            print(f"\n❌ User not found: {email}")
    
    db.close()
    print("\n✅ All demo users verified and activated!")

if __name__ == "__main__":
    verify_users()
