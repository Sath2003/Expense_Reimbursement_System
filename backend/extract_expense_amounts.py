#!/usr/bin/env python
"""
Utility script to extract amounts from receipts for all expenses with placeholder amounts.
This helps fix the issue where expenses were submitted with amount=0 and receipts were attached.

Usage: python extract_expense_amounts.py
"""

import sys
import os
from pathlib import Path
from sqlalchemy.orm import Session
from decimal import Decimal

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.expense import Expense
from app.models.user import User
from app.utils.improved_receipt_extractor import ImprovedReceiptExtractor
from app.utils.audit_logger import AuditLogger

def extract_expense_amounts(db: Session, min_amount: float = 2.00):
    """
    Extract amounts from receipts for expenses with low amounts.
    
    Args:
        db: Database session
        min_amount: Only process expenses with amount <= this value (default 2.00)
    """
    print(f"Searching for expenses with amount <= ₹{min_amount:.2f} that have receipts...")
    
    # Find expenses with low amounts that have attachments
    expenses = db.query(Expense).filter(
        Expense.amount <= Decimal(str(min_amount)),
        Expense.attachments != None
    ).all()
    
    if not expenses:
        print(f"No expenses found with amount <= ₹{min_amount:.2f}")
        return
    
    print(f"\nFound {len(expenses)} expenses to process")
    print("-" * 70)
    
    successful = 0
    failed = 0
    
    for expense in expenses:
        try:
            if not expense.attachments:
                print(f"\n[SKIP] Expense #{expense.id}: No attachments")
                continue
            
            # Try the first attachment
            attachment = expense.attachments[0]
            file_path = attachment.file_path
            
            if not os.path.exists(file_path):
                print(f"\n[FAIL] Expense #{expense.id}: File not found - {attachment.file_name}")
                failed += 1
                continue
            
            file_type = attachment.file_name.split('.')[-1].lower()
            
            print(f"\n[PROCESSING] Expense #{expense.id}")
            print(f"  File: {attachment.file_name}")
            print(f"  Current Amount: ₹{expense.amount:.2f}")
            
            # Extract amount
            extracted_amount, confidence, message = ImprovedReceiptExtractor.extract_amount(file_path, file_type)
            
            if not extracted_amount or extracted_amount <= 0:
                print(f"  [FAIL] {message}")
                failed += 1
                continue
            
            # Update expense
            old_amount = expense.amount
            expense.amount = Decimal(str(extracted_amount))
            db.commit()
            db.refresh(expense)
            
            # Log the change
            AuditLogger.log(
                db=db,
                entity_type="expense",
                entity_id=expense.id,
                action="amount_extracted_from_receipt",
                performed_by=1,  # System action
                old_value={"amount": str(old_amount)},
                new_value={"amount": str(extracted_amount), "confidence": confidence}
            )
            
            print(f"  [SUCCESS] Amount updated to ₹{extracted_amount:.2f} ({confidence} confidence)")
            successful += 1
            
        except Exception as e:
            print(f"\n[ERROR] Expense #{expense.id}: {str(e)}")
            failed += 1
    
    print("\n" + "-" * 70)
    print(f"Results: {successful} successful, {failed} failed")
    print(f"Total processed: {successful + failed}")

def main():
    print("Expense Amount Extraction Utility")
    print("=" * 70)
    
    # Check OCR capabilities
    from app.utils.improved_receipt_extractor import ImprovedReceiptExtractor
    capabilities = ImprovedReceiptExtractor.check_capabilities()
    
    print("\nSystem Capabilities:")
    for key, value in capabilities.items():
        status = "✓" if value and value != "not installed" else "✗"
        print(f"  {status} {key}: {value}")
    
    if not capabilities['pdf_support'] and not capabilities['image_support']:
        print("\n⚠️  WARNING: No PDF or image extraction libraries installed!")
        print("Install them with: pip install pdfplumber pytesseract pillow")
        return 1
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Ask user for confirmation
        print("\n" + "-" * 70)
        response = input("This will update expense amounts from receipts. Continue? (yes/no): ")
        
        if response.lower() != 'yes':
            print("Cancelled.")
            return 0
        
        # Run extraction
        extract_expense_amounts(db)
        
        return 0
    
    except KeyboardInterrupt:
        print("\nCancelled by user")
        return 1
    
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())
