from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional
from app.config import get_db
from app.dependencies import get_current_workspace
from app.models.workspace import Workspace
from app.models.booking import Booking, BookingStatus
from app.models.contact import Conversation, Message
from app.models.form import Form, FormSubmission
from app.models.inventory import InventoryItem

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard metrics"""
    
    today = date.today()
    now = datetime.utcnow()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    # ============ BOOKING METRICS ============
    # Today's bookings
    todays_bookings = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.start_time >= start_of_day,
        Booking.start_time <= end_of_day
    ).count()
    
    # Upcoming bookings
    upcoming_bookings = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.start_time > now,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING])
    ).count()
    
    # Completed today
    completed_today = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.start_time >= start_of_day,
        Booking.start_time <= end_of_day,
        Booking.status == BookingStatus.COMPLETED
    ).count()
    
    # No-shows today
    no_shows_today = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.start_time >= start_of_day,
        Booking.start_time <= end_of_day,
        Booking.status == BookingStatus.NO_SHOW
    ).count()
    
    # ============ LEAD METRICS ============
    # New inquiries (last 24h)
    new_inquiries = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Conversation.created_at >= now - timedelta(hours=24)
    ).count()
    
    # Ongoing conversations (active in last 7 days)
    ongoing = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Conversation.status == "active",
        Conversation.last_message_at >= now - timedelta(days=7)
    ).count()
    
    # Unanswered messages
    unanswered = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Conversation.status == "active",
        Conversation.awaiting_reply == True,
        Conversation.last_message_at >= now - timedelta(days=3)
    ).count()
    
    # ============ FORM METRICS ============
    # Pending forms
    pending_forms = db.query(FormSubmission).filter(
        FormSubmission.booking_id != None,
        FormSubmission.completed_at == None
    ).join(Booking, FormSubmission.booking_id == Booking.id).filter(
        Booking.workspace_id == workspace.id
    ).count()
    
    # Overdue forms (sent > 48h ago)
    overdue_forms = db.query(FormSubmission).filter(
        FormSubmission.booking_id != None,
        FormSubmission.completed_at == None,
        FormSubmission.sent_at < now - timedelta(hours=48)
    ).join(Booking, FormSubmission.booking_id == Booking.id).filter(
        Booking.workspace_id == workspace.id
    ).count()
    
    # Completed forms (last 30 days)
    completed_forms = db.query(FormSubmission).filter(
        FormSubmission.completed_at != None,
        FormSubmission.completed_at >= now - timedelta(days=30)
    ).join(Booking, FormSubmission.booking_id == Booking.id).filter(
        Booking.workspace_id == workspace.id
    ).count()
    
    # ============ INVENTORY METRICS ============
    # Low stock items
    low_stock_items = db.query(InventoryItem).filter(
        InventoryItem.workspace_id == workspace.id,
        InventoryItem.quantity <= InventoryItem.threshold
    ).all()
    
    critical_items = [item for item in low_stock_items if item.quantity == 0]
    
    # ============ ALERTS ============
    alerts = []
    
    # Missed messages
    if unanswered > 0:
        alerts.append({
            "id": f"alert-unanswered-{int(now.timestamp())}",
            "type": "missed_messages",
            "severity": "high",
            "title": f"{unanswered} unanswered message{'s' if unanswered > 1 else ''}",
            "description": "Customers are waiting for a response",
            "action_url": "/inbox?filter=unanswered",
            "action_label": "View Messages",
            "timestamp": now.isoformat()
        })
    
    # Unconfirmed bookings
    unconfirmed = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.start_time > now,
        Booking.status == BookingStatus.PENDING
    ).count()
    
    if unconfirmed > 0:
        alerts.append({
            "id": f"alert-unconfirmed-{int(now.timestamp())}",
            "type": "unconfirmed_bookings",
            "severity": "medium",
            "title": f"{unconfirmed} unconfirmed booking{'s' if unconfirmed > 1 else ''}",
            "description": "Requires confirmation",
            "action_url": "/bookings?filter=pending",
            "action_label": "Review Bookings",
            "timestamp": now.isoformat()
        })
    
    # Overdue forms
    if overdue_forms > 0:
        alerts.append({
            "id": f"alert-forms-{int(now.timestamp())}",
            "type": "overdue_forms",
            "severity": "high",
            "title": f"{overdue_forms} overdue form{'s' if overdue_forms > 1 else ''}",
            "description": "Sent over 48 hours ago",
            "action_url": "/forms?filter=overdue",
            "action_label": "Send Reminders",
            "timestamp": now.isoformat()
        })
    
    # Inventory alerts
    for item in low_stock_items[:5]:
        alerts.append({
            "id": f"alert-inventory-{item.id}",
            "type": "low_stock",
            "severity": "critical" if item.quantity == 0 else "warning",
            "title": f"Low stock: {item.name}",
            "description": f"{item.quantity} {item.unit} left (threshold: {item.threshold})",
            "action_url": f"/inventory/{item.id}",
            "action_label": "Reorder Now",
            "timestamp": now.isoformat()
        })
    
    return {
        "workspace": {
            "id": workspace.id,
            "name": workspace.name,
            "slug": workspace.slug,
            "is_active": workspace.is_active
        },
        "timestamp": now.isoformat(),
        "bookings": {
            "today": todays_bookings,
            "upcoming": upcoming_bookings,
            "completed_today": completed_today,
            "no_shows_today": no_shows_today,
            "unconfirmed": unconfirmed
        },
        "leads": {
            "new_inquiries": new_inquiries,
            "ongoing": ongoing,
            "unanswered": unanswered
        },
        "forms": {
            "pending": pending_forms,
            "overdue": overdue_forms,
            "completed": completed_forms
        },
        "inventory": {
            "low_stock_count": len(low_stock_items),
            "critical_count": len(critical_items),
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "quantity": item.quantity,
                    "threshold": item.threshold,
                    "unit": item.unit,
                    "sku": item.sku
                }
                for item in low_stock_items[:5]
            ]
        },
        "alerts": alerts
    }

@router.get("/bookings/upcoming")
async def get_upcoming_bookings(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get upcoming bookings for dashboard"""
    
    bookings = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.start_time > datetime.utcnow(),
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING])
    ).order_by(Booking.start_time.asc()).limit(limit).all()
    
    return [
        {
            "id": b.id,
            "customer_name": b.contact.name if b.contact else "Unknown",
            "customer_email": b.contact.email if b.contact else None,
            "service_name": b.service.name if b.service else "General",
            "service_duration": b.service.duration if b.service else None,
            "start_time": b.start_time.isoformat(),
            "end_time": b.end_time.isoformat(),
            "status": b.status.value,
            "confirmation_sent": b.confirmation_sent,
            "reminder_sent": b.reminder_sent
        }
        for b in bookings
    ]

@router.get("/activity/recent")
async def get_recent_activity(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Get recent activity feed"""
    
    activities = []
    
    # Recent bookings (last 7 days)
    recent_bookings = db.query(Booking).filter(
        Booking.workspace_id == workspace.id,
        Booking.created_at >= datetime.utcnow() - timedelta(days=7)
    ).order_by(Booking.created_at.desc()).limit(10).all()
    
    for booking in recent_bookings:
        activities.append({
            "id": f"booking-{booking.id}",
            "type": "booking",
            "action": "created",
            "title": f"New booking: {booking.service.name if booking.service else 'Service'}",
            "description": f"{booking.contact.name if booking.contact else 'Customer'} - {booking.start_time.strftime('%b %d, %I:%M %p')}",
            "timestamp": booking.created_at.isoformat(),
            "status": booking.status.value,
            "url": f"/bookings/{booking.id}"
        })
    
    # Recent messages
    recent_messages = db.query(Message).join(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Message.created_at >= datetime.utcnow() - timedelta(days=3)
    ).order_by(Message.created_at.desc()).limit(10).all()
    
    for msg in recent_messages:
        activities.append({
            "id": f"message-{msg.id}",
            "type": "message",
            "action": "received" if msg.direction == "inbound" else "sent",
            "title": f"Message from {msg.conversation.contact.name if msg.conversation.contact else 'Customer'}",
            "description": msg.content[:100] + "..." if len(msg.content) > 100 else msg.content,
            "timestamp": msg.created_at.isoformat(),
            "direction": msg.direction,
            "automated": msg.automated,
            "url": f"/inbox/{msg.conversation_id}"
        })
    
    # Recent form submissions
    recent_submissions = db.query(FormSubmission).join(Booking).filter(
        Booking.workspace_id == workspace.id,
        FormSubmission.completed_at != None,
        FormSubmission.completed_at >= datetime.utcnow() - timedelta(days=7)
    ).order_by(FormSubmission.completed_at.desc()).limit(10).all()
    
    for sub in recent_submissions:
        activities.append({
            "id": f"form-{sub.id}",
            "type": "form_submission",
            "action": "completed",
            "title": f"Form completed: {sub.form.name if sub.form else 'Form'}",
            "description": f"Submitted by {sub.contact.name if sub.contact else 'Customer'}",
            "timestamp": sub.completed_at.isoformat(),
            "url": f"/forms/submissions/{sub.id}"
        })
    
    # Sort by timestamp, newest first
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return activities[:limit]