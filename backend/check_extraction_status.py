#!/usr/bin/env python3
"""
Diagnostic script to check receipt extraction capabilities
"""

import sys
sys.path.insert(0, '/d/Projects/Expense_Reimbursement_System/backend')

from app.utils.improved_receipt_extractor import ImprovedReceiptExtractor

print("\n" + "="*80)
print("RECEIPT EXTRACTION CAPABILITIES CHECK")
print("="*80 + "\n")

capabilities = ImprovedReceiptExtractor.check_capabilities()

print("Available Libraries:")
print(f"  ✓ PDF Support (pdfplumber): {capabilities['pdf_support']}")
print(f"  ✓ Image Support (Pillow):   {capabilities['image_support']}")
print(f"  ✓ OCR Support (pytesseract): {capabilities['ocr_support']}")

print("\n" + "="*80)

if not capabilities['ocr_support']:
    print("\n⚠️  TESSERACT OCR IS NOT INSTALLED\n")
    print("To enable automatic amount extraction from images and PDFs, you need to:")
    print("\n1. INSTALL TESSERACT OCR")
    print("   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
    print("   - Mac: brew install tesseract")
    print("   - Linux: sudo apt-get install tesseract-ocr")
    print("\n2. SET PYTESSERACT PATH (Windows only, after installation)")
    print("   Add to backend code or environment:")
    print("   import pytesseract")
    print("   pytesseract.pytesseract.pytesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'")
    print("\n3. TEST THE INSTALLATION")
    print("   python test_receipt_extraction.py <path_to_receipt_file>")
else:
    print("\n✅ TESSERACT IS INSTALLED AND WORKING\n")
    print("Receipt extraction should work for:")
    print("  • PDFs with text (text-based extraction)")
    print("  • Images with printed text (OCR extraction)")
    print("  • Screenshots of receipts/bills")

print("\n" + "="*80 + "\n")
