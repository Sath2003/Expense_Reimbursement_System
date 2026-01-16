"""
AI-powered cross-validation service for expense receipts.
Implements multiple checks to prevent duplicate submissions and validate genuineness.
"""

import hashlib
import os
from typing import Dict, List, Tuple, Optional, Set
from datetime import datetime, timedelta
from pathlib import Path
import re
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.expense import Expense, ExpenseAttachment
from app.models.user import User

class ExpenseCrossCheckService:
    """
    AI-powered service to cross-check expense submissions for:
    - Duplicate bill detection
    - Date validation
    - Amount reasonableness
    - Vendor authenticity
    - Pattern recognition
    """
    
    def __init__(self):
        self.duplicate_threshold = 0.85  # Similarity threshold for duplicate detection
        self.reasonable_amount_ranges = {
            'Travel': (500, 50000),      # Min-max for travel
            'Meals': (100, 5000),        # Min-max for meals
            'Accommodation': (800, 20000),  # Min-max for accommodation
            'Equipment': (1000, 100000),   # Min-max for equipment
            'Office Supplies': (50, 5000),   # Min-max for office supplies
            'Other': (50, 25000)           # Min-max for miscellaneous
        }
        
        self.suspicious_vendors = [
            'test vendor', 'demo company', 'sample business', 
            'fake enterprise', 'mock corporation', 'placeholder ltd'
        ]
        
        self.common_receipt_patterns = {
            'flight_ticket': r'(?:flight|airline|booking|pnr|seat)',
            'hotel_bill': r'(?:hotel|accommodation|room|check.?in|checkout)',
            'restaurant': r'(?:restaurant|food|dining|menu|bill)',
            'fuel': r'(?:fuel|petrol|diesel|gas|litre)',
            'office': r'(?:stationery|office|supplies|equipment)'
        }

    def cross_check_expense(self, 
                         file_path: str, 
                         extracted_text: str, 
                         amount: float, 
                         category: str, 
                         description: str, 
                         date: str,
                         user_id: int,
                         db: Session) -> Dict:
        """
        Perform comprehensive AI cross-checks on expense submission.
        
        Returns:
            Dict with validation results and recommendations
        """
        
        validation_results = {
            'is_approved': True,
            'confidence_score': 0.0,
            'risk_factors': [],
            'recommendations': [],
            'duplicate_matches': [],
            'date_validation': {},
            'amount_validation': {},
            'vendor_validation': {},
            'pattern_validation': {},
            'cross_checks': {}
        }
        
        # 1. Duplicate Bill Detection
        duplicate_check = self._check_duplicate_bills(file_path, extracted_text, amount, date, user_id, db)
        validation_results['duplicate_matches'] = duplicate_check['matches']
        validation_results['cross_checks']['duplicate_similarity'] = duplicate_check['max_similarity']
        
        if duplicate_check['is_duplicate']:
            validation_results['risk_factors'].append(f"High similarity ({duplicate_check['max_similarity']:.1f}%) with existing bills")
            validation_results['recommendations'].append("This appears to be a duplicate submission")
            validation_results['is_approved'] = False
        
        # 2. Date Validation
        date_check = self._validate_expense_date(date, extracted_text)
        validation_results['date_validation'] = date_check
        
        if not date_check['is_valid']:
            validation_results['risk_factors'].append(date_check['issue'])
            validation_results['recommendations'].append(date_check['recommendation'])
            validation_results['is_approved'] = False
        
        # 3. Amount Validation
        amount_check = self._validate_amount(amount, category, extracted_text)
        validation_results['amount_validation'] = amount_check
        
        if not amount_check['is_reasonable']:
            validation_results['risk_factors'].append(amount_check['issue'])
            validation_results['recommendations'].append(amount_check['recommendation'])
        
        # 4. Vendor/Source Validation
        vendor_check = self._validate_vendor_source(extracted_text, description)
        validation_results['vendor_validation'] = vendor_check
        
        if not vendor_check['is_legitimate']:
            validation_results['risk_factors'].append(vendor_check['issue'])
            validation_results['recommendations'].append(vendor_check['recommendation'])
        
        # 5. Pattern Recognition
        pattern_check = self._validate_receipt_patterns(extracted_text, category)
        validation_results['pattern_validation'] = pattern_check
        
        if not pattern_check['matches_expected']:
            validation_results['risk_factors'].append(f"Receipt doesn't match expected {category} patterns")
            validation_results['recommendations'].append("Verify this is a genuine receipt")
        
        # 6. Content Consistency Check
        consistency_check = self._check_content_consistency(extracted_text, amount, date, description)
        validation_results['cross_checks']['content_consistency'] = consistency_check
        
        if not consistency_check['is_consistent']:
            validation_results['risk_factors'].append(consistency_check['issue'])
            validation_results['recommendations'].append(consistency_check['recommendation'])
        
        # Calculate overall confidence score
        validation_results['confidence_score'] = self._calculate_confidence_score(validation_results)
        
        # Final approval decision
        if validation_results['confidence_score'] < 60:
            validation_results['is_approved'] = False
            validation_results['recommendations'].append("Expense requires manual review")
        
        return validation_results
    
    def _check_duplicate_bills(self, file_path: str, extracted_text: str, amount: float, date: str, user_id: int, db: Session) -> Dict:
        """Check for duplicate or similar bills using multiple methods."""
        
        # Get file hash
        file_hash = self._get_file_hash(file_path)
        
        # Get text similarity hash
        text_hash = self._get_text_hash(extracted_text)
        
        # Query existing expenses for this user
        existing_expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
        
        matches = []
        max_similarity = 0.0
        
        for expense in existing_expenses:
            similarity_score = 0.0
            text_similarity = 0.0
            
            # Check exact file hash match
            for attachment in expense.attachments:
                if hasattr(attachment, 'file_hash') and attachment.file_hash == file_hash:
                    similarity_score = 100.0
                    matches.append({
                        'expense_id': expense.id,
                        'similarity_type': 'exact_file_match',
                        'similarity_score': 100.0,
                        'date': expense.expense_date.strftime('%Y-%m-%d'),
                        'amount': expense.amount,
                        'description': expense.description
                    })
                    break
            
            # Check text similarity
            if hasattr(expense, 'extracted_text_hash'):
                text_similarity = self._calculate_text_similarity(text_hash, expense.extracted_text_hash)
                similarity_score = max(similarity_score, text_similarity)
            
            # Check amount and date similarity
            date_similarity = self._calculate_date_similarity(date, expense.expense_date.strftime('%Y-%m-%d'))
            amount_similarity = self._calculate_amount_similarity(amount, expense.amount)
            
            # Combine similarities
            combined_similarity = max(
                similarity_score,
                (date_similarity * 0.6) + (amount_similarity * 0.4),
                text_similarity,
            )
            
            if combined_similarity >= self.duplicate_threshold * 100:
                matches.append({
                    'expense_id': expense.id,
                    'similarity_type': 'combined_similarity',
                    'similarity_score': combined_similarity,
                    'date': expense.expense_date.strftime('%Y-%m-%d'),
                    'amount': expense.amount,
                    'description': expense.description
                })
            
            max_similarity = max(max_similarity, combined_similarity)
        
        return {
            'is_duplicate': len(matches) > 0,
            'matches': matches,
            'max_similarity': max_similarity
        }
    
    def _validate_expense_date(self, date: str, extracted_text: str) -> Dict:
        """Validate expense date for reasonableness."""
        
        try:
            expense_date = datetime.strptime(date, '%Y-%m-%d')
            current_date = datetime.now()
            
            # Check if date is in future
            if expense_date > current_date:
                return {
                    'is_valid': False,
                    'issue': f'Date is in future ({date})',
                    'recommendation': 'Expense date cannot be in the future'
                }
            
            # Check if date is too old (more than 1 year)
            days_old = (current_date - expense_date).days
            if days_old > 365:
                return {
                    'is_valid': False,
                    'issue': f'Date is too old ({days_old} days)',
                    'recommendation': 'Expenses older than 1 year require additional approval'
                }
            
            # Check for date consistency in receipt text
            text_dates = self._extract_dates_from_text(extracted_text)
            if text_dates:
                # Check if expense date matches dates in receipt
                date_matches = any(
                    abs((expense_date - text_date).days) <= 1 
                    for text_date in text_dates
                )
                
                if not date_matches:
                    return {
                        'is_valid': False,
                        'issue': 'Expense date doesn\'t match dates in receipt',
                        'recommendation': 'Verify the expense date matches the receipt'
                    }
            
            return {
                'is_valid': True,
                'issue': None,
                'recommendation': None
            }
            
        except ValueError:
            return {
                'is_valid': False,
                'issue': 'Invalid date format',
                'recommendation': 'Please provide a valid date (YYYY-MM-DD)'
            }
    
    def _validate_amount(self, amount: float, category: str, extracted_text: str) -> Dict:
        """Validate amount for reasonableness."""
        
        # Check against category ranges
        if category in self.reasonable_amount_ranges:
            min_amount, max_amount = self.reasonable_amount_ranges[category]
            
            if amount < min_amount:
                return {
                    'is_reasonable': False,
                    'issue': f'Amount ₹{amount} is below minimum (₹{min_amount}) for {category}',
                    'recommendation': f'Verify the amount is correct for {category} expense'
                }
            
            if amount > max_amount:
                return {
                    'is_reasonable': False,
                    'issue': f'Amount ₹{amount} exceeds maximum (₹{max_amount}) for {category}',
                    'recommendation': f'Large amounts require additional documentation for {category}'
                }
        
        # Check for round numbers (potential placeholders)
        if amount % 1000 == 0 and amount >= 1000:
            return {
                'is_reasonable': False,
                'issue': 'Amount is a round number (potential placeholder)',
                'recommendation': 'Verify exact amount from receipt'
            }
        
        # Check for suspicious decimals
        if amount == int(amount) and amount > 100:
            return {
                'is_reasonable': False,
                'issue': 'Large whole number amount (missing cents?)',
                'recommendation': 'Verify exact amount including paise from receipt'
            }
        
        return {
            'is_reasonable': True,
            'issue': None,
            'recommendation': None
        }
    
    def _validate_vendor_source(self, extracted_text: str, description: str) -> Dict:
        """Validate vendor/source information."""
        
        text_lower = extracted_text.lower()
        
        # Check for suspicious vendor names
        for suspicious in self.suspicious_vendors:
            if suspicious in text_lower:
                return {
                    'is_legitimate': False,
                    'issue': f'Suspicious vendor detected: {suspicious}',
                    'recommendation': 'This appears to be a test/fake receipt'
                }
        
        # Check for sample/demo indicators
        sample_indicators = ['sample', 'demo', 'test', 'specimen', 'example', 'mock']
        for indicator in sample_indicators:
            if indicator in text_lower:
                return {
                    'is_legitimate': False,
                    'issue': f'Sample receipt detected: {indicator}',
                    'recommendation': 'Cannot submit sample/test receipts'
                }
        
        # Extract potential vendor name
        vendor_patterns = [
            r'([A-Z][A-Za-z0-9&\-]+(?:\s+(?:Inc|Ltd|Pvt|Corporation|Company))?)',
            r'([A-Z][A-Za-z0-9&\-]+\s+(?:Enterprises|Services|Solutions))',
            r'([A-Z][A-Za-z0-9&\-]+\s+(?:Restaurant|Hotel|Store|Shop))',
        ]
        
        vendor_found = False
        for pattern in vendor_patterns:
            if re.search(pattern, extracted_text):
                vendor_found = True
                break
        
        if not vendor_found and len(extracted_text) > 50:
            return {
                'is_legitimate': False,
                'issue': 'No clear vendor information found',
                'recommendation': 'Receipt should clearly show vendor/business name'
            }
        
        return {
            'is_legitimate': True,
            'issue': None,
            'recommendation': None
        }
    
    def _validate_receipt_patterns(self, extracted_text: str, category: str) -> Dict:
        """Validate if receipt matches expected patterns for category."""
        
        text_lower = extracted_text.lower()
        matches = []
        
        # Check patterns based on category
        if category == 'Travel':
            if re.search(self.common_receipt_patterns['flight_ticket'], text_lower):
                matches.append('flight_ticket_pattern')
            if re.search(r'(?:taxi|cab|uber|ola|metro|bus)', text_lower):
                matches.append('local_transport_pattern')
        
        elif category == 'Meals':
            if re.search(self.common_receipt_patterns['restaurant'], text_lower):
                matches.append('restaurant_pattern')
            if re.search(r'(?:swiggy|zomato|foodpanda|uber eats)', text_lower):
                matches.append('food_delivery_pattern')
        
        elif category == 'Accommodation':
            if re.search(self.common_receipt_patterns['hotel_bill'], text_lower):
                matches.append('hotel_pattern')
        
        elif category == 'Equipment':
            if re.search(self.common_receipt_patterns['office'], text_lower):
                matches.append('office_supply_pattern')
        
        # Check for general receipt indicators
        if re.search(r'(?:bill|invoice|receipt|cash|memo|due)', text_lower):
            matches.append('general_receipt_pattern')
        
        return {
            'matches_expected': len(matches) > 0,
            'matched_patterns': matches,
            'category': category
        }
    
    def _check_content_consistency(self, extracted_text: str, amount: float, date: str, description: str) -> Dict:
        """Check internal consistency of receipt content."""
        
        issues = []
        
        # Check if amount appears in text
        amount_str = str(int(amount)) if amount == int(amount) else f"{amount:.2f}"
        if amount_str not in extracted_text and f"{amount:.0f}" not in extracted_text:
            issues.append("Amount not found in receipt text")
        
        # Check for consistent currency symbols
        currency_symbols = ['₹', 'Rs', 'INR', 'rs']
        currency_found = any(symbol in extracted_text for symbol in currency_symbols)
        if not currency_found:
            issues.append("No currency symbol found in receipt")
        
        # Check description length
        if len(description.strip()) < 5:
            issues.append("Description too short - may be placeholder")
        
        # Check for reasonable text length
        if len(extracted_text.strip()) < 20:
            issues.append("Receipt text too short - may be incomplete")
        
        return {
            'is_consistent': len(issues) == 0,
            'issues': issues,
            'issue': issues[0] if issues else None,
            'recommendation': 'Review receipt content for completeness' if issues else None
        }
    
    def _calculate_confidence_score(self, validation_results: Dict) -> float:
        """Calculate overall confidence score from all validation results."""
        
        score = 100.0
        
        # Deduct points for each risk factor
        if validation_results['duplicate_matches']:
            score -= 40  # Heavy penalty for duplicates
        
        if not validation_results['date_validation']['is_valid']:
            score -= 25
        
        if not validation_results['amount_validation']['is_reasonable']:
            score -= 20
        
        if not validation_results['vendor_validation']['is_legitimate']:
            score -= 30
        
        if not validation_results['pattern_validation']['matches_expected']:
            score -= 15
        
        if not validation_results['cross_checks']['content_consistency']['is_consistent']:
            score -= 10
        
        return max(0, score)
    
    def _get_file_hash(self, file_path: str) -> str:
        """Generate SHA256 hash of file for duplicate detection."""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        except:
            return ""
    
    def _get_text_hash(self, text: str) -> str:
        """Generate hash of extracted text for similarity checking."""
        return hashlib.md5(text.encode()).hexdigest()
    
    def _calculate_text_similarity(self, hash1: str, hash2: str) -> float:
        """Calculate similarity between two text hashes."""
        if not hash1 or not hash2:
            return 0.0
        
        # Simple similarity based on hash matching
        return 100.0 if hash1 == hash2 else 0.0
    
    def _calculate_date_similarity(self, date1: str, date2: str) -> float:
        """Calculate similarity between two dates."""
        try:
            d1 = datetime.strptime(date1, '%Y-%m-%d')
            d2 = datetime.strptime(date2, '%Y-%m-%d')
            
            days_diff = abs((d1 - d2).days)
            if days_diff == 0:
                return 100.0
            elif days_diff <= 7:
                return 80.0
            elif days_diff <= 30:
                return 50.0
            else:
                return 20.0
        except:
            return 0.0
    
    def _calculate_amount_similarity(self, amount1: float, amount2: float) -> float:
        """Calculate similarity between two amounts."""
        try:
            if isinstance(amount1, Decimal):
                amount1 = float(amount1)
            if isinstance(amount2, Decimal):
                amount2 = float(amount2)
            amount1 = float(amount1)
            amount2 = float(amount2)
        except Exception:
            return 0.0

        if amount1 == amount2:
            return 100.0
        elif abs(amount1 - amount2) <= 10:
            return 90.0
        elif abs(amount1 - amount2) <= 50:
            return 70.0
        elif abs(amount1 - amount2) <= 100:
            return 50.0
        else:
            return 20.0
    
    def _extract_dates_from_text(self, text: str) -> List[datetime]:
        """Extract all dates from text."""
        date_patterns = [
            r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # DD/MM/YYYY
            r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',  # YYYY/MM/DD
            r'\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b'  # DD Month YYYY
        ]
        
        dates = []
        for pattern in date_patterns:
            try:
                matches = re.findall(pattern, text)
                for match in matches:
                    try:
                        if '/' in match:
                            if len(match.split('/')[0]) == 4:  # YYYY/MM/DD
                                date_obj = datetime.strptime(match, '%Y/%m/%d')
                            else:  # DD/MM/YYYY
                                date_obj = datetime.strptime(match, '%d/%m/%Y')
                        else:
                            date_obj = datetime.strptime(match, '%d %B %Y')
                        dates.append(date_obj)
                    except:
                        continue
            except:
                continue
        
        return dates
    
    def get_validation_summary(self, validation_results: Dict) -> str:
        """Generate human-readable summary of validation results."""
        if validation_results['is_approved']:
            return f"✅ Expense approved (Confidence: {validation_results['confidence_score']:.1f}%)"
        else:
            risk_factors_count = len(validation_results['risk_factors'])
            return f"❌ Expense rejected (Confidence: {validation_results['confidence_score']:.1f}%, Issues: {risk_factors_count})"
