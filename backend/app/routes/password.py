from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime, timedelta
import secrets
import string
import logging

from app.config import get_db, settings
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.services.email import send_password_reset_email
from app.routes.auth import get_password_hash, pwd_context

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v

class VerifyTokenRequest(BaseModel):
    token: str

class PasswordResetResponse(BaseModel):
    message: str
    success: bool

def generate_reset_token():
    """Generate a secure random token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(64))

@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Request password reset - sends email with reset link
    """
    logger.info(f"Password reset requested for email: {request.email}")
    
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    
    # Always return success even if user not found (security)
    if not user:
        logger.info(f"User not found: {request.email}")
        return {
            "message": "If an account exists with this email, you will receive a password reset link.",
            "success": True
        }
    
    # Generate token
    token = generate_reset_token()
    expires_at = datetime.utcnow() + timedelta(minutes=30)
    
    # Create reset token record
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_token)
    db.commit()
    
    # Send email in background
    background_tasks.add_task(
        send_password_reset_email,
        email=user.email,
        name=user.full_name,
        token=token
    )
    
    logger.info(f"Password reset token generated for user: {user.email}")
    
    return {
        "message": "If an account exists with this email, you will receive a password reset link.",
        "success": True
    }

@router.post("/reset-password", response_model=PasswordResetResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using token
    """
    logger.info("Password reset attempt")
    
    # Find valid token
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_token:
        logger.warning(f"Invalid or expired token: {request.token[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Get user
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        logger.error(f"User not found for token: {reset_token.user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    
    # Mark token as used
    reset_token.used = True
    
    db.commit()
    
    logger.info(f"Password reset successful for user: {user.email}")
    
    return {
        "message": "Password has been reset successfully. You can now login with your new password.",
        "success": True
    }

@router.post("/verify-reset-token")
async def verify_reset_token(
    request: VerifyTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Verify if reset token is valid
    """
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_token:
        return {"valid": False, "message": "Invalid or expired token"}
    
    return {
        "valid": True,
        "message": "Token is valid",
        "email": reset_token.user.email
    }