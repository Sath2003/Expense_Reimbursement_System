from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class ApprovalDecisionRequest(BaseModel):
    model_config = ConfigDict(extra='allow')
    
    decision: Optional[str] = Field(None, description="APPROVED or REJECTED")
    comments: Optional[str] = Field(None, description="Approval comments")
    amount_adjusted: Optional[str] = Field(None, description="Adjusted amount if partially approved")

class ApprovalResponse(BaseModel):
    id: int
    expense_id: int
    approval_role: str
    decision: str
    comments: Optional[str]
    decided_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ApprovalListResponse(BaseModel):
    id: int
    expense_id: int
    approval_role: str
    decision: str
    created_at: datetime
    
    class Config:
        from_attributes = True
