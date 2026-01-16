#!/usr/bin/env python3
"""
Truncate all expenses from the database
"""
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from sqlalchemy import text

def truncate_expenses():
    db = SessionLocal()
    try:
        print("Truncating expenses data...\n")
        
        # Disable foreign key checks temporarily
        db.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        
        # Delete from tables that might reference expenses
        tables_to_truncate = [
            "expense_approvals",
            "expense_attachments", 
            "expenses",
            "audit_logs"
        ]
        
        for table in tables_to_truncate:
            result = db.execute(text(f"DELETE FROM {table}"))
            count = result.rowcount
            print(f"✅ Truncated {table}: {count} records deleted")
        
        # Re-enable foreign key checks
        db.execute(text("SET FOREIGN_KEY_CHECKS=1"))
        
        # Reset auto-increment counters
        db.execute(text("ALTER TABLE expense_approvals AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE expense_attachments AUTO_INCREMENT = 1"))
        db.execute(text("ALTER TABLE expenses AUTO_INCREMENT = 1"))
        
        db.commit()
        print("\n✅ All expenses and related data truncated successfully!")
        print("✅ Auto-increment counters reset to 1")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error truncating expenses: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    truncate_expenses()
