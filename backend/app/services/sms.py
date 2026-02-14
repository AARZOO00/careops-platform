from typing import Optional
import logging
from app.config import settings
from app.models.workspace import Workspace
from app.models.integration import Integration, IntegrationType, IntegrationProvider

logger = logging.getLogger(__name__)

async def send_sms(
    to: str,
    body: str,
    workspace: Optional[Workspace] = None
):
    """Send SMS using configured provider"""
    try:
        if workspace:
            db = Session.object_session(workspace) if workspace else None
            if db:
                sms_config = db.query(Integration).filter(
                    Integration.workspace_id == workspace.id,
                    Integration.type == IntegrationType.SMS,
                    Integration.is_active == True
                ).first()
                
                if sms_config:
                    provider = sms_config.provider
                    credentials = sms_config.credentials
                    
                    if provider == IntegrationProvider.TWILIO:
                        await send_twilio_sms(
                            to=to,
                            body=body,
                            from_number=credentials.get("from_number"),
                            account_sid=credentials.get("account_sid"),
                            auth_token=credentials.get("auth_token")
                        )
                    else:
                        # Log SMS for development
                        logger.info(f"[SMS] To: {to} | Body: {body[:100]}...")
                else:
                    # Log SMS for development
                    logger.info(f"[SMS] To: {to} | Body: {body[:100]}...")
        else:
            # Log SMS for development
            logger.info(f"[SMS] To: {to} | Body: {body[:100]}...")
            
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")

async def send_twilio_sms(to: str, body: str, from_number: str, account_sid: str, auth_token: str):
    """Send SMS via Twilio"""
    try:
        from twilio.rest import Client
        
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=body,
            from_=from_number,
            to=to
        )
        logger.info(f"Twilio message sent: {message.sid}")
        
    except ImportError:
        logger.warning("Twilio not installed. Using console logging.")
        logger.info(f"[TWILIO] To: {to} | From: {from_number} | Body: {body[:100]}...")
    except Exception as e:
        logger.error(f"Twilio error: {str(e)}")