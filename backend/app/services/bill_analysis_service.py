"""
Bill Analysis Service - Uses Llama AI to analyze expense bills for genuineness and flaws
"""
import json
from typing import Optional, Dict, Any
import httpx
from app.config import settings


class BillAnalysisService:
    """Service to analyze expense bills for genuineness, flaws, and rejection reasons"""

    @staticmethod
    def _derive_risk_fields(genuineness_score: Optional[float], is_suspicious: bool) -> Dict[str, Any]:
        score = float(genuineness_score) if genuineness_score is not None else None
        if score is None:
            risk_level = "unknown"
        elif score >= 80:
            risk_level = "low"
        elif score >= 60:
            risk_level = "medium"
        else:
            risk_level = "high"

        if is_suspicious and risk_level == "low":
            risk_level = "medium"

        if score is None:
            recommendation = "⏳ AI ANALYSIS NOT AVAILABLE - MANUAL REVIEW REQUIRED"
        elif score >= 80:
            recommendation = "✅ SAFE TO APPROVE"
        elif score >= 60:
            recommendation = "⚠️ NEEDS REVIEW"
        else:
            recommendation = "❌ RECOMMEND REJECTION"

        return {
            "risk_level": risk_level,
            "recommendation": recommendation,
        }
    
    @staticmethod
    async def analyze_bill_for_rejection(
        *,
        expense_description: str,
        amount: float,
        category: str,
        extracted_text: Optional[str] = None,
        file_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a bill/receipt for genuineness and potential flaws.
        Returns analysis with rejection reasons if issues are found.
        """
        
        if not settings.OLLAMA_ENABLED:
            base = {
                "analysis_available": False,
                "status": "skip",
                "genuineness_score": None,
                "flaws_detected": [],
                "rejection_reasons": [],
                "is_suspicious": False,
                "model_used": settings.OLLAMA_MODEL,
            }
            base.update(BillAnalysisService._derive_risk_fields(None, False))
            return base
        
        # Prepare analysis prompt
        prompt = {
            "task": "bill_analysis_for_rejection",
            "instructions": [
                "You are a fair and professional auditor analyzing an expense bill.",
                "Evaluate the bill for genuineness and potential issues.",
                "A bill is genuine if it appears to be a real receipt/invoice with legitimate merchant/vendor information.",
                "Only reject if there are clear signs of forgery, fabrication, or severe inconsistencies.",
                "Check for: obvious signs of forgery, drastically incorrect amounts (100%+ mismatch), clearly missing critical details, extreme suspicious patterns, or direct policy violations.",
                "Be reasonable: Minor formatting issues, slight amount variations, or missing optional fields are NOT reasons to reject.",
                "Return ONLY valid JSON. No markdown or extra text.",
                "Schema: {genuineness_score: number(0-100), flaws_detected: string[], rejection_reasons: string[], is_suspicious: boolean}",
                "Default to genuine (80+) unless you find specific evidence otherwise.",
            ],
            "expense_data": {
                "description": expense_description,
                "amount": amount,
                "category": category,
                "extracted_text": extracted_text or "No text extracted",
            }
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
                response = await client.post(url, json=payload)
                
                if response.status_code != 200:
                    base = {
                        "analysis_available": False,
                        "status": "error",
                        "error": f"Ollama API error: {response.status_code}",
                        "genuineness_score": None,
                        "flaws_detected": [],
                        "rejection_reasons": [],
                        "is_suspicious": False,
                        "model_used": settings.OLLAMA_MODEL,
                    }
                    base.update(BillAnalysisService._derive_risk_fields(None, False))
                    return base
                
                result = response.json()
                response_text = result.get("response", "").strip()
                
                # Parse the JSON response
                try:
                    analysis = json.loads(response_text)
                    score = analysis.get("genuineness_score", 50)
                    suspicious = bool(analysis.get("is_suspicious", False))
                    base = {
                        "analysis_available": True,
                        "status": "success",
                        "genuineness_score": score,
                        "flaws_detected": analysis.get("flaws_detected", []),
                        "rejection_reasons": analysis.get("rejection_reasons", []),
                        "is_suspicious": suspicious,
                        "model_used": settings.OLLAMA_MODEL,
                    }
                    base.update(BillAnalysisService._derive_risk_fields(score, suspicious))
                    return base
                except json.JSONDecodeError:
                    base = {
                        "analysis_available": False,
                        "status": "parse_error",
                        "raw_response": response_text,
                        "genuineness_score": None,
                        "flaws_detected": [],
                        "rejection_reasons": [],
                        "is_suspicious": True,
                        "model_used": settings.OLLAMA_MODEL,
                    }
                    base.update(BillAnalysisService._derive_risk_fields(None, True))
                    return base
                    
        except Exception as e:
            base = {
                "analysis_available": False,
                "status": "error",
                "error": str(e),
                "genuineness_score": None,
                "flaws_detected": [],
                "rejection_reasons": [],
                "is_suspicious": True,
                "model_used": settings.OLLAMA_MODEL,
            }
            base.update(BillAnalysisService._derive_risk_fields(None, True))
            return base
    
    @staticmethod
    def format_rejection_remarks(analysis: Dict[str, Any]) -> str:
        """
        Format analysis results into readable rejection remarks.
        """
        if not analysis.get("analysis_available"):
            return "AI analysis not available at this time."
        
        remarks = []
        
        # Add genuineness score
        score = analysis.get("genuineness_score")
        if score is not None:
            if score < 20:
                remarks.append(f"Critical: Very low genuineness score: {score}/100 - Bill appears to be forged or fabricated")
            elif score < 50:
                remarks.append(f"Warning: Low genuineness score: {score}/100 - Bill has significant suspicious elements")
            elif score < 70:
                remarks.append(f"Moderate concerns: Genuineness score: {score}/100 - Bill should be reviewed carefully")
            else:
                remarks.append(f"Bill appears genuine: {score}/100 - Low risk")
        
        # Add flaws detected
        flaws = analysis.get("flaws_detected", [])
        if flaws:
            remarks.append("Issues Noted:")
            for flaw in flaws:
                remarks.append(f"  • {flaw}")
        
        # Add rejection reasons
        rejection_reasons = analysis.get("rejection_reasons", [])
        if rejection_reasons:
            remarks.append("Concerns:")
            for reason in rejection_reasons:
                remarks.append(f"  • {reason}")
        
        # Check if suspicious
        if analysis.get("is_suspicious"):
            remarks.append("Flag: Bill marked as suspicious - Manual review recommended")
        
        return "\n".join(remarks) if remarks else "No issues detected - Bill appears genuine"
