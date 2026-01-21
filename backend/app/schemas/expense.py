from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

# Expense Schemas
class ExpenseCreate(BaseModel):
    category_id: int = Field(..., description="Expense category ID")
    transport_type_id: Optional[int] = Field(None, description="Transport type ID (if applicable)")
    amount: Decimal = Field(..., ge=0, description="Expense amount (can be 0 if receipt is provided)")
    expense_date: date = Field(..., description="Date of expense")
    description: str = Field(..., min_length=5, description="Expense description")
    policy_check_result: Optional[dict] = Field(None, description="Policy check results")

class ExpenseUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = Field(None, min_length=5)
    category_id: Optional[int] = None

class AttachmentResponse(BaseModel):
    id: int
    file_name: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_at: datetime
    file_path: str
    
    class Config:
        from_attributes = True

class ExpenseResponse(BaseModel):
    id: int
    category_id: int
    transport_type_id: Optional[int] = None
    amount: Decimal
    expense_date: date
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    attachments: list[AttachmentResponse] = []
    user_id: Optional[int] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class ExpenseDetailResponse(ExpenseResponse):
    category_id: int
    transport_type_id: Optional[int]
    policy_check_result: Optional[dict]

class ExpenseWithAttachments(ExpenseDetailResponse):
    attachments: list[AttachmentResponse] = []

# Approval Schemas
class ApprovalResponse(BaseModel):
    id: int
    approval_role: str
    decision: str
    comments: Optional[str]
    decided_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ExpenseWithApprovals(ExpenseWithAttachments):
    approvals: list[ApprovalResponse] = []
