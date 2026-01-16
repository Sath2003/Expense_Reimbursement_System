import re
import os
from typing import Optional, Tuple
from pathlib import Path
from app.config import settings

try:
    import pdfplumber
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("Warning: pdfplumber not installed. PDF amount extraction will be disabled.")

try:
    from PIL import Image
    import pytesseract
    OCR_SUPPORT = True
except ImportError:
    OCR_SUPPORT = False
    print("Warning: pytesseract/Pillow not installed. Image OCR will be disabled.")


class ReceiptExtractor:
    """
    Utility class to extract amount information from receipt files (PDF, images)
    Uses pattern matching to find common currency formats like ₹100.50, Rs. 100.50, etc.
    """
    
    # Common patterns for Indian currency amounts
    AMOUNT_PATTERNS = [
        r'₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # ₹100.50 or ₹1,00,000.50
        r'Rs\.\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Rs. 100.50
        r'rupees?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # rupees 100.50 (case-insensitive)
        r'INR\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # INR 100.50
        r'Total\s*(?:Amount)?[:\s]+₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Total: ₹100.50
        r'Grand\s+Total[:\s]+₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Grand Total: 100.50
        r'TOTAL\s*:?\s*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # TOTAL 100.50
    ]
    
    @staticmethod
    def _clean_amount_string(amount_str: str) -> float:
        """
        Convert extracted amount string to float
        Handles formats like "1,00,000.50" -> 100000.50
        """
        # Remove currency symbols and spaces
        amount_str = amount_str.strip()
        
        # Handle Indian numbering system (1,00,000)
        if ',' in amount_str:
            # Check if it's Indian format (2 digits after last comma)
            parts = amount_str.split(',')
            if len(parts) > 1 and len(parts[-1]) == 2:
                # Indian format: remove all commas
                amount_str = amount_str.replace(',', '')
            else:
                # Western format: replace comma with nothing if followed by 3 digits and decimal
                amount_str = amount_str.replace(',', '')
        
        try:
            return float(amount_str)
        except ValueError:
            return None
    
    @staticmethod
    def extract_from_pdf(file_path: str) -> Tuple[Optional[float], str]:
        """
        Extract amount from PDF file using pdfplumber
        Returns: (amount, confidence_note)
        """
        if not PDF_SUPPORT:
            return None, "PDF support not available. Install pdfplumber: pip install pdfplumber"
        
        if not os.path.exists(file_path):
            return None, f"File not found: {file_path}"
        
        try:
            amounts_found = []
            
            with pdfplumber.open(file_path) as pdf:
                # Extract text from all pages
                full_text = ""
                for page in pdf.pages:
                    full_text += page.extract_text() or ""
            
            # Search for amount patterns in extracted text
            for pattern in ReceiptExtractor.AMOUNT_PATTERNS:
                matches = re.finditer(pattern, full_text, re.IGNORECASE)
                for match in matches:
                    amount_str = match.group(1)
                    amount = ReceiptExtractor._clean_amount_string(amount_str)
                    if amount and amount > 0:
                        amounts_found.append(amount)
            
            if amounts_found:
                # Return the largest amount found (usually the total)
                final_amount = max(amounts_found)
                confidence = "high" if len(amounts_found) == 1 else "medium"
                return final_amount, f"Extracted amount ₹{final_amount:.2f} ({confidence} confidence)"
            
            return None, "No amount pattern found in PDF"
        
        except Exception as e:
            return None, f"Error extracting from PDF: {str(e)}"
    
    @staticmethod
    def extract_from_image(file_path: str) -> Tuple[Optional[float], str]:
        """
        Extract amount from image file using OCR
        Returns: (amount, confidence_note)
        """
        if not OCR_SUPPORT:
            return None, "OCR support not available. Install pytesseract: pip install pytesseract pillow"
        
        if not os.path.exists(file_path):
            return None, f"File not found: {file_path}"
        
        try:
            # Open image and extract text using OCR
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            
            amounts_found = []
            
            # Search for amount patterns in extracted text
            for pattern in ReceiptExtractor.AMOUNT_PATTERNS:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    amount_str = match.group(1)
                    amount = ReceiptExtractor._clean_amount_string(amount_str)
                    if amount and amount > 0:
                        amounts_found.append(amount)
            
            if amounts_found:
                # Return the largest amount found (usually the total)
                final_amount = max(amounts_found)
                confidence = "high" if len(amounts_found) == 1 else "medium"
                return final_amount, f"Extracted amount ₹{final_amount:.2f} ({confidence} confidence) via OCR"
            
            return None, "No amount pattern found in image OCR"
        
        except Exception as e:
            return None, f"Error extracting from image: {str(e)}"
    
    @staticmethod
    def extract_amount(file_path: str, file_type: str) -> Tuple[Optional[float], str]:
        """
        Extract amount from receipt file (PDF or image)
        
        Args:
            file_path: Full path to the receipt file
            file_type: File extension (pdf, jpg, png, gif, etc.)
        
        Returns:
            (extracted_amount, status_message)
        """
        file_type = file_type.lower()
        
        if file_type == 'pdf':
            return ReceiptExtractor.extract_from_pdf(file_path)
        elif file_type in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff']:
            return ReceiptExtractor.extract_from_image(file_path)
        else:
            return None, f"Unsupported file type: {file_type}"
    
    @staticmethod
    def check_extraction_available() -> dict:
        """
        Check what extraction capabilities are available
        Returns dict with status of each extraction method
        """
        return {
            "pdf_support": PDF_SUPPORT,
            "ocr_support": OCR_SUPPORT,
            "pdf_message": "pdfplumber available" if PDF_SUPPORT else "pdfplumber not installed (pip install pdfplumber)",
            "ocr_message": "pytesseract available" if OCR_SUPPORT else "pytesseract not installed (pip install pytesseract pillow)",
        }
