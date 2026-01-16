import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import threading

class EmailService:
    
    @staticmethod
    def send_approval_email(to_email: str, employee_name: str, expense_amount: float, expense_description: str):
        """Send approval email to employee"""
        subject = "Expense Approval Notification"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #27ae60; margin-top: 0;">Expense Approval Notification</h2>
                    
                    <p>Dear {employee_name},</p>
                    
                    <p>We are pleased to inform you that your submitted expense has been reviewed and approved by the Finance department. The reimbursement amount will be processed according to our standard procedures.</p>
                    
                    <div style="background-color: #f0f8f0; border-left: 4px solid #27ae60; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #27ae60; font-size: 14px;">Expense Details</h3>
                        <p style="margin: 8px 0;"><strong>Description:</strong> {expense_description}</p>
                        <p style="margin: 8px 0;"><strong>Amount:</strong> ₹{expense_amount:.2f}</p>
                        <p style="margin: 8px 0;"><strong>Processing Timeline:</strong> 6 to 8 working days</p>
                    </div>
                    
                    <p>The approved amount will be transferred to your registered bank account. Please verify that your banking information is current in the system.</p>
                    
                    <p>Should you have any queries regarding this approval, please contact the Finance department at <strong>finance@expensehub.com</strong>.</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="font-size: 11px; color: #999; margin: 0;">
                        This is an automated notification from the Expense Reimbursement System. Please do not reply to this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        EmailService._send_email(to_email, subject, html_body)
    
    @staticmethod
    def send_rejection_email(to_email: str, employee_name: str, expense_amount: float, 
                           expense_description: str, rejection_reason: str, finance_contact: str):
        """Send rejection email to employee with detailed review"""
        subject = "Expense Review Required - Finance Department"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d9534f; margin-top: 0;">Expense Review Required</h2>
                    
                    <p>Dear {employee_name},</p>
                    
                    <p>Your submitted expense has been reviewed by the Finance department. The request requires revision and resubmission before it can be approved.</p>
                    
                    <div style="background-color: #f5f5f5; border-left: 4px solid #d9534f; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #d9534f; font-size: 14px;">Expense Details</h3>
                        <p style="margin: 8px 0;"><strong>Description:</strong> {expense_description}</p>
                        <p style="margin: 8px 0;"><strong>Amount:</strong> ₹{expense_amount:.2f}</p>
                    </div>
                    
                    <div style="background-color: #fef5f5; border-left: 4px solid #c9302c; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #c9302c; font-size: 14px;">Review Findings</h3>
                        <p>{rejection_reason}</p>
                    </div>
                    
                    <p><strong>Recommended Actions:</strong></p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Review the findings detailed above</li>
                        <li>Correct the identified issues</li>
                        <li>Resubmit the expense through the system</li>
                        <li>Contact the Finance department if clarification is required</li>
                    </ul>
                    
                    <p>For assistance with this review or to discuss this decision further, please contact the Finance department:</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> {finance_contact}</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="font-size: 11px; color: #999; margin: 0;">
                        This is an automated notification from the Expense Reimbursement System. Please do not reply to this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        EmailService._send_email(to_email, subject, html_body)
    
    @staticmethod
    def _send_email(to_email: str, subject: str, html_body: str):
        """Internal method to send email asynchronously"""
        try:
            # Run email sending in background thread to avoid blocking
            thread = threading.Thread(
                target=EmailService._send_email_sync,
                args=(to_email, subject, html_body)
            )
            thread.daemon = True
            thread.start()
        except Exception as e:
            print(f"Error initiating email send: {e}")
    
    @staticmethod
    def _send_email_sync(to_email: str, subject: str, html_body: str):
        """Synchronous email sending"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.SMTP_EMAIL
            msg['To'] = to_email
            
            # Attach HTML content
            part = MIMEText(html_body, 'html')
            msg.attach(part)
            
            # Send email
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            print(f"Email sent successfully to {to_email}")
        
        except Exception as e:
            print(f"Error sending email to {to_email}: {str(e)}")
