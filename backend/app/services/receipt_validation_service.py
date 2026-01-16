import os
import json
from typing import Dict, Tuple, Optional
from datetime import datetime
import re
from pathlib import Path

class ReceiptValidationService:
    """
    AI-powered service to validate the genuineness of uploaded receipts.
    Uses multiple heuristics and can be extended with ML models.
    """
    
    def __init__(self):
        self.suspicious_keywords = [
            'sample', 'demo', 'test', 'fake', 'template', 'example',
            'mock', 'dummy', 'placeholder', 'specimen', 'illustration'
        ]
        
        self.required_receipt_elements = [
            'amount', 'date', 'vendor', 'description'
        ]
        
        # Common receipt formats and their expected patterns
        self.receipt_patterns = {
            'invoice_number': r'(?:invoice|bill|receipt)\s*(?:no|number|#)?\s*[:\s]*([A-Z0-9\-]+)',
            'tax_id': r'(?:gst|tin|vat|tax)\s*(?:id|no)?\s*[:\s]*([A-Z0-9]+)',
            'phone': r'(?:phone|mobile|tel)\s*[:\s]*([0-9\-\s]+)',
            'email': r'[\w\.-]+@[\w\.-]+\.\w+',
        }
    
    def validate_receipt(self, file_path: str, extracted_text: str, amount: float) -> Dict:
        """
        Validate receipt genuineness using multiple checks.
        
        Args:
            file_path: Path to the receipt file
            extracted_text: Text extracted from the receipt
            amount: Amount extracted from the receipt
            
        Returns:
            Dict with validation results and confidence scores
        """
        validation_results = {
            'is_genuine': True,
            'confidence_score': 0.0,
            'risk_factors': [],
            'recommendations': [],
            'validation_checks': {},
            'timestamp': datetime.now().isoformat()
        }
        
        # Perform various validation checks
        checks = [
            self._check_suspicious_keywords,
            self._check_amount_consistency,
            self._check_date_validity,
            self._check_required_elements,
            self._check_format_consistency,
            self._check_file_metadata,
            self._check_logical_consistency
        ]
        
        total_score = 0
        max_score = len(checks) * 100
        
        for check_func in checks:
            check_name = check_func.__name__.replace('_check_', '')
            score, risk_factors, recommendations = check_func(extracted_text, amount, file_path)
            
            validation_results['validation_checks'][check_name] = {
                'score': score,
                'passed': score >= 70,
                'risk_factors': risk_factors,
                'recommendations': recommendations
            }
            
            total_score += score
            validation_results['risk_factors'].extend(risk_factors)
            validation_results['recommendations'].extend(recommendations)
        
        # Calculate overall confidence
        validation_results['confidence_score'] = (total_score / max_score) * 100
        
        # Determine if receipt is genuine based on confidence threshold
        validation_results['is_genuine'] = validation_results['confidence_score'] >= 60
        
        # Add risk level classification
        if validation_results['confidence_score'] >= 80:
            validation_results['risk_level'] = 'Low'
        elif validation_results['confidence_score'] >= 60:
            validation_results['risk_level'] = 'Medium'
        else:
            validation_results['risk_level'] = 'High'
        
        return validation_results
    
    def _check_suspicious_keywords(self, text: str, amount: float, file_path: str) -> Tuple[int, list, list]:
        """Check for suspicious keywords in the receipt text."""
        text_lower = text.lower()
        found_keywords = [kw for kw in self.suspicious_keywords if kw in text_lower]
        
        risk_factors = []
        recommendations = []
        
        if found_keywords:
            risk_factors.append(f"Suspicious keywords found: {', '.join(found_keywords)}")
            recommendations.append("Review receipt manually for authenticity")
            return 20, risk_factors, recommendations
        
        return 100, [], []
    
    def _check_amount_consistency(self, text: str, amount: float, file_path: str) -> Tuple[int, list, list]:
        """Check if the amount is consistent with typical receipt patterns."""
        risk_factors = []
        recommendations = []
        score = 100
        
        # Check for round numbers (might indicate fake amounts)
        if amount % 1000 == 0 and amount > 1000:
            risk_factors.append("Amount is a round number, which might be suspicious")
            score -= 30
        
        # Check for unusually high amounts
        if amount > 100000:
            risk_factors.append("Unusually high amount for a typical expense")
            recommendations.append("Verify large expense with additional documentation")
            score -= 20
        
        # Check for very small amounts
        if amount < 10:
            risk_factors.append("Very small amount might indicate test receipt")
            score -= 15
        
        return max(0, score), risk_factors, recommendations
    
    def _check_date_validity(self, text: str, amount: float, file_path: str) -> Tuple[int, list, list]:
        """Check if dates in the receipt are valid."""
        risk_factors = []
        recommendations = []
        score = 100
        
        # Extract dates from text
        date_patterns = [
            r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # DD/MM/YYYY
            r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',    # YYYY/MM/DD
            r'\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b'  # DD Month YYYY
        ]
        
        dates_found = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates_found.extend(matches)
        
        if not dates_found:
            risk_factors.append("No clear date found in receipt")
            recommendations.append("Ensure receipt includes a valid date")
            score -= 40
        
        # Check for future dates
        current_date = datetime.now()
        for date_str in dates_found:
            try:
                # Try to parse the date
                for fmt in ['%d/%m/%Y', '%Y/%m/%d', '%d-%m-%Y', '%Y-%m-%d']:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt)
                        if parsed_date > current_date:
                            risk_factors.append("Future date found in receipt")
                            score -= 50
                        break
                    except ValueError:
                        continue
            except:
                continue
        
        return max(0, score), risk_factors, recommendations
    
    def _check_required_elements(self, text: str, amount: float, file_path: str) -> Tuple[int, list, list]:
        """Check if required receipt elements are present."""
        risk_factors = []
        recommendations = []
        score = 100
        
        missing_elements = []
        
        # Check for vendor name (assume it's one of the first words)
        words = text.split()[:10]
        if not any(len(word) > 3 for word in words):
            missing_elements.append("vendor name")
        
        # Check for amount indicators
        amount_indicators = ['total', 'amount', 'rs', 'inr', '₹']
        if not any(indicator in text.lower() for indicator in amount_indicators):
            missing_elements.append("amount indicators")
        
        # Check for description/items
        if len(text.split()) < 10:
            missing_elements.append("item descriptions")
        
        if missing_elements:
            risk_factors.append(f"Missing required elements: {', '.join(missing_elements)}")
            recommendations.append("Ensure receipt includes all required information")
            score -= len(missing_elements) * 20
        
        return max(0, score), risk_factors, recommendations
    
    def _check_format_consistency(self, text: str, amount: float, file_path: str) -> Tuple[int, list, list]:
        """Check if receipt format is consistent with typical receipts."""
        risk_factors = []
        recommendations = []
        score = 100
        
        # Check for common receipt patterns
        pattern_matches = 0
        for pattern_name, pattern in self.receipt_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                pattern_matches += 1
        
        # If very few patterns match, might be fake
        if pattern_matches < 2:
            risk_factors.append("Receipt format doesn't match typical patterns")
            recommendations.append("Verify receipt format and structure")
            score -= 40
        
        return max(0, score), risk_factors, recommendations
    
    def _check_file_metadata(self, text: str, amount: float, file_path: str) -> Tuple[int, list, list]:
        """Check file metadata for suspicious indicators."""
        risk_factors = []
        recommendations = []
        score = 100

        # In our API we often validate a temporary file (saved just for extraction).
        # Temp files are always "created very recently" and will produce false positives.
        normalized_path = (file_path or "").replace('\\', '/').lower()
        if '/tmp/' in normalized_path or '/temp/' in normalized_path:
            return 100, [], []
        
        try:
            file_stat = Path(file_path).stat()
            
            # Check if file is very new (might indicate just created)
            file_age = datetime.now().timestamp() - file_stat.st_mtime
            if file_age < 60:  # Less than 1 minute old
                risk_factors.append("File was created very recently")
                score -= 30
            
            # Check file size
            file_size = file_stat.st_size
            if file_size < 1000:  # Less than 1KB
                risk_factors.append("File size is very small")
                score -= 40
            elif file_size > 10 * 1024 * 1024:  # More than 10MB
                risk_factors.append("File size is unusually large")
                score -= 20
        
        except Exception as e:
            risk_factors.append(f"Could not analyze file metadata: {str(e)}")
            score -= 10
        
        return max(0, score), risk_factors, recommendations
    
    def _check_logical_consistency(self, text: str, amount: float, file_path: str) -> Tuple[int, list, list]:
        """Check for logical consistency in the receipt."""
        risk_factors = []
        recommendations = []
        score = 100
        
        # Check for multiple different amounts (might indicate tampering)
        amount_pattern = r'[₹Rs]?\s*([\d,]+\.?\d*)'
        amounts = re.findall(amount_pattern, text)
        
        # Clean and convert amounts
        clean_amounts = []
        for amt in amounts:
            try:
                clean_amt = float(amt.replace(',', '').replace('₹', '').replace('Rs', ''))
                if clean_amt > 0:
                    clean_amounts.append(clean_amt)
            except:
                continue
        
        if len(set(int(a) for a in clean_amounts)) > 3:
            risk_factors.append("Multiple different amounts found")
            recommendations.append("Verify which amount is the correct total")
            score -= 30
        
        # Check for duplicate text (might indicate copy-paste)
        lines = text.split('\n')
        line_counts = {}
        for line in lines:
            line = line.strip()
            if len(line) > 10:
                line_counts[line] = line_counts.get(line, 0) + 1
        
        duplicates = [line for line, count in line_counts.items() if count > 1]
        if duplicates:
            risk_factors.append("Duplicate lines found in receipt")
            score -= 20
        
        return max(0, score), risk_factors, recommendations
    
    def get_validation_summary(self, validation_results: Dict) -> str:
        """Generate a human-readable summary of validation results."""
        if validation_results['is_genuine']:
            return f"Receipt appears genuine (Confidence: {validation_results['confidence_score']:.1f}%, Risk: {validation_results['risk_level']})"
        else:
            return f"Receipt may be fraudulent (Confidence: {validation_results['confidence_score']:.1f}%, Risk: {validation_results['risk_level']})"
