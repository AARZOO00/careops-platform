from datetime import datetime, timedelta
from typing import Optional
import uuid
from sqlalchemy.orm import Session
import logging
from app.config import settings
#from app.config import settings
from app.services.email import send_email
from app.services.sms import send_sms
from app.models.workspace import Workspace
from app.models.contact import Contact, Conversation, Message
from app.models.booking import Booking, BookingStatus
from app.models.form import Form, FormSubmission
from app.models.inventory import InventoryItem
from app.models.integration import Integration, IntegrationType

logger = logging.getLogger(__name__)

class AutomationService:
    
    @staticmethod
    async def handle_new_contact(workspace: Workspace, contact: Contact):
        """New contact → welcome message"""
        try:
            db = Session.object_session(contact)
            
            # Get active communication channels
            email_config = db.query(Integration).filter(
                Integration.workspace_id == workspace.id,
                Integration.type == IntegrationType.EMAIL,
                Integration.is_active == True
            ).first()
            
            sms_config = db.query(Integration).filter(
                Integration.workspace_id == workspace.id,
                Integration.type == IntegrationType.SMS,
                Integration.is_active == True
            ).first()
            
            # Determine best channel to use
            channel = None
            recipient = None
            
            if contact.email and email_config:
                channel = "email"
                recipient = contact.email
            elif contact.phone and sms_config:
                channel = "sms"
                recipient = contact.phone
            else:
                logger.warning(f"No communication channel available for contact {contact.id}")
                return
            
            # Create welcome message
            welcome_message = f"""Hello {contact.name},

Thank you for reaching out to {workspace.name}! We've received your inquiry and will get back to you as soon as possible.

In the meantime, you can:
- Book an appointment: {settings.PUBLIC_URL}/public/book/{workspace.slug}
- Check our services and availability
- Reply directly to this message with any questions

Best regards,
The {workspace.name} Team"""
            
            # Find or create conversation
            conversation = db.query(Conversation).filter(
                Conversation.workspace_id == workspace.id,
                Conversation.contact_id == contact.id,
                Conversation.status == "active"
            ).first()
            
            if not conversation:
                conversation = Conversation(
                    workspace_id=workspace.id,
                    contact_id=contact.id,
                    subject=f"Welcome to {workspace.name}",
                    status="active"
                )
                db.add(conversation)
                db.flush()
            
            # Create message record
            message = Message(
                conversation_id=conversation.id,
                content=welcome_message,
                channel=channel,
                direction="outbound",
                automated=True,
                status="sent"
            )
            db.add(message)
            
            # Update conversation
            conversation.message_count += 1
            conversation.last_message_at = datetime.utcnow()
            conversation.last_message_direction = "outbound"
            conversation.awaiting_reply = False
            
            db.commit()
            
            # Send actual message
            if channel == "email":
                await send_email(
                    to=recipient,
                    subject=f"Welcome to {workspace.name}",
                    body=welcome_message,
                    workspace=workspace
                )
            elif channel == "sms":
                await send_sms(
                    to=recipient,
                    body=welcome_message,
                    workspace=workspace
                )
            
            logger.info(f"Welcome message sent to contact {contact.id}")
            
        except Exception as e:
            logger.error(f"Error in handle_new_contact: {str(e)}")
    
    @staticmethod
    async def handle_booking_created(workspace: Workspace, booking: Booking):
        """Booking created → confirmation + forms"""
        try:
            db = Session.object_session(booking)
            
            if not booking.contact or not booking.contact.email:
                logger.warning(f"No email for booking {booking.id}")
                return
            
            # Format date and time
            start_date = booking.start_time.strftime('%A, %B %d, %Y')
            start_time = booking.start_time.strftime('%I:%M %p')
            end_time = booking.end_time.strftime('%I:%M %p')
            
            # Create calendar links
            google_calendar_link = f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={workspace.name}+Appointment&dates={booking.start_time.strftime('%Y%m%dT%H%M%S')}/{booking.end_time.strftime('%Y%m%dT%H%M%S')}&details={booking.notes or ''}&location={workspace.address or ''}"
            
            # Send confirmation email
            confirmation_subject = f"Booking Confirmed - {workspace.name}"
            confirmation_body = f"""
Hello {booking.contact.name},

Your booking has been confirmed!

━━━━━━━━━━━━━━━━━━━━━━
📋 APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━

Service: {booking.service.name if booking.service else 'Appointment'}
Date: {start_date}
Time: {start_time} - {end_time}
Duration: {booking.service.duration if booking.service else 'N/A'} minutes

━━━━━━━━━━━━━━━━━━━━━━
📍 LOCATION
━━━━━━━━━━━━━━━━━━━━━━

{workspace.address if workspace.address else 'To be confirmed'}

━━━━━━━━━━━━━━━━━━━━━━
📅 ADD TO CALENDAR
━━━━━━━━━━━━━━━━━━━━━━

Google Calendar: {google_calendar_link}

━━━━━━━━━━━━━━━━━━━━━━
✏️ NEED TO MAKE CHANGES?
━━━━━━━━━━━━━━━━━━━━━━

• To reschedule: Contact us at {workspace.contact_email}
• To cancel: Reply to this email
• Questions: Call us at {workspace.contact_phone or 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing {workspace.name}!

Best regards,
The {workspace.name} Team
"""
            
            await send_email(
                to=booking.contact.email,
                subject=confirmation_subject,
                body=confirmation_body,
                workspace=workspace
            )
            
            booking.confirmation_sent = True
            db.commit()
            
            # Send required forms
            if booking.service:
                forms = db.query(Form).filter(
                    Form.workspace_id == workspace.id,
                    Form.service_id == booking.service.id,
                    Form.is_active == True,
                    Form.require_before_booking == True
                ).all()
                
                for form in forms:
                    # Check if already sent
                    existing = db.query(FormSubmission).filter(
                        FormSubmission.form_id == form.id,
                        FormSubmission.booking_id == booking.id,
                        FormSubmission.contact_id == booking.contact_id
                    ).first()
                    
                    if existing:
                        continue
                    
                    # Create submission
                    token = str(uuid.uuid4())
                    submission = FormSubmission(
                        form_id=form.id,
                        booking_id=booking.id,
                        contact_id=booking.contact_id,
                        token=token,
                        sent_at=datetime.utcnow()
                    )
                    db.add(submission)
                    
                    # Send form link
                    form_link = f"{settings.PUBLIC_URL}/public/form/{token}"
                    form_subject = f"Please complete: {form.name}"
                    form_body = f"""
Hello {booking.contact.name},

Please complete the following form for your upcoming appointment:

━━━━━━━━━━━━━━━━━━━━━━
📋 FORM: {form.name}
━━━━━━━━━━━━━━━━━━━━━━

{form.description if form.description else 'This form is required before your appointment.'}

Link: {form_link}

This form must be completed before your appointment on {start_date} at {start_time}.

━━━━━━━━━━━━━━━━━━━━━━

Thank you for your cooperation!

Best regards,
The {workspace.name} Team
"""
                    
                    await send_email(
                        to=booking.contact.email,
                        subject=form_subject,
                        body=form_body,
                        workspace=workspace
                    )
                
                db.commit()
                logger.info(f"Forms sent for booking {booking.id}")
            
        except Exception as e:
            logger.error(f"Error in handle_booking_created: {str(e)}")
    
    @staticmethod
    async def send_booking_reminders():
        """Before booking → reminder"""
        try:
            from app.config import SessionLocal
            db = SessionLocal()
            
            # Bookings in next 24 hours
            now = datetime.utcnow()
            tomorrow = now + timedelta(days=1)
            
            bookings = db.query(Booking).filter(
                Booking.start_time.between(now, tomorrow),
                Booking.status == BookingStatus.CONFIRMED,
                Booking.reminder_sent == False
            ).all()
            
            for booking in bookings:
                if not booking.contact or not booking.contact.email:
                    continue
                
                # Format date and time
                start_date = booking.start_time.strftime('%A, %B %d, %Y')
                start_time = booking.start_time.strftime('%I:%M %p')
                
                reminder_body = f"""
Hello {booking.contact.name},

This is a reminder of your upcoming appointment:

━━━━━━━━━━━━━━━━━━━━━━
📋 APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━

Service: {booking.service.name if booking.service else 'Appointment'}
Date: {start_date}
Time: {start_time}

━━━━━━━━━━━━━━━━━━━━━━
📍 LOCATION
━━━━━━━━━━━━━━━━━━━━━━

{booking.workspace.address if booking.workspace.address else 'To be confirmed'}

━━━━━━━━━━━━━━━━━━━━━━

We look forward to seeing you!

If you need to reschedule or cancel, please contact us at {booking.workspace.contact_email} or call {booking.workspace.contact_phone or 'N/A'}.

Best regards,
The {booking.workspace.name} Team
"""
                
                await send_email(
                    to=booking.contact.email,
                    subject=f"Reminder: Your appointment tomorrow at {start_time}",
                    body=reminder_body,
                    workspace=booking.workspace
                )
                
                booking.reminder_sent = True
                db.commit()
            
            db.close()
            logger.info(f"Sent {len(bookings)} booking reminders")
            
        except Exception as e:
            logger.error(f"Error in send_booking_reminders: {str(e)}")
    
    @staticmethod
    async def check_inventory_alerts():
        """Inventory below threshold → alert"""
        try:
            from app.config import SessionLocal
            db = SessionLocal()
            
            # Find low stock items that haven't triggered alert
            items = db.query(InventoryItem).filter(
                InventoryItem.quantity <= InventoryItem.threshold,
                InventoryItem.low_stock_alert_sent == False
            ).all()
            
            for item in items:
                # Get workspace admins
                admins = [user for user in item.workspace.users if user.role == "admin"]
                
                for admin in admins:
                    alert_body = f"""
⚠️ LOW STOCK ALERT - {item.workspace.name}

━━━━━━━━━━━━━━━━━━━━━━
📦 INVENTORY ITEM
━━━━━━━━━━━━━━━━━━━━━━

Item: {item.name}
SKU: {item.sku}
Current Quantity: {item.quantity} {item.unit}
Threshold: {item.threshold} {item.unit}
Reorder Point: {item.reorder_point if item.reorder_point else 'Not set'}

━━━━━━━━━━━━━━━━━━━━━━
⚠️ ACTION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━

This item is below the minimum threshold and needs to be reordered.

View inventory: {settings.APP_URL}/inventory/{item.id}

━━━━━━━━━━━━━━━━━━━━━━

Supplier Information:
{item.supplier_info if item.supplier_info else 'No supplier information available'}

Best regards,
CareOps Inventory System
"""
                    
                    await send_email(
                        to=admin.email,
                        subject=f"⚠️ Low Stock Alert: {item.name}",
                        body=alert_body,
                        workspace=item.workspace
                    )
                
                item.low_stock_alert_sent = True
                db.commit()
            
            db.close()
            logger.info(f"Sent {len(items)} inventory alerts")
            
        except Exception as e:
            logger.error(f"Error in check_inventory_alerts: {str(e)}")
    
    @staticmethod
    async def send_form_reminders():
        """Pending forms → reminder"""
        try:
            from app.config import SessionLocal
            db = SessionLocal()
            
            # Forms pending for > 24 hours
            cutoff = datetime.utcnow() - timedelta(days=1)
            
            submissions = db.query(FormSubmission).filter(
                FormSubmission.completed_at == None,
                FormSubmission.sent_at <= cutoff
            ).all()
            
            for submission in submissions[:50]:  # Limit to 50 at a time
                if not submission.contact or not submission.contact.email:
                    continue
                
                if not submission.booking:
                    continue
                
                # Format date
                start_date = submission.booking.start_time.strftime('%A, %B %d, %Y')
                
                reminder_body = f"""
Hello {submission.contact.name},

This is a reminder to complete the following form:

━━━━━━━━━━━━━━━━━━━━━━
📋 FORM: {submission.form.name}
━━━━━━━━━━━━━━━━━━━━━━

{submission.form.description if submission.form.description else 'This form is required for your upcoming appointment.'}

Link: {settings.PUBLIC_URL}/public/form/{submission.token}

━━━━━━━━━━━━━━━━━━━━━━
📅 APPOINTMENT
━━━━━━━━━━━━━━━━━━━━━━

Date: {start_date}
Time: {submission.booking.start_time.strftime('%I:%M %p')}

━━━━━━━━━━━━━━━━━━━━━━

Please complete this form as soon as possible.

Thank you for your cooperation!

Best regards,
The {submission.booking.workspace.name} Team
"""
                
                await send_email(
                    to=submission.contact.email,
                    subject=f"Reminder: Please complete {submission.form.name}",
                    body=reminder_body,
                    workspace=submission.booking.workspace
                )
            
            db.close()
            logger.info(f"Sent form reminders")
            
        except Exception as e:
            logger.error(f"Error in send_form_reminders: {str(e)}")