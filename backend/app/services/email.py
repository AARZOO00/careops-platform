from typing import Optional
import logging
from app.config import settings
from app.models.workspace import Workspace
from app.models.integration import Integration, IntegrationType, IntegrationProvider

logger = logging.getLogger(__name__)

async def send_email(
    to: str,
    subject: str,
    body: str,
    workspace: Optional[Workspace] = None,
    from_email: Optional[str] = None
):
    """Send email using configured provider"""
    try:
        if workspace:
            # Get workspace email config
            db = Session.object_session(workspace) if workspace else None
            if db:
                email_config = db.query(Integration).filter(
                    Integration.workspace_id == workspace.id,
                    Integration.type == IntegrationType.EMAIL,
                    Integration.is_active == True
                ).first()
                
                if email_config:
                    provider = email_config.provider
                    credentials = email_config.credentials
                    
                    if provider == IntegrationProvider.SENDGRID:
                        await send_sendgrid_email(
                            to=to,
                            subject=subject,
                            body=body,
                            from_email=credentials.get("from_email", from_email)
                        )
                    elif provider == IntegrationProvider.SMTP:
                        await send_smtp_email(
                            to=to,
                            subject=subject,
                            body=body,
                            config=credentials
                        )
                    else:
                        # Log email for development
                        logger.info(f"[EMAIL] To: {to} | Subject: {subject}")
                        logger.info(f"[EMAIL] Body: {body[:200]}...")
                else:
                    # Log email for development
                    logger.info(f"[EMAIL] To: {to} | Subject: {subject}")
                    logger.info(f"[EMAIL] Body: {body[:200]}...")
        else:
            # Log email for development
            logger.info(f"[EMAIL] To: {to} | Subject: {subject}")
            logger.info(f"[EMAIL] Body: {body[:200]}...")
            
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        # Fail gracefully - don't break the flow

async def send_password_reset_email(email: str, name: str, token: str):
    """Send password reset email with styled template"""
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9fafb;
            }}
            .container {{
                max-width: 480px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
                padding: 32px 24px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                color: white;
                font-size: 28px;
                font-weight: 600;
            }}
            .content {{
                padding: 32px 24px;
            }}
            .content p {{
                margin: 0 0 16px 0;
                color: #4B5563;
            }}
            .button {{
                display: inline-block;
                background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
                color: white !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 16px;
                margin: 24px 0;
                box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
            }}
            .footer {{
                padding: 24px;
                text-align: center;
                background-color: #F9FAFB;
                border-top: 1px solid #E5E7EB;
            }}
            .footer p {{
                margin: 0;
                color: #6B7280;
                font-size: 14px;
            }}
            .link-box {{
                background-color: #F3F4F6;
                border-radius: 8px;
                padding: 12px;
                margin: 16px 0;
                word-break: break-all;
                font-family: monospace;
                font-size: 14px;
                color: #374151;
            }}
            .warning {{
                color: #EF4444;
                font-size: 14px;
                margin-top: 16px;
                padding: 12px;
                background-color: #FEF2F2;
                border-radius: 8px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Reset Your Password</h1>
            </div>
            <div class="content">
                <p>Hello <strong>{name}</strong>,</p>
                <p>We received a request to reset the password for your CareOps account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <div class="link-box">{reset_link}</div>
                
                <div class="warning">
                    ⚠️ This link will expire in <strong>30 minutes</strong> and can only be used once.
                </div>
                
                <p style="margin-top: 24px;">If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
                
                <p style="margin-top: 24px;">Best regards,<br>The CareOps Team</p>
            </div>
            <div class="footer">
                <p>© 2026 CareOps. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_text = f"""
Hello {name},

We received a request to reset your CareOps password. Click the link below to create a new password:

{reset_link}

This link will expire in 30 minutes and can only be used once.

If you didn't request this, please ignore this email.

Best regards,
The CareOps Team
"""
    
    try:
        # Send via SendGrid if configured
        if settings.SENDGRID_API_KEY:
            await send_sendgrid_email(
                to=email,
                subject="Reset Your CareOps Password",
                html=html_content,
                text=plain_text,
                from_email="noreply@careops.com"
            )
        else:
            # Log for development
            logger.info(f"[PASSWORD RESET EMAIL] To: {email}")
            logger.info(f"Reset link: {reset_link}")
            logger.info(f"HTML Content: {html_content[:200]}...")
            
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
        # Don't raise - we don't want to expose this to the user

async def send_sendgrid_email(to: str, subject: str, body: str, from_email: str, html: str = None, text: str = None):
    """Send email via SendGrid"""
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
        
        mail = Mail(
            from_email=Email(from_email or "noreply@careops.com"),
            to_emails=To(to),
            subject=subject,
            plain_text_content=text or body,
            html_content=html or body.replace("\n", "<br>")
        )
        
        response = sg.send(mail)
        logger.info(f"SendGrid response: {response.status_code}")
        
    except ImportError:
        logger.warning("SendGrid not installed. Using console logging.")
        logger.info(f"[SENDGRID] To: {to} | Subject: {subject}")
    except Exception as e:
        logger.error(f"SendGrid error: {str(e)}")

async def send_smtp_email(to: str, subject: str, body: str, config: dict):
    """Send email via SMTP"""
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        msg = MIMEMultipart()
        msg['From'] = config.get('from_email', 'noreply@careops.com')
        msg['To'] = to
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        # SMTP configuration
        smtp_host = config.get('host', 'smtp.gmail.com')
        smtp_port = config.get('port', 587)
        smtp_user = config.get('username')
        smtp_pass = config.get('password')
        
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        
        if smtp_user and smtp_pass:
            server.login(smtp_user, smtp_pass)
        
        server.send_message(msg)
        server.quit()
        
        logger.info(f"SMTP email sent to {to}")
        
    except ImportError:
        logger.warning("SMTP libraries not available. Using console logging.")
        logger.info(f"[SMTP] To: {to} | Subject: {subject}")
    except Exception as e:
        logger.error(f"SMTP error: {str(e)}")