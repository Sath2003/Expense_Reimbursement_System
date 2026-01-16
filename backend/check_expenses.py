#!/usr/bin/env python3
"""
Quick script to check current expenses in the database and their amounts
"""

import sys
sys.path.insert(0, '/d/Projects/Expense_Reimbursement_System/backend')

from app.database import SessionLocal
from app.models.expense import Expense
from sqlalchemy import text

def check_expenses():
    db = SessionLocal()
    try:
        # Get all expenses
        expenses = db.query(Expense).all()
        
        print(f"\n{'='*80}")
        print(f"Total expenses in database: {len(expenses)}")
        print(f"{'='*80}\n")
        
        for expense in expenses:
            print(f"ID: {expense.id}")
            print(f"  Amount: ₹{expense.amount}")
            print(f"  Description: {expense.description}")
            print(f"  Category: {expense.category_id}")
            print(f"  Status: {expense.status}")
            print(f"  Created: {expense.created_at}")
            print(f"  Attachments: {len(expense.attachments)}")
            if expense.attachments:
                for att in expense.attachments:
                    print(f"    - {att.file_name}")
            print()
        
        # Check for zero amounts
        zero_amount_expenses = [e for e in expenses if e.amount == 0]
        if zero_amount_expenses:
            print(f"\n⚠️  WARNING: {len(zero_amount_expenses)} expenses have ₹0 amount")
            print("These need manual amounts or receipt extraction.\n")
    
    finally:
        db.close()

if __name__ == '__main__':
    check_expenses()
