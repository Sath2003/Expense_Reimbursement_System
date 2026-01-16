from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
import secrets
import string
from app.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def generate_otp(length: int = 6) -> str:
    """Generate a random 6-digit OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(length))

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Payload data (must include 'sub' for user_id)
        expires_delta: Token expiration time
    
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access",
        "iat": datetime.utcnow()
    })
    
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        print(f"Error creating access token: {e}")
        raise

def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT refresh token
    
    Args:
        data: Payload data (must include 'sub' for user_id)
        expires_delta: Token expiration time
    
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "iat": datetime.utcnow()
    })
    
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        print(f"Error creating refresh token: {e}")
        raise

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify and decode a JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None

def get_user_id_from_token(token: str) -> Optional[int]:
    """
    Extract user_id from JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        User ID or None if invalid
    """
    payload = verify_token(token)
    if payload:
        try:
            return int(payload.get("sub"))
        except (ValueError, TypeError):
            return None
    return None
