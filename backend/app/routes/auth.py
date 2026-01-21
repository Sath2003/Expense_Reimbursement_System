from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import (
    UserRegisterRequest, UserRegisterResponse, VerifyOTPRequest,
    LoginRequest, TokenResponse, RefreshTokenRequest, UserProfileResponse,
    PasswordResetRequest, PasswordResetConfirmRequest
)
from app.services.user_service import UserService
from app.utils.security import create_access_token, create_refresh_token, verify_token
from app.utils.dependencies import extract_bearer_token

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/register", response_model=UserRegisterResponse)
async def register(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user
    - Sends OTP to email for verification
    """
    # Register user
    user, error = UserService.register_user(db, user_data)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    
    # Send OTP email
    success, message = await UserService.send_otp(db, user)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message)
    
    return UserRegisterResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        message="User registered successfully",
        otp_message=message
    )

@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verify OTP and activate user account
    """
    user, error = UserService.verify_otp(db, data.email, data.otp_code)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    
    return {
        "message": "Email verified successfully",
        "email": user.email,
        "is_verified": user.is_verified,
        "id": user.id
    }

@router.post("/password-reset/request")
async def request_password_reset(data: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Request password reset OTP
    """
    user, error = UserService.request_password_reset(db, data.email)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    success, message = await UserService.send_otp(db, user)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message)

    return {"message": message, "email": user.email}

@router.post("/password-reset/confirm")
async def confirm_password_reset(data: PasswordResetConfirmRequest, db: Session = Depends(get_db)):
    """
    Verify OTP and update password
    """
    error = UserService.reset_password(
        db,
        data.email,
        data.otp_code,
        data.new_password,
        data.confirm_password
    )
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Password updated successfully"}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Login with email and password
    - Returns access and refresh tokens
    """
    # Authenticate user
    user, error = UserService.authenticate_user(db, credentials.email, credentials.password)
    if error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error)
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.role_name,
        employee_id=user.employee_id
    )

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token
    """
    # Verify refresh token
    payload = verify_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id = int(payload.get("sub"))
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Create new tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user_id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.role_name,
        employee_id=user.employee_id
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user(
    token: str = Depends(extract_bearer_token),
    db: Session = Depends(get_db)
):
    """
    Get current user profile
    - Extracts user_id from Authorization header Bearer token
    """
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = int(payload.get("sub"))
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return user
