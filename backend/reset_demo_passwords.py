#!/usr/bin/env python3
"""
Reset demo user passwords to known values for testing
"""
import sys
sys.path.insert(0, '/app')

from app.utils.security import hash_password
from app.database import SessionLocal
from app.models.user import User

def reset_passwords():
    db = SessionLocal()
    
    # Password to use for all demo users
    test_password = "password123"
    password_hash = hash_password(test_password)
    
    # Demo users to update
    demo_emails = [
        "sarah.johnson@expensehub.com",  # Finance/HR user
        "manager@expensehub.com",         # Manager user
        "sath21341@gmail.com"             # Employee user
    ]
    
    print(f"Password hash for '{test_password}': {password_hash}\n")
    
    for email in demo_emails:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.password = password_hash
            db.commit()
            print(f"✅ Updated password for {email}")
        else:
            print(f"❌ User not found: {email}")
    
    db.close()
    print(f"\n✅ All demo users can now login with password: {test_password}")

if __name__ == "__main__":
    reset_passwords()
