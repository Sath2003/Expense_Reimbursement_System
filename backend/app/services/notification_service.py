from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationTypeEnum
from app.models.user import User
from app.utils.email import send_email
from typing import Optional, List
from datetime import datetime

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: NotificationTypeEnum,
        title: str,
        message: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None
    ) -> Notification:
        """
        Create a new notification
        """
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            entity_type=entity_type,
            entity_id=entity_id
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    
    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """
        Get notifications for a user
        """
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        return query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
        """
        Mark a notification as read
        """
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notification:
            notification.is_read = True
            db.commit()
            return True
        return False
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """
        Mark all notifications as read for a user
        """
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return count
    
    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """
        Get count of unread notifications for a user
        """
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    @staticmethod
    async def send_email_notification(
        db: Session,
        user: User,
        subject: str,
        message: str,
        notification_type: NotificationTypeEnum = NotificationTypeEnum.INFO
    ):
        """
        Send email notification and create in-app notification
        """
        # Send email
        try:
            await send_email(
                to_email=user.email,
                subject=subject,
                body=message
            )
            email_sent = True
        except Exception as e:
            print(f"Failed to send email to {user.email}: {e}")
            email_sent = False
        
        # Create in-app notification
        NotificationService.create_notification(
            db=db,
            user_id=user.id,
            notification_type=notification_type,
            title=subject,
            message=message
        )
        
        return email_sent
    
    @staticmethod
    async def notify_expense_submitted(db: Session, expense, employee: User):
        """
        Notify manager when an expense is submitted
        """
        # Find manager
        manager = db.query(User).filter(User.role_id == 2).first()
        if not manager:
            return
        
        subject = f"New Expense Submitted: ₹{expense.amount:.2f} by {employee.first_name}"
        message = f"""
Dear {manager.first_name},

{employee.first_name} {employee.last_name} has submitted a new expense for your review:

Details:
- Amount: ₹{expense.amount:.2f}
- Category: {expense.category.category_name if expense.category else 'Unknown'}
- Description: {expense.description or 'No description'}
- Date: {expense.expense_date}

Please review and approve/reject at your earliest convenience.

Best regards,
ExpenseHub System
        """.strip()
        
        await NotificationService.send_email_notification(
            db=db,
            user=manager,
            subject=subject,
            message=message,
            notification_type=NotificationTypeEnum.INFO
        )
    
    @staticmethod
    async def notify_expense_approved(db: Session, expense, approved_by: User):
        """
        Notify employee when expense is approved
        """
        subject = f"Expense Approved: ₹{expense.amount:.2f}"
        message = f"""
Dear {expense.employee.first_name},

Your expense has been approved by {approved_by.first_name} {approved_by.last_name}:

Details:
- Amount: ₹{expense.amount:.2f}
- Category: {expense.category.category_name if expense.category else 'Unknown'}
- Description: {expense.description or 'No description'}
- Approved on: {datetime.now().strftime('%Y-%m-%d %H:%M')}

The expense will now move to finance review for final processing.

Best regards,
ExpenseHub System
        """.strip()
        
        await NotificationService.send_email_notification(
            db=db,
            user=expense.employee,
            subject=subject,
            message=message,
            notification_type=NotificationTypeEnum.SUCCESS
        )
    
    @staticmethod
    async def notify_expense_rejected(db: Session, expense, rejected_by: User, remarks: str):
        """
        Notify employee when expense is rejected
        """
        subject = f"Expense Rejected: ₹{expense.amount:.2f}"
        message = f"""
Dear {expense.employee.first_name},

Your expense has been rejected by {rejected_by.first_name} {rejected_by.last_name}:

Details:
- Amount: ₹{expense.amount:.2f}
- Category: {expense.category.category_name if expense.category else 'Unknown'}
- Description: {expense.description or 'No description'}
- Rejected on: {datetime.now().strftime('%Y-%m-%d %H:%M')}

Remarks: {remarks or 'No remarks provided'}

You may resubmit the expense with corrections if needed.

Best regards,
ExpenseHub System
        """.strip()
        
        await NotificationService.send_email_notification(
            db=db,
            user=expense.employee,
            subject=subject,
            message=message,
            notification_type=NotificationTypeEnum.WARNING
        )
    
    @staticmethod
    async def notify_payment_processed(db: Session, expense, processed_by: User):
        """
        Notify employee when payment is processed
        """
        subject = f"Payment Processed: ₹{expense.amount:.2f}"
        message = f"""
Dear {expense.employee.first_name},

Your expense reimbursement has been processed:

Details:
- Amount: ₹{expense.amount:.2f}
- Category: {expense.category.category_name if expense.category else 'Unknown'}
- Description: {expense.description or 'No description'}
- Processed on: {datetime.now().strftime('%Y-%m-%d %H:%M')}

The amount should reflect in your account shortly.

Best regards,
ExpenseHub System
        """.strip()
        
        await NotificationService.send_email_notification(
            db=db,
            user=expense.employee,
            subject=subject,
            message=message,
            notification_type=NotificationTypeEnum.SUCCESS
        )
