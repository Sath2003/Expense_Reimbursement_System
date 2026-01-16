from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class ApprovalDecision(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ApprovalRole(str, enum.Enum):
    MANAGER = "MANAGER"
    FINANCE = "FINANCE"
    HR = "HR"

class ExpenseApproval(Base):
    __tablename__ = "expense_approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # NULL if pending
    
    approval_role = Column(Enum(ApprovalRole), nullable=False)  # MANAGER or FINANCE
    decision = Column(Enum(ApprovalDecision), default=ApprovalDecision.PENDING)
    
    comments = Column(Text, nullable=True)
    amount_adjusted = Column(String(50), nullable=True)  # If partially approved
    
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    expense = relationship("Expense", back_populates="approvals")
    approved_by_user = relationship("User", back_populates="approvals")
