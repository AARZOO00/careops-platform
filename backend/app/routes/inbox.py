from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, EmailStr
import json

from app.config import get_db
from app.dependencies import get_current_workspace, get_current_user
from app.models.workspace import Workspace
from app.models.user import User
from app.models.contact import Contact, Conversation, Message
from app.models.booking import Booking
from app.services.automation import AutomationService
from app.services.email import send_email
from app.services.sms import send_sms

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, workspace_id: str):
        await websocket.accept()
        if workspace_id not in self.active_connections:
            self.active_connections[workspace_id] = []
        self.active_connections[workspace_id].append(websocket)

    def disconnect(self, websocket: WebSocket, workspace_id: str):
        if workspace_id in self.active_connections:
            self.active_connections[workspace_id].remove(websocket)

    async def send_personal_message(self, message: dict, workspace_id: str):
        if workspace_id in self.active_connections:
            for connection in self.active_connections[workspace_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

# Pydantic models
class ConversationCreate(BaseModel):
    contact_id: str
    subject: Optional[str] = None

class MessageCreate(BaseModel):
    content: str
    channel: str  # email, sms
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    contact_name: Optional[str] = None

class MessageReply(BaseModel):
    content: str
    channel: str

class ConversationUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to_id: Optional[str] = None

# Routes
@router.websocket("/ws/{workspace_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    workspace_id: str
):
    """WebSocket for real-time inbox updates"""
    await manager.connect(websocket, workspace_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            # Echo for now, implement actual functionality as needed
            await manager.send_personal_message(
                {"type": "echo", "data": message_data},
                workspace_id
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, workspace_id)

@router.get("/conversations")
async def get_conversations(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db),
    status: Optional[str] = None,
    filter: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all conversations for workspace"""
    
    query = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id
    )
    
    if status:
        query = query.filter(Conversation.status == status)
    
    if filter == "unanswered":
        query = query.filter(
            Conversation.awaiting_reply == True,
            Conversation.status == "active"
        )
    elif filter == "mine":
        current_user = Depends(get_current_user)
        query = query.filter(Conversation.assigned_to_id == current_user.id)
    elif filter == "unassigned":
        query = query.filter(Conversation.assigned_to_id == None)
    
    if search:
        query = query.join(Contact).filter(
            or_(
                Contact.name.ilike(f"%{search}%"),
                Contact.email.ilike(f"%{search}%"),
                Conversation.subject.ilike(f"%{search}%")
            )
        )
    
    total = query.count()
    conversations = query.order_by(
        Conversation.last_message_at.desc().nullslast()
    ).offset(offset).limit(limit).all()
    
    result = []
    for conv in conversations:
        last_message = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()
        
        result.append({
            "id": conv.id,
            "contact": conv.contact.to_dict() if conv.contact else None,
            "subject": conv.subject,
            "status": conv.status,
            "message_count": conv.message_count,
            "awaiting_reply": conv.awaiting_reply,
            "last_message": last_message.to_dict() if last_message else None,
            "assigned_to": conv.assigned_to.to_dict() if conv.assigned_to else None,
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None
        })
    
    return {
        "total": total,
        "conversations": result
    }

@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get single conversation with messages"""
    
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.workspace_id == workspace.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.created_at.asc()).all()
    
    # Mark as not awaiting reply if it was
    if conversation.awaiting_reply:
        conversation.awaiting_reply = False
        db.commit()
    
    return {
        "id": conversation.id,
        "contact": conversation.contact.to_dict() if conversation.contact else None,
        "subject": conversation.subject,
        "status": conversation.status,
        "messages": [m.to_dict() for m in messages],
        "assigned_to": conversation.assigned_to.to_dict() if conversation.assigned_to else None,
        "created_at": conversation.created_at.isoformat() if conversation.created_at else None,
        "updated_at": conversation.updated_at.isoformat() if conversation.updated_at else None
    }

@router.post("/conversations/{conversation_id}/reply")
async def reply_to_conversation(
    conversation_id: str,
    data: MessageReply,
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reply to a conversation"""
    
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.workspace_id == workspace.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Create message
    message = Message(
        conversation_id=conversation.id,
        content=data.content,
        channel=data.channel,
        direction="outbound",
        automated=False,
        status="sent",
        message_metadata={"replied_by": current_user.id}
    )
    db.add(message)
    
    # Update conversation
    conversation.message_count += 1
    conversation.last_message_at = datetime.utcnow()
    conversation.last_message_direction = "outbound"
    conversation.awaiting_reply = False
    
    # Assign to current user if not assigned
    if not conversation.assigned_to_id:
        conversation.assigned_to_id = current_user.id
    
    db.commit()
    db.refresh(message)
    
    # Send via appropriate channel
    if data.channel == "email" and conversation.contact and conversation.contact.email:
        await send_email(
            to=conversation.contact.email,
            subject=f"Re: {conversation.subject}",
            body=data.content,
            workspace=workspace
        )
    elif data.channel == "sms" and conversation.contact and conversation.contact.phone:
        await send_sms(
            to=conversation.contact.phone,
            body=data.content,
            workspace=workspace
        )
    
    # Notify via WebSocket
    await manager.send_personal_message({
        "type": "new_message",
        "conversation_id": conversation.id,
        "message": message.to_dict()
    }, workspace.id)
    
    return {
        "status": "success",
        "message_id": message.id,
        "message": message.to_dict()
    }

@router.post("/conversations")
async def create_conversation(
    data: ConversationCreate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Create a new conversation"""
    
    contact = db.query(Contact).filter(
        Contact.id == data.contact_id,
        Contact.workspace_id == workspace.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check if active conversation already exists
    existing = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Conversation.contact_id == contact.id,
        Conversation.status == "active"
    ).first()
    
    if existing:
        return {
            "id": existing.id,
            "message": "Active conversation already exists"
        }
    
    conversation = Conversation(
        workspace_id=workspace.id,
        contact_id=contact.id,
        subject=data.subject or f"Conversation with {contact.name}",
        status="active",
        message_count=0,
        awaiting_reply=False
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return {
        "id": conversation.id,
        "conversation": conversation.to_dict()
    }

@router.patch("/conversations/{conversation_id}")
async def update_conversation(
    conversation_id: str,
    data: ConversationUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Update conversation"""
    
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.workspace_id == workspace.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if data.status:
        conversation.status = data.status
    
    if data.assigned_to_id is not None:
        if data.assigned_to_id:
            user = db.query(User).filter(
                User.id == data.assigned_to_id,
                User.workspace_id == workspace.id
            ).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
        conversation.assigned_to_id = data.assigned_to_id
    
    conversation.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "status": "success",
        "conversation": conversation.to_dict()
    }

@router.post("/messages")
async def send_message(
    data: MessageCreate,
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a new message (create conversation if needed)"""
    
    # Find or create contact
    contact = None
    if data.contact_email:
        contact = db.query(Contact).filter(
            Contact.workspace_id == workspace.id,
            Contact.email == data.contact_email
        ).first()
    elif data.contact_phone:
        contact = db.query(Contact).filter(
            Contact.workspace_id == workspace.id,
            Contact.phone == data.contact_phone
        ).first()
    
    if not contact:
        contact_name = data.contact_name or data.contact_email or data.contact_phone or "Customer"
        contact = Contact(
            workspace_id=workspace.id,
            name=contact_name,
            email=data.contact_email,
            phone=data.contact_phone,
            source="manual"
        )
        db.add(contact)
        db.flush()
    
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
            subject=f"Conversation with {contact.name}",
            status="active"
        )
        db.add(conversation)
        db.flush()
    
    # Create message
    message = Message(
        conversation_id=conversation.id,
        content=data.content,
        channel=data.channel,
        direction="outbound",
        automated=False,
        status="sent",
        message_metadata={"sent_by": current_user.id}
    )
    db.add(message)
    
    # Update conversation
    conversation.message_count += 1
    conversation.last_message_at = datetime.utcnow()
    conversation.last_message_direction = "outbound"
    conversation.awaiting_reply = False
    if not conversation.assigned_to_id:
        conversation.assigned_to_id = current_user.id
    
    db.commit()
    db.refresh(message)
    
    # Send via appropriate channel
    if data.channel == "email" and contact.email:
        await send_email(
            to=contact.email,
            subject=conversation.subject,
            body=data.content,
            workspace=workspace
        )
    elif data.channel == "sms" and contact.phone:
        await send_sms(
            to=contact.phone,
            body=data.content,
            workspace=workspace
        )
    
    return {
        "status": "success",
        "message_id": message.id,
        "conversation_id": conversation.id,
        "contact_id": contact.id,
        "message": message.to_dict(),
        "message_metadata": message.message_metadata
    }

@router.get("/stats")
async def get_inbox_stats(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    """Get inbox statistics"""
    
    now = datetime.utcnow()
    
    total_conversations = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id
    ).count()
    
    active_conversations = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Conversation.status == "active"
    ).count()
    
    awaiting_reply = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Conversation.awaiting_reply == True,
        Conversation.status == "active"
    ).count()
    
    unassigned = db.query(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Conversation.assigned_to_id == None,
        Conversation.status == "active"
    ).count()
    
    messages_today = db.query(Message).join(Conversation).filter(
        Conversation.workspace_id == workspace.id,
        Message.created_at >= now.replace(hour=0, minute=0, second=0, microsecond=0)
    ).count()
    
    avg_response_time = None  # TODO: Calculate average response time
    
    return {
        "total_conversations": total_conversations,
        "active_conversations": active_conversations,
        "awaiting_reply": awaiting_reply,
        "unassigned": unassigned,
        "messages_today": messages_today,
        "avg_response_time": avg_response_time
    }