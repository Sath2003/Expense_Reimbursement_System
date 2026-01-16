#!/usr/bin/env python3
"""
Script to find and delete an expense by attachment file name
"""

import sys
sys.path.insert(0, '/d/Projects/Expense_Reimbursement_System/backend')

from app.database import SessionLocal
from app.models.expense import Expense, ExpenseAttachment
import os

def delete_expense_by_attachment_name(filename):
    db = SessionLocal()
    try:
        # Find the attachment by file name
        attachment = db.query(ExpenseAttachment).filter(
            ExpenseAttachment.file_name.ilike(f"%{filename}%")
        ).first()
        
        if not attachment:
            print(f"\n❌ No attachment found with name containing '{filename}'")
            return False
        
        # Get the associated expense
        expense = db.query(Expense).filter(Expense.id == attachment.expense_id).first()
        
        if not expense:
            print(f"\n❌ No expense found for this attachment")
            return False
        
        print(f"\n✓ Found expense:")
        print(f"  ID: {expense.id}")
        print(f"  Description: {expense.description}")
        print(f"  Amount: ₹{expense.amount}")
        print(f"  Status: {expense.status}")
        print(f"  Created: {expense.created_at}")
        print(f"  Attachments: {len(expense.attachments)}")
        
        # Delete attachments first
        for att in expense.attachments:
            print(f"  Deleting attachment: {att.file_name}")
            if os.path.exists(att.file_path):
                try:
                    os.remove(att.file_path)
                    print(f"    ✓ File deleted: {att.file_path}")
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
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python delete_expense_by_file.py '<file_name>'")
        print("Example: python delete_expense_by_file.py 'Miscellaneous_Expense_Bill_V_Adithya'")
        sys.exit(1)
    
    file_name = sys.argv[1]
    delete_expense_by_attachment_name(file_name)
