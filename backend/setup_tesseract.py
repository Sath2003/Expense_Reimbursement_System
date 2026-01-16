#!/usr/bin/env python3
"""
Setup script to configure Tesseract path for pytesseract
Run this after installing Tesseract-OCR
"""

import os
import sys

# Common Tesseract installation paths
TESSERACT_PATHS = [
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    r'D:\Tesseract-OCR\tesseract.exe',
    '/usr/bin/tesseract',
    '/usr/local/bin/tesseract',
    '/opt/homebrew/bin/tesseract',  # Mac M1/M2
]

def find_tesseract():
    """Find Tesseract installation path"""
    for path in TESSERACT_PATHS:
        if os.path.exists(path):
            return path
    return None

def setup_tesseract():
    """Setup pytesseract with Tesseract path"""
    tesseract_path = find_tesseract()
    
    if not tesseract_path:
        print("\n❌ Tesseract-OCR not found in standard installation locations")
        print("\nTo install Tesseract:")
        print("  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
        print("  Mac: brew install tesseract")
        print("  Linux: sudo apt-get install tesseract-ocr")
        print("\nAfter installation, rerun this script.")
        return False
    
    print(f"\n✅ Found Tesseract at: {tesseract_path}")
    
    # Try to import and configure pytesseract
    try:
        import pytesseract
        pytesseract.pytesseract.pytesseract_cmd = tesseract_path
        print("✅ Successfully configured pytesseract")
        
        # Test it
        result = pytesseract.get_tesseract_version()
        print(f"✅ Tesseract version: {result}")
        return True
    except ImportError:
        print("❌ pytesseract not installed. Run: pip install pytesseract")
        return False
    except Exception as e:
        print(f"❌ Error configuring pytesseract: {e}")
        return False

if __name__ == '__main__':
    success = setup_tesseract()
    sys.exit(0 if success else 1)
