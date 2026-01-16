#!/usr/bin/env python3
"""
Script to find and delete an expense by description/name
"""

import sys
sys.path.insert(0, '/d/Projects/Expense_Reimbursement_System/backend')

from app.database import SessionLocal
from app.models.expense import Expense
import os

def delete_expense_by_name(name):
    db = SessionLocal()
    try:
        # Find the expense by description
        expense = db.query(Expense).filter(
            Expense.description.ilike(f"%{name}%")
        ).first()
        
        if not expense:
            print(f"\n❌ No expense found with name containing '{name}'")
            return False
        
        print(f"\n✓ Found expense:")
        print(f"  ID: {expense.id}")
        print(f"  Description: {expense.description}")
        print(f"  Amount: ₹{expense.amount}")
        print(f"  Status: {expense.status}")
        print(f"  Created: {expense.created_at}")
        print(f"  Attachments: {len(expense.attachments)}")
        
        # Delete attachments first
        for attachment in expense.attachments:
            print(f"  Deleting attachment: {attachment.file_name}")
            if os.path.exists(attachment.file_path):
                try:
                    os.remove(attachment.file_path)
                    print(f"    ✓ File deleted: {attachment.file_path}")
                except Exception as e:
                    print(f"    ⚠️  Failed to delete file: {e}")
        
        # Delete the expense
        db.delete(expense)
        db.commit()
        
        print(f"\n✅ Expense successfully deleted!")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error deleting expense: {e}")
        return False
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python delete_expense_by_name.py '<expense_name>'")
        print("Example: python delete_expense_by_name.py 'Micellanous'")
        sys.exit(1)
    
    expense_name = sys.argv[1]
    delete_expense_by_name(expense_name)
