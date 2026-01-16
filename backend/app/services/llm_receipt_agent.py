import json
from typing import Any, Dict, Optional
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

import httpx

from app.config import settings


class LLMReceiptAgent:
    @staticmethod
    def validate_bill_expiration(expense_date: str) -> Dict[str, Any]:
        """
        Validate if bill/expense date is within acceptable submission window.
        
        Rules:
        - Bills from current month: Can be submitted until end of next month
        - Bills from previous month: Can be submitted until end of next month
        - Bills older than 2 months: Cannot be submitted
        
        Example:
        - January bill: Can be submitted until end of February
        - February bill: Can be submitted until end of March
        - March bill submitted in June: REJECTED (older than 2 months)
        """
        try:
            # Parse the expense date
            expense_dt = datetime.strptime(expense_date, "%Y-%m-%d")
            today = datetime.now()
            
            # Get the month and year of the expense
            expense_month_start = expense_dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            expense_month_end = (expense_month_start + relativedelta(months=1)) - timedelta(seconds=1)
            
            # Calculate submission deadline: end of month after expense month
            submission_deadline = (expense_month_start + relativedelta(months=2)) - timedelta(seconds=1)
            
            is_valid = today <= submission_deadline
            
            return {
                "is_valid": is_valid,
                "expense_date": expense_date,
                "submission_deadline": submission_deadline.strftime("%Y-%m-%d"),
                "days_remaining": max(0, (submission_deadline - today).days),
                "reason": (
                    f"Expense from {expense_month_start.strftime('%B %Y')} is valid until {submission_deadline.strftime('%B %d, %Y')}"
                    if is_valid else
                    f"Expense from {expense_month_start.strftime('%B %Y')} expired on {submission_deadline.strftime('%B %d, %Y')}"
                )
            }
        except ValueError as e:
            return {
                "is_valid": False,
                "expense_date": expense_date,
                "reason": f"Invalid date format. Expected YYYY-MM-DD, got: {expense_date}",
                "error": str(e)
            }
    @staticmethod
    async def evaluate_receipt(
        *,
        extracted_text: str,
        amount: float,
        category: str,
        description: str,
        expense_date: str,
    ) -> Dict[str, Any]:
        # Check date expiration first
        date_validation = LLMReceiptAgent.validate_bill_expiration(expense_date)
        
        if not settings.OLLAMA_ENABLED:
            result = {
                "enabled": False,
                "available": False,
                "decision": "skip" if date_validation["is_valid"] else "block",
                "risk_level": "unknown" if date_validation["is_valid"] else "high",
                "reasons": [] if date_validation["is_valid"] else [date_validation["reason"]],
            }
            if not date_validation["is_valid"]:
                result["date_validation"] = date_validation
            return result

        text = (extracted_text or "").strip()
        if not text:
            return {
                "enabled": True,
                "available": False,
                "decision": "review",
                "risk_level": "high",
                "reasons": ["No text extracted from receipt"],
                "date_validation": date_validation,
            }

        prompt = {
            "task": "receipt_genuineness_check",
            "instructions": [
                "You are a fair auditor agent. Decide whether a receipt looks genuine or suspicious.",
                "A genuine receipt typically has: vendor name, date, items/description, amount, and some form of receipt identifier.",
                "Use only the provided text and metadata. Be reasonable in your assessment.",
                "Block ONLY if the receipt clearly says 'sample', 'demo', 'test', 'mock', 'draft', 'template', or 'for reference only', or shows obvious signs of forgery.",
                "Block if the extracted amount is drastically different (200%+ mismatch) from the claimed amount.",
                "Otherwise, allow genuine-looking receipts. Minor formatting or incomplete fields are normal.",
                "Return ONLY strict JSON. No markdown.",
                "Schema: {decision: 'allow'|'block'|'review', risk_level: 'low'|'medium'|'high', reasons: string[], extracted_total_amount_guess: number|null}",
            ],
            "metadata": {
                "amount": amount,
                "category": category,
                "description": description,
                "expense_date": expense_date,
                "submission_deadline": date_validation["submission_deadline"],
                "date_valid": date_validation["is_valid"],
            },
            "receipt_text": text[:12000],
        }

        url = settings.OLLAMA_URL.rstrip("/") + "/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": json.dumps(prompt, ensure_ascii=False),
            "stream": False,
            "format": "json",
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()

            raw = data.get("response", "")
            parsed = json.loads(raw) if isinstance(raw, str) else raw

            decision = parsed.get("decision")
            risk_level = parsed.get("risk_level")
            reasons = parsed.get("reasons")

            if decision not in {"allow", "block", "review"}:
                decision = "review"
            if risk_level not in {"low", "medium", "high"}:
                risk_level = "high"
            if not isinstance(reasons, list):
                reasons = []
            
            # If date is invalid, block the submission
            if not date_validation["is_valid"]:
                decision = "block"
                risk_level = "high"
                reasons.insert(0, date_validation["reason"])

            return {
                "enabled": True,
                "available": True,
                "decision": decision,
                "risk_level": risk_level,
                "reasons": reasons[:10],
                "extracted_total_amount_guess": parsed.get("extracted_total_amount_guess"),
                "model": settings.OLLAMA_MODEL,
                "date_validation": date_validation,
            }

        except Exception as e:
            return {
                "enabled": True,
                "available": False,
                "decision": "review",
                "risk_level": "high",
                "reasons": [f"Ollama error: {str(e)}"],
                "model": settings.OLLAMA_MODEL,
                "date_validation": date_validation,
            }
