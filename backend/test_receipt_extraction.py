#!/usr/bin/env python
"""
Utility script to test receipt amount extraction
Usage: python test_receipt_extraction.py <file_path>
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.utils.improved_receipt_extractor import ImprovedReceiptExtractor

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_receipt_extraction.py <file_path>")
        print("\nExample: python test_receipt_extraction.py receipt.pdf")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
    
    # Get file type
    file_type = file_path.split('.')[-1].lower()
    
    print(f"Testing receipt amount extraction...")
    print(f"File: {file_path}")
    print(f"Type: {file_type}")
    print("-" * 50)
    
    # Check capabilities
    capabilities = ImprovedReceiptExtractor.check_capabilities()
    print("System Capabilities:")
    for key, value in capabilities.items():
        status = "✓" if value and value != "not installed" else "✗"
        print(f"  {status} {key}: {value}")
    print()
    
    # Try extraction
    print("Extracting amount...")
    amount, confidence, message = ImprovedReceiptExtractor.extract_amount(file_path, file_type)
    
    print(f"Result: {message}")
    if amount:
        print(f"Amount: ₹{amount:.2f}")
        print(f"Confidence: {confidence}")
    else:
        print("No amount could be extracted")
    
    return 0 if amount else 1

if __name__ == "__main__":
    sys.exit(main())
