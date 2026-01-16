from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False)  # 'expense', 'approval', 'attachment'
    entity_id = Column(Integer, nullable=False)
    action = Column(String(50), nullable=False)  # 'created', 'updated', 'approved', 'rejected'
    
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    
    performed_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(50), nullable=True)
