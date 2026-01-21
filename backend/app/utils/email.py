import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from typing import Tuple

async def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Send a generic email
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Email body (HTML or plain text)
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.SMTP_EMAIL
        message["To"] = to_email
        
        # Attach body (assume HTML if contains HTML tags, otherwise plain text)
        if '<' in body and '>' in body:
            message.attach(MIMEText(body, "html"))
        else:
            message.attach(MIMEText(body, "plain"))
        
        # Send email
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(message)
        
        print(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False

async def send_otp_email(email: str, otp_code: str, first_name: str) -> bool:
    """
    Send OTP verification email
    
    Args:
        email: Recipient email address
        otp_code: 6-digit OTP code
        first_name: User's first name
    
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Create email message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Email Verification - Your OTP Code"
        message["From"] = settings.SMTP_EMAIL
        message["To"] = email
        
        # HTML email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f0f2f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #2c3e50; margin-top: 0;">Email Verification Required</h2>
                        <p>Hello {first_name},</p>
                        <p>Thank you for registering with our Expense Reimbursement System. To complete your registration and secure your account, please verify your email address using the OTP code below.</p>
                        
                        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                            <p style="font-size: 12px; color: #666; margin-bottom: 10px;">Your OTP Code:</p>
                            <p style="font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 5px; margin: 10px 0;">{otp_code}</p>
                            <p style="font-size: 12px; color: #999; margin-top: 10px;">This code expires in 10 minutes</p>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            If you did not register for this account, please ignore this email.
                        </p>
                        
                        <p style="color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                            Expense Reimbursement System<br>
                            This is an automated email, please do not reply.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Plain text version
        text_body = f"""
Email Verification Required

Hello {first_name},

Thank you for registering with our Expense Reimbursement System. To complete your registration, please verify your email using the OTP code below:

Your OTP Code: {otp_code}

This code expires in 10 minutes.

If you did not register for this account, please ignore this email.

Expense Reimbursement System
        """
        
        # Attach both versions
        message.attach(MIMEText(text_body, "plain"))
        message.attach(MIMEText(html_body, "html"))
        
        # Send email
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(message)
        
        print(f"OTP email sent successfully to {email}")
        return True
        
    except Exception as e:
        print(f"Failed to send OTP email to {email}: {str(e)}")
        return False

async def send_approval_notification(
    email: str,
    user_name: str,
    expense_amount: float,
    decision: str,
    comments: str = None
) -> bool:
    """
    Send approval notification email
    
    Args:
        email: Recipient email
        user_name: Name of expense submitter
        expense_amount: Amount of the expense
        decision: APPROVED or REJECTED
        comments: Comments from approver
    
    Returns:
        True if email sent successfully
    """
    try:
        status_color = "#27ae60" if decision == "APPROVED" else "#e74c3c"
        status_text = "✓ APPROVED" if decision == "APPROVED" else "✗ REJECTED"
        
        message = MIMEMultipart("alternative")
        message["Subject"] = f"Expense {status_text} - {expense_amount}"
        message["From"] = settings.SMTP_EMAIL
        message["To"] = email
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f0f2f5; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #2c3e50;">Expense {status_text}</h2>
                        <p>Hi {user_name},</p>
                        
                        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid {status_color};">
                            <p><strong>Amount:</strong> ${expense_amount:.2f}</p>
                            <p><strong>Status:</strong> <span style="color: {status_color}; font-weight: bold;">{status_text}</span></p>
                            {f'<p><strong>Comments:</strong> {comments}</p>' if comments else ''}
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            Log in to your account to view more details.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
Expense {status_text}

Hi {user_name},

Your expense of ${expense_amount:.2f} has been {decision.lower()}.

{f'Comments: {comments}' if comments else ''}

Log in to your account to view more details.
        """
        
        message.attach(MIMEText(text_body, "plain"))
        message.attach(MIMEText(html_body, "html"))
        
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(message)
        
        print(f"Approval notification sent to {email}")
        return True
        
    except Exception as e:
        print(f"Failed to send approval notification to {email}: {str(e)}")
        return False
