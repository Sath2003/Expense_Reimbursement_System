# ✅ AUTOMATIC RECEIPT AMOUNT EXTRACTION - SETUP GUIDE

## Current Status
- ✅ Python libraries installed (pdfplumber, pytesseract, pillow)
- ⚠️ Tesseract-OCR system software NOT YET INSTALLED

## The Problem
The expense system tries to automatically extract amounts from receipts you upload, but it needs **Tesseract-OCR** (a free, open-source tool) installed on your computer to read text from images.

## The Solution - Install Tesseract-OCR

### For Windows:
1. **Download the installer:**
   - Go to: https://github.com/UB-Mannheim/tesseract/wiki
   - Download: `tesseract-ocr-w64-setup-v5.x.x.exe` (64-bit) or `w32` version if you have 32-bit Windows

2. **Run the installer:**
   - Double-click the downloaded .exe file
   - Click through the installation wizard
   - **IMPORTANT:** Keep the default installation path: `C:\Program Files\Tesseract-OCR`
   - Accept all prompts and complete the installation

3. **Verify installation:**
   ```
   cd backend
   python check_extraction_status.py
   ```
   You should see "✅ TESSERACT IS INSTALLED AND WORKING"

### For Mac:
```bash
brew install tesseract
```

### For Linux (Ubuntu/Debian):
```bash
sudo apt-get install tesseract-ocr
```

## How It Works After Installation

1. **User uploads receipt** (PDF or image)
2. **System automatically extracts** the amount from the receipt
3. **Expense is created** with the extracted amount
4. **Done!** No manual amount entry needed

## Testing the Extraction

To test if extraction works:
```
cd backend
python test_receipt_extraction.py <path_to_your_receipt_file>
```

Example:
```
python test_receipt_extraction.py bills\sample_receipt.png
```

## Troubleshooting

### "Tesseract is not installed or it's not in your PATH"
- **Solution:** Reinstall Tesseract and choose the default path `C:\Program Files\Tesseract-OCR`

### "Module pytesseract not found"
- **Solution:** Run `pip install pytesseract` in the backend directory

### Extraction still not working
- **Solution:** 
  1. Verify Tesseract is installed: `tesseract --version` (in command prompt)
  2. Check the receipt file is readable and contains clear text
  3. Try with a different receipt image

## What Types of Receipts Work Best

✅ **Works well:**
- Printed receipts (POS receipts from shops)
- Digital invoice PDFs with text
- Screenshots of online bills
- Mobile payment app receipts

⚠️ **May not work:**
- Handwritten receipts
- Very blurry images
- Scanned documents with low contrast

## For Handwritten or Unclear Receipts

If automatic extraction fails, users can:
1. Submit the expense with the receipt
2. Manually update the amount from the "My Expenses" page
3. Click "Update" next to the ₹0 amount and enter the value

---

**After installation, restart the backend server and try uploading a receipt again!**
