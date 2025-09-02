from fastapi import FastAPI, Depends, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from uuid import UUID
import asyncio

from db import Base, engine, get_db
from models import User, Session as ChatSession, Message
from schemas import SessionCreate, ChatRequest
from settings import CORS_ORIGINS, MAX_OUTPUT_TOKENS, DEFAULT_PROVIDER, DEFAULT_MODEL

from providers import OpenAIProvider, GeminiProvider

app = FastAPI(title="Chatbot SSE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[*CORS_ORIGINS],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

def provider_registry():
    registry = {"openai": OpenAIProvider()}
    try:
        from settings import GEMINI_API_KEY
        if GEMINI_API_KEY:
            registry['gemini']=GeminiProvider()
    except:
        pass
    return registry

@app.get("/models")
async def models():
    return {
        "openai": ["gpt-4o-mini"],
        
        "gemini flash": ["gemini-2.5-flash"],
        "gemini pro":["gemini-2.5-pro"]
    }

@app.post("/sessions")
def create_session(payload: SessionCreate, db: Session = Depends(get_db)):
    # ensure user exists
    user = db.get(User, payload.user_id) if payload.user_id else None
    if not user:
        user = User()
        db.add(user)
        db.flush()
    session = ChatSession(user_id=user.id, title=payload.title or "New Chat")
    db.add(session); db.commit(); db.refresh(session)
    return {"session_id": str(session.id), "user_id": str(user.id)}

@app.get("/sessions")
def list_sessions(user_id: UUID, db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(ChatSession.created_at.desc()).all()
    return [{"id": str(s.id), "title": s.title, "created_at": s.created_at.isoformat()} for s in sessions]

@app.get("/sessions/{session_id}")
def get_session(session_id: UUID, db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(Message.session_id == session_id).order_by(Message.created_at.asc()).all()
    return [{"role": m.role, "content": m.content, "provider": m.provider, "model": m.model, "created_at": m.created_at.isoformat()} for m in msgs]

@app.post("/chat/{session_id}/stream")
async def chat_stream(session_id: UUID, req: ChatRequest, db: Session = Depends(get_db)):
    # Persist user message
    provider_name = (req.provider or DEFAULT_PROVIDER).lower()
    model = req.model or DEFAULT_MODEL

    # Save incoming last user message (assumes last is user)
    if req.messages and req.messages[-1]["role"] == "user":
        db.add(Message(session_id=session_id, role="user",
                       content=req.messages[-1]["content"],
                       provider=provider_name, model=model))
        db.commit()

    registry = provider_registry()
    if provider_name not in registry:
        return JSONResponse({"error": f"Provider '{provider_name}' not available"}, status_code=400)
    provider = registry[provider_name]

    async def sse_event_generator():
        # SSE headers are set by StreamingResponse
        # Transform messages if needed
        history = [{"role": m.role, "content": m.content} for m in req.messages]
        try:
            async for token in provider.stream(history, model, MAX_OUTPUT_TOKENS):
                yield f"data: { { 'delta': token } }\n\n"
                await asyncio.sleep(0)  # cooperative
            yield "data: [DONE]\n\n"
        finally:
            pass

    # Also persist assistant message after full stream by buffering (simpler path omitted to keep template short)
    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")
