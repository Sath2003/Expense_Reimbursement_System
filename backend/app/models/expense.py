from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, ForeignKey, DECIMAL, Text, Date, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class ExpenseStatusEnum(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    HR_APPROVED = "HR_APPROVED"
    POLICY_EXCEPTION = "POLICY_EXCEPTION"
    MANAGER_APPROVED = "MANAGER_APPROVED"  # Legacy status from database
    MANAGER_APPROVED_FOR_VERIFICATION = "MANAGER_APPROVED_FOR_VERIFICATION"
    MANAGER_REJECTED = "MANAGER_REJECTED"
    PENDING_FINANCE_REVIEW = "PENDING_FINANCE_REVIEW"
    FINANCE_APPROVED = "FINANCE_APPROVED"
    FINANCE_REJECTED = "FINANCE_REJECTED"
    PAID = "PAID"

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Alias for compatibility
    @property
    def category_name(self):
        return self.name
    
    expenses = relationship("Expense", back_populates="category")

class TransportationType(Base):
    __tablename__ = "transportation_types"
    
    id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String(50), unique=True, nullable=False)

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=False)
    transport_type_id = Column(Integer, ForeignKey("transportation_types.id"), nullable=True)
    
    amount = Column(DECIMAL(10, 2), nullable=False)
    expense_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(ExpenseStatusEnum), default=ExpenseStatusEnum.SUBMITTED)
    
    # Manager rejection remarks (AI analysis + manual notes)
    rejection_remarks = Column(Text, nullable=True)  # Stores reasons for rejection (AI analysis + manual notes)
    
    # AI Cross-checking fields
    file_hash = Column(String(64), nullable=True)  # For duplicate detection
    extracted_text_hash = Column(String(32), nullable=True)  # For text similarity
    validation_score = Column(DECIMAL(5, 2), nullable=True)  # AI confidence score
    is_ai_validated = Column(Boolean, default=False)  # AI approval status
    risk_factors = Column(Text, nullable=True)  # JSON string of risk factors
    
    policy_check_result = Column(JSON, nullable=True)  # Stores policy validation details
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    employee = relationship("User", back_populates="expenses")
    category = relationship("ExpenseCategory", back_populates="expenses")
    attachments = relationship("ExpenseAttachment", back_populates="expense", cascade="all, delete-orphan")
    approvals = relationship("ExpenseApproval", back_populates="expense", cascade="all, delete-orphan")

class ExpenseAttachment(Base):
    __tablename__ = "expense_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_type = Column(String(50), nullable=False)
    file_hash = Column(String(64), nullable=True)  # For duplicate file detection
    file_size = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    expense = relationship("Expense", back_populates="attachments")
