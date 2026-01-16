from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User
from datetime import datetime
import json

class AuditLogger:
    
    @staticmethod
    def log(
        db: Session,
        entity_type: str,
        entity_id: int,
        action: str,
        performed_by: int,
        old_value: dict = None,
        new_value: dict = None,
        ip_address: str = None
    ):
        """Log an action to audit trail"""
        try:
            audit_log = AuditLog(
                entity_type=entity_type,
                entity_id=entity_id,
                action=action,
                performed_by=performed_by,
                old_value=old_value,
                new_value=new_value,
                performed_at=datetime.utcnow(),
                ip_address=ip_address
            )
            db.add(audit_log)
            # Don't commit - let the caller handle it
            # db.commit()
        except Exception as e:
            print(f"Error logging audit: {e}")
            # Don't rollback the entire transaction
            pass
    
    @staticmethod
    def get_audit_trail(db: Session, entity_type: str, entity_id: int):
        """Get audit trail for an entity"""
        return db.query(AuditLog).filter(
            AuditLog.entity_type == entity_type,
            AuditLog.entity_id == entity_id
        ).order_by(AuditLog.performed_at.desc()).all()
