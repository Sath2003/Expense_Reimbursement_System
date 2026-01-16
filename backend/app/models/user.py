from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum, ForeignKey, DECIMAL, Text, Date
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class RoleEnum(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    FINANCE = "FINANCE"
    HR = "HR"
    ADMIN = "ADMIN"

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    users = relationship("User", back_populates="role")

class EmployeeGrade(Base):
    __tablename__ = "employee_grades"
    
    id = Column(Integer, primary_key=True, index=True)
    grade_code = Column(String(1), unique=True, nullable=False)
    grade_name = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    
    users = relationship("User", back_populates="grade")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), nullable=True)
    password = Column(String(255), nullable=False)
    designation = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    employee_id = Column(String(50), unique=True, nullable=True, index=True)
    manager_id = Column(Integer, nullable=True)
    
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    grade_id = Column(Integer, ForeignKey("employee_grades.id"), nullable=True)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    role = relationship("Role", back_populates="users")
    grade = relationship("EmployeeGrade", back_populates="users")
    expenses = relationship("Expense", back_populates="employee")
    approvals = relationship("ExpenseApproval", back_populates="approved_by_user")
