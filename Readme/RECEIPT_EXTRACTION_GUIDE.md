# Receipt Amount Extraction Guide

## Overview

The expense reimbursement system now includes automatic receipt amount extraction to simplify expense submission. Users can upload receipts (PDF or images) and the system will automatically extract the amount, eliminating the need to manually enter it.

## Features

### 1. **Automatic Amount Extraction During Submission**
When submitting an expense with a receipt but without an amount:
- The system automatically extracts the amount from the receipt
- Supports PDF receipts and image files (JPG, PNG, GIF, etc.)
- Uses OCR (Optical Character Recognition) for images
- Uses text extraction for PDFs

### 2. **Manual Amount Extraction for Existing Expenses**
For expenses that were already submitted with placeholder amounts:
- New endpoint: `POST /api/expenses/{expense_id}/extract-amount`
- Automatically extracts from the first attached receipt
- Updates the expense with the extracted amount
- Logs all changes for audit trail

### 3. **Enhanced Error Handling**
- Clear error messages if extraction fails
- User is prompted to provide amount manually if extraction fails
- Confidence levels indicate extraction reliability

## Supported File Formats

- **PDF**: `.pdf`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.webp`

## Amount Pattern Recognition

The system recognizes multiple currency formats:

### Indian Rupee Formats
- ₹1,000.50
- ₹1,00,000.50 (Indian numbering system)
- Rs. 1000.50
- Rs 1000.50
- INR 1000.50

### Common Patterns
- "Total: ₹500.00"
- "Grand Total: ₹500.00"
- "Amount: ₹500.00"
- "Bill Amount: ₹500.00"

## System Requirements

### Required Libraries
```bash
# Core libraries (included in requirements.txt)
pip install pdfplumber pytesseract pillow

# For Windows: Tesseract OCR installation
# 1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
# 2. Install to C:\Program Files\Tesseract-OCR
# 3. The system will auto-detect the installation
```

### Linux/Mac Installation
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS (with Homebrew)
brew install tesseract
```

## Usage

### For End Users

#### Submitting an Expense with Receipt
1. Go to "Submit Expense" page
2. Fill in category, description, and date
3. Upload receipt (required for Travel, Equipment, Accommodation, Office Supplies)
4. Amount field becomes optional when receipt is provided
5. Submit - amount will be automatically extracted

#### If Extraction Fails
If automatic extraction fails:
1. Error message will show why extraction failed
2. You can submit again with the amount field filled in manually
3. Or provide amount and resubmit

### For System Administrators

#### Extract Amounts from Existing Expenses
If expenses were submitted with placeholder amounts due to extraction failures:

```bash
cd backend

# Test extraction on a single file
python test_receipt_extraction.py path/to/receipt.pdf

# Extract amounts for all low-amount expenses with receipts
python extract_expense_amounts.py
```

#### Using the Extract Amount API
```bash
# Extract amount from an existing expense's receipt
curl -X POST http://localhost:8000/api/expenses/5/extract-amount \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "expense_id": 5,
  "extracted_amount": 1250.50,
  "confidence": "high",
  "message": "PDF extraction successful: ₹1250.50"
}
```

## Troubleshooting

### OCR Not Working
**Symptom**: Image extraction fails
**Solution**:
1. Ensure pytesseract is installed: `pip install pytesseract`
2. Install Tesseract OCR:
   - Windows: https://github.com/UB-Mannheim/tesseract/wiki
   - Linux: `sudo apt-get install tesseract-ocr`
   - Mac: `brew install tesseract`
3. Test: `python test_receipt_extraction.py test_image.jpg`

### PDF Extraction Failing
**Symptom**: PDF amounts not extracted
**Solution**:
1. Ensure pdfplumber is installed: `pip install pdfplumber`
2. Verify PDF is readable: Try opening in PDF reader
3. Check if PDF contains selectable text (not just images)

### Amount Pattern Not Recognized
**Symptom**: Correct amount visible in receipt but not extracted
**Solution**:
1. Check if amount format matches supported patterns (see "Amount Pattern Recognition" section)
2. Try manual entry as fallback
3. Report unusual format to system administrator

## Technical Details

### Receipt Extraction Flow

```
User submits expense with receipt
    ↓
Backend receives form data
    ↓
If amount provided → Use provided amount
    ↓ (If amount not provided)
Check receipt file exists
    ↓
Determine file type (PDF/Image)
    ↓
Extract using appropriate method:
  PDF → pdfplumber text extraction
  Image → pytesseract OCR
    ↓
Apply regex patterns to find amount
    ↓
Validate extracted amount (> 0, < 999,999)
    ↓
If successful → Save expense with extracted amount
If failed → Error response to user
```

### Confidence Levels

1. **High**: 
   - Single amount match with "total" pattern
   - PDF extraction with clear total line
   - High-quality OCR results

2. **Medium**: 
   - Multiple amounts found, using largest
   - Ambiguous patterns matched
   - Lower-quality OCR results

3. **Low**: 
   - Weak pattern matches
   - Unclear OCR text
   - Fallback pattern matches

4. **None**: 
   - No extraction possible
   - Missing libraries
   - File not found

## Example Receipts

### Valid PDF Receipt
```
Transaction Receipt
Date: 2025-01-10
Total Amount: ₹2,500.00
Tax: ₹450.00
Grand Total: ₹2,950.00
```
✓ Will extract: ₹2,950.00

### Valid Image Receipt
```
STORE RECEIPT
Item 1 ........ 500.00
Item 2 ........ 750.00
Item 3 ........ 250.00
TOTAL ........₹1,500.00
```
✓ Will extract: ₹1,500.00

### Problematic Receipt
```
[Image with only handwritten amounts]
[Blurry/low-quality image]
[Amount in foreign currency only]
```
✗ Will fail to extract - requires manual entry

## Backend Endpoints

### Extract Amount from Existing Expense
```
POST /api/expenses/{expense_id}/extract-amount

Response 200:
{
  "success": true,
  "expense_id": 5,
  "extracted_amount": 1250.50,
  "confidence": "high",
  "message": "PDF extraction successful: ₹1250.50",
  "expense": { ... }
}

Response 400:
{
  "detail": "Could not extract amount from receipt. No amount pattern found in PDF"
}
```

## Configuration

### Environment Variables
```bash
# Optional: Set Tesseract path for Windows
TESSERACT_PATH=C:\\Program Files\\Tesseract-OCR\\tesseract.exe
```

### Update pytesseract Configuration (if needed)
In `app/utils/improved_receipt_extractor.py`:
```python
import pytesseract

# Specify path if auto-detection fails
pytesseract.pytesseract.pytesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Development

### Adding New Amount Patterns

Edit `app/utils/improved_receipt_extractor.py`:

```python
AMOUNT_PATTERNS = [
    # Your new pattern here
    (r'your_regex_pattern', 'descriptive_name'),
    ...
]
```

Example patterns:
```python
# Matches "Due Amount: ₹500"
(r'due\s+amount[:\s]*₹\s*([\d,]+\.?\d*)', 'due_amount'),

# Matches "Bill Amt = 500"
(r'bill\s+amt\s*=\s*([\d,]+\.?\d*)', 'bill_amount'),
```

### Testing Custom Patterns

```bash
python test_receipt_extraction.py your_receipt.pdf
```

## Future Enhancements

- [ ] Machine learning-based amount detection
- [ ] Handwritten amount recognition
- [ ] Multi-currency conversion
- [ ] Receipt categorization using AI
- [ ] Barcode/QR code reading
- [ ] Real-time extraction preview
- [ ] Batch receipt processing

## Support

For issues or feature requests related to receipt extraction:
1. Check the Troubleshooting section above
2. Review logs in `backend/logs/` 
3. Run `python test_receipt_extraction.py` with sample receipt
4. Contact system administrator with extraction failure details
