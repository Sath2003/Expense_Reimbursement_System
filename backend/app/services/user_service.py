from sqlalchemy.orm import Session
from app.models.user import User, Role, EmployeeGrade, RoleEnum
from app.schemas.user import UserRegisterRequest
from app.utils.security import hash_password, verify_password, generate_otp
from app.utils.email import send_otp_email
from datetime import datetime, timedelta
from typing import Optional, Tuple

class UserService:
    
    @staticmethod
    def register_user(db: Session, user_data: UserRegisterRequest) -> Tuple[Optional[User], Optional[str]]:
        """
        Register a new user and generate OTP
        Returns: (User object, error message or None)
        """
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            return None, "Email already registered"
        
        # Validate manager exists if manager_id is provided
        manager_id = None
        if user_data.manager_id:
            manager = db.query(User).filter(User.id == user_data.manager_id).first()
            if not manager:
                return None, f"Manager with ID {user_data.manager_id} not found"
            manager_id = user_data.manager_id
        
        # Get EMPLOYEE role
        employee_role = db.query(Role).filter(Role.role_name == RoleEnum.EMPLOYEE.value).first()
        if not employee_role:
            return None, "Employee role not found in system"
        
        # Generate OTP
        otp_code = generate_otp()
        otp_expires_at = datetime.utcnow() + timedelta(minutes=1)
        
        # Generate employee ID (sequential from 2)
        last_employee = db.query(User).filter(User.role_id == employee_role.id).order_by(User.id.desc()).first()
        next_id = 2 if last_employee is None else int(last_employee.employee_id[3:]) + 1
        employee_id = f"EMP{next_id:03d}"  # EMP001, EMP002, EMP003, etc.
        
        # Create user
        new_user = User(
            email=user_data.email,
            password=hash_password(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone_number=user_data.phone_number,
            designation=user_data.designation,
            department=user_data.department,
            role_id=employee_role.id,
            employee_id=employee_id,
            otp_code=otp_code,
            otp_expires_at=otp_expires_at,
            is_verified=False
        )
        
        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user, None
        except Exception as e:
            db.rollback()
            return None, f"Error creating user: {str(e)}"
    
    @staticmethod
    async def send_otp(db: Session, user: User) -> Tuple[bool, str]:
        """
        Send OTP email to user
        Returns: (success, message)
        """
        if not user.otp_code:
            return False, "OTP not generated"
        
        success = await send_otp_email(user.email, user.otp_code, user.first_name)
        if success:
            return True, "OTP sent successfully to your email"
        else:
            return False, "Failed to send OTP email. Please try again."
    
    @staticmethod
    def verify_otp(db: Session, email: str, otp_code: str) -> Tuple[Optional[User], Optional[str]]:
        """
        Verify OTP and activate user
        Returns: (User object, error message or None)
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None, "User not found"
        
        if user.is_verified:
            return user, None  # Already verified
        
        if not user.otp_code:
            return None, "OTP not generated. Please register again."
        
        if user.otp_code != otp_code:
            return None, "Invalid OTP code"
        
        if user.otp_expires_at < datetime.utcnow():
            return None, "OTP has expired. Please register again."
        
        # Mark user as verified
        user.is_verified = True
        user.otp_code = None
        user.otp_expires_at = None
        
        try:
            db.commit()
            db.refresh(user)
            return user, None
        except Exception as e:
            db.rollback()
            return None, f"Error verifying OTP: {str(e)}"
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Tuple[Optional[User], Optional[str]]:
        """
        Authenticate user with email and password
        Returns: (User object, error message or None)
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None, "Invalid email or password"
        
        if not user.is_verified:
            return None, "Please verify your email first"
        
        if not user.is_active:
            return None, "Your account has been deactivated"
        
        if not verify_password(password, user.password):
            return None, "Invalid email or password"
        
        return user, None
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
