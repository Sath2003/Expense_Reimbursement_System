from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="User's email address (must be valid)")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    first_name: str = Field(..., min_length=2, description="User's first name")
    last_name: str = Field(..., min_length=2, description="User's last name")
    phone_number: Optional[str] = Field(None, description="User's phone number")
    designation: str = Field(..., min_length=2, description="Job designation or title")
    department: str = Field(..., min_length=2, description="Department name")
    manager_id: Optional[int] = Field(None, description="ID of the user's manager")

class UserRegisterResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    message: str
    otp_message: str
    
    class Config:
        from_attributes = True

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    first_name: str
    last_name: str
    role: str
    employee_id: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserProfileResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    designation: str
    department: str
    is_verified: bool
    is_active: bool
    employee_id: Optional[str] = None
    
    class Config:
        from_attributes = True
