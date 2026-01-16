# Quick Reference: Receipt Amount Extraction

## What's New

The expense system now automatically extracts amounts from receipts using:
- **PDF extraction** (text-based)
- **Image OCR** (optical character recognition)

## How It Works

### During Expense Submission
1. Upload receipt (PDF or image)
2. Leave amount field empty
3. System automatically extracts the amount
4. Expense is saved with extracted amount

### For Existing Expenses
```bash
# Extract amounts from all low-amount expenses with receipts
python backend/extract_expense_amounts.py

# Test extraction on a single file
python backend/test_receipt_extraction.py receipt.pdf
```

## Key Changes Made

### Backend
1. **New file**: `app/utils/improved_receipt_extractor.py`
   - Enhanced amount extraction with better patterns
   - Support for PDF and OCR-based image extraction
   - Confidence levels for accuracy assessment

2. **Updated**: `app/routes/expense.py`
   - Import and use new extractor
   - New endpoint: `POST /api/expenses/{expense_id}/extract-amount`
   - Better error messages for extraction failures
   - Requires amount to be provided if extraction fails

3. **New scripts**:
   - `test_receipt_extraction.py` - Test single file extraction
   - `extract_expense_amounts.py` - Batch extract for existing expenses
   - `test_extraction_features.py` - Comprehensive feature test

### Frontend
1. **Updated**: `app/submit-expense/page.tsx`
   - Only send amount if it's provided (not '0')
   - UI already shows extraction message
   - Error handling for extraction failures

## Testing

### Quick Test
```bash
# Check if libraries are installed
cd backend
python -c "from app.utils.improved_receipt_extractor import ImprovedReceiptExtractor; print(ImprovedReceiptExtractor.check_capabilities())"
```

### Test File Extraction
```bash
# Put a test receipt file in the project
python backend/test_receipt_extraction.py path/to/receipt.pdf

# Expected output shows:
# - File type detected
# - Libraries available
# - Extracted amount with confidence level
```

### Test API Endpoint
```bash
# After submitting an expense with a receipt
curl -X POST http://localhost:8000/api/expenses/1/extract-amount \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Supported Formats

### Files
- PDF (`.pdf`) - needs pdfplumber
- Images (`.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.webp`) - needs pytesseract

### Amount Patterns
- ₹ 1,000.50
- Rs. 1000.50
- INR 1000.50
- "Total: ₹500"
- "Grand Total: ₹500"

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "OCR not available" | Run: `pip install pytesseract pillow` |
| "PDF library not installed" | Run: `pip install pdfplumber` |
| Image extraction fails | Install Tesseract OCR (see RECEIPT_EXTRACTION_GUIDE.md) |
| Amount not extracted | Check if amount format matches supported patterns |
| "File not found" | Ensure receipt was uploaded and saved correctly |

## Environment Setup

For Windows (if needed):
```bash
# 1. Download Tesseract from:
# https://github.com/UB-Mannheim/tesseract/wiki

# 2. Install to default location
# 3. System will auto-detect, or set path:
set TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

For Linux:
```bash
sudo apt-get install tesseract-ocr
```

For macOS:
```bash
brew install tesseract
```

## API Reference

### Extract Amount from Existing Expense
```
POST /api/expenses/{expense_id}/extract-amount

Headers:
  Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "expense_id": 5,
  "extracted_amount": 1250.50,
  "confidence": "high",
  "message": "PDF extraction successful: ₹1250.50",
  "expense": { ... }
}

Response (400):
{
  "detail": "Could not extract amount from receipt. No amount pattern found in PDF"
}
```

## Next Steps

1. **Test the system**
   ```bash
   python backend/test_extraction_features.py
   ```

2. **Submit a test expense**
   - Go to "Submit Expense"
   - Upload a receipt
   - Leave amount blank
   - Submit and verify amount was extracted

3. **Batch process existing expenses** (if needed)
   ```bash
   python backend/extract_expense_amounts.py
   ```

## Documentation

Full details available in: `RECEIPT_EXTRACTION_GUIDE.md`

---

**Last Updated**: 2025-01-10
**Version**: 1.0 - Receipt Extraction Feature
