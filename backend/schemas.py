from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class MessageIn(BaseModel):
    role: str
    content: str
    provider: Optional[str] = None
    model: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[MessageIn]
    provider: Optional[str] = None
    model: Optional[str] = None

class SessionCreate(BaseModel):
    user_id: UUID
    title: Optional[str] = None
