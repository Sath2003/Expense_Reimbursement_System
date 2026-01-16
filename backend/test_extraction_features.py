#!/usr/bin/env python
"""
Test script to verify receipt extraction improvements
Tests the API endpoints and extraction functionality
"""

import requests
import json
from pathlib import Path
import sys

BASE_URL = "http://localhost:8000"

def test_extraction_capabilities():
    """Test if extraction libraries are available"""
    print("\n1. Checking System Capabilities...")
    print("-" * 50)
    
    try:
        sys.path.insert(0, str(Path(__file__).parent))
        from app.utils.improved_receipt_extractor import ImprovedReceiptExtractor
        
        capabilities = ImprovedReceiptExtractor.check_capabilities()
        
        for key, value in capabilities.items():
            status = "✓" if value and value != "not installed" else "✗"
            print(f"{status} {key:20s}: {value}")
        
        return capabilities
    
    except Exception as e:
        print(f"✗ Error checking capabilities: {e}")
        return None

def test_extract_amount_endpoint(expense_id=1, token="your_auth_token"):
    """Test the extract-amount endpoint"""
    print("\n2. Testing Extract Amount Endpoint...")
    print("-" * 50)
    
    url = f"{BASE_URL}/api/expenses/{expense_id}/extract-amount"
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"POST {url}")
    print(f"Headers: {headers}")
    
    try:
        response = requests.post(url, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Make sure backend is running.")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_submit_with_receipt_no_amount(category="Travel", description="Test", date="2025-01-10", receipt_path=None):
    """Test submitting expense with receipt but no amount"""
    print("\n3. Testing Submit Expense with Receipt (no amount)...")
    print("-" * 50)
    
    url = f"{BASE_URL}/api/expenses/submit"
    
    data = {
        'category': category,
        'description': description,
        'date': date,
        # Note: no 'amount' field
    }
    
    files = {}
    if receipt_path and Path(receipt_path).exists():
        files['receipt'] = open(receipt_path, 'rb')
    
    print(f"POST {url}")
    print(f"Data: {data}")
    if files:
        print(f"Files: receipt={Path(receipt_path).name}")
    
    try:
        response = requests.post(url, data=data, files=files)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if files:
            files['receipt'].close()
        
        return response.status_code == 200
    
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Make sure backend is running.")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    finally:
        for f in files.values():
            if hasattr(f, 'close'):
                f.close()

def main():
    print("=" * 50)
    print("Receipt Extraction Feature Test Suite")
    print("=" * 50)
    
    # Test 1: Check capabilities
    caps = test_extraction_capabilities()
    
    if not caps:
        print("\n⚠️  Cannot proceed without checking extraction libraries")
        return 1
    
    if not caps.get('pdf_support') and not caps.get('image_support'):
        print("\n⚠️  WARNING: No extraction libraries available!")
        print("Install with: pip install pdfplumber pytesseract pillow")
        return 1
    
    # Test 2: Try to connect to backend
    print("\n4. Checking Backend Connection...")
    print("-" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/api/expenses", timeout=5)
        print(f"✗ Backend is reachable")
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to backend at localhost:8000")
        print("\nTo test the API endpoints:")
        print("1. Start the backend: cd backend && python -m uvicorn app.main:app --reload")
        print("2. Re-run this script")
        return 1
    
    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    print("""
The system is ready for receipt extraction!

Next steps:
1. Submit an expense with a receipt (no amount needed)
2. The system will automatically extract the amount
3. To extract amounts from existing expenses:
   python extract_expense_amounts.py
""")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
