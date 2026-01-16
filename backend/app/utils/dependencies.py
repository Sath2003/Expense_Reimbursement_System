from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.security import verify_token, get_user_id_from_token
from app.models.user import User
from typing import Optional

def extract_bearer_token(authorization: str = Header(None)) -> str:
    """
    Extract and validate Bearer token from Authorization header
    
    Args:
        authorization: Authorization header value
    
    Returns:
        JWT token string
    
    Raises:
        HTTPException: If token is missing or invalid format
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return parts[1]

def get_current_user(
    token: str = Depends(extract_bearer_token),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    
    Args:
        token: JWT token from Authorization header
        db: Database session
    
    Returns:
        User object
    
    Raises:
        HTTPException: If token is invalid or user not found
    """
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    return user

def get_current_user_id(
    token: str = Depends(extract_bearer_token)
) -> int:
    """
    Get current user ID from JWT token without database query
    
    Args:
        token: JWT token from Authorization header
    
    Returns:
        User ID
    
    Raises:
        HTTPException: If token is invalid
    """
    user_id = get_user_id_from_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user_id

def get_optional_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None
    
    Args:
        authorization: Authorization header
        db: Database session
    
    Returns:
        User object or None if not authenticated
    """
    if not authorization:
        return None
    
    try:
        token = extract_bearer_token(authorization)
        return get_current_user(token, db)
    except HTTPException:
        return None
