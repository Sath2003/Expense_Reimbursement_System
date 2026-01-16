import os
import hashlib
from datetime import datetime
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.config import settings

class FileHandler:
    
    @staticmethod
    def validate_file(file: UploadFile) -> tuple[bool, str]:
        """
        Validate uploaded file
        Returns: (is_valid, error_message)
        """
        # Check file size
        if file.size > settings.MAX_FILE_SIZE:
            return False, f"File size exceeds {settings.MAX_FILE_SIZE / 1024 / 1024}MB limit"
        
        # Check file extension
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in settings.ALLOWED_FILE_TYPES:
            return False, f"File type '{file_extension}' not allowed. Allowed: {', '.join(settings.ALLOWED_FILE_TYPES)}"
        
        return True, ""
    
    @staticmethod
    async def save_file(file: UploadFile, expense_id: int) -> tuple[str, str, int, str]:
        """
        Save file to disk and generate hash
        Returns: (file_path, file_hash, file_size, file_type)
        """
        # Validate file
        is_valid, error_msg = FileHandler.validate_file(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Create directory if not exists
        today = datetime.utcnow().strftime("%Y-%m")
        upload_dir = os.path.join(settings.UPLOAD_DIR, today)
        Path(upload_dir).mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1].lower()
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"expense_{expense_id}_receipt_{timestamp}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file and calculate hash
        file_hash = hashlib.sha256()
        file_size = 0
        
        with open(file_path, "wb") as f:
            while True:
                chunk = await file.read(8192)
                if not chunk:
                    break
                f.write(chunk)
                file_hash.update(chunk)
                file_size += len(chunk)
        
        # Return relative path
        relative_path = os.path.join(today, unique_filename)
        return relative_path, file_hash.hexdigest(), file_size, file_extension
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """Delete file from disk"""
        try:
            full_path = os.path.join(settings.UPLOAD_DIR, file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
            return True
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    
    @staticmethod
    def verify_file_integrity(file_path: str, expected_hash: str) -> bool:
        """Verify file integrity using hash"""
        try:
            full_path = os.path.join(settings.UPLOAD_DIR, file_path)
            if not os.path.exists(full_path):
                return False
            
            file_hash = hashlib.sha256()
            with open(full_path, "rb") as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    file_hash.update(chunk)
            
            return file_hash.hexdigest() == expected_hash
        except Exception as e:
            print(f"Error verifying file: {e}")
            return False    
    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """
        Extract text from PDF or image files
        Returns: Extracted text as string
        """
        try:
            full_path = os.path.join(settings.UPLOAD_DIR, file_path)
            
            if not os.path.exists(full_path):
                return ""
            
            file_extension = file_path.split('.')[-1].lower()
            
            # Extract from PDF
            if file_extension == 'pdf':
                try:
                    import pdfplumber
                    text = ""
                    with pdfplumber.open(full_path) as pdf:
                        for page in pdf.pages:
                            text += page.extract_text() or ""
                    return text
                except Exception as e:
                    print(f"Error extracting PDF text: {e}")
                    return ""
            
            # Extract from images using OCR
            elif file_extension in ['jpg', 'jpeg', 'png', 'gif', 'bmp']:
                try:
                    import pytesseract
                    from PIL import Image
                    
                    img = Image.open(full_path)
                    text = pytesseract.image_to_string(img)
                    return text
                except Exception as e:
                    print(f"Error extracting image text: {e}")
                    return ""
            
            return ""
        except Exception as e:
            print(f"Error in extract_text_from_file: {e}")
            return ""