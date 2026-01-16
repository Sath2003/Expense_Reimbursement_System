#!/usr/bin/env python3
"""
Create demo users for testing
"""
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.utils.security import hash_password

def create_demo_users():
    db = SessionLocal()
    
    # Get role IDs
    employee_role = db.query(Role).filter(Role.role_name == 'EMPLOYEE').first()
    manager_role = db.query(Role).filter(Role.role_name == 'MANAGER').first()
    finance_role = db.query(Role).filter(Role.role_name == 'FINANCE').first()
    
    if not all([employee_role, manager_role, finance_role]):
        print("❌ Roles not found in database!")
        db.close()
        return
    
    # Demo users to create
    demo_users = [
        {
            'email': 'sathviknbmath@gmail.com',
            'first_name': 'Sathvik',
            'last_name': 'N B',
            'password': 'Sath@2024',
            'role_id': employee_role.id,
            'employee_id': 'EMP001'
        },
        {
            'email': 'manager@expensehub.com',
            'first_name': 'Manager',
            'last_name': 'User',
            'password': 'password123',
            'role_id': manager_role.id,
            'employee_id': 'MGR001'
        },
        {
            'email': 'sarah.johnson@expensehub.com',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'password': 'password123',
            'role_id': finance_role.id,
            'employee_id': 'FIN001'
        }
    ]
    
    for user_data in demo_users:
        # Check if user already exists
        existing = db.query(User).filter(User.email == user_data['email']).first()
        if existing:
            print(f"\n⚠️  User already exists: {user_data['email']}")
            print(f"   Updating verified and active status...")
            existing.is_verified = True
            existing.is_active = True
            db.commit()
            print(f"   ✅ Updated!")
            continue
        
        # Create new user
        new_user = User(
            email=user_data['email'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            password=hash_password(user_data['password']),
            role_id=user_data['role_id'],
            employee_id=user_data['employee_id'],
            is_verified=True,
            is_active=True
        )
        
        db.add(new_user)
        print(f"\n✅ Created user: {user_data['email']}")
    
    db.commit()
    db.close()
    print("\n✅ All demo users ready for testing!")

if __name__ == "__main__":
    create_demo_users()
