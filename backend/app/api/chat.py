import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import ChatMessage, Plant
from app.schemas import ChatMessageResponse, ChatRequest
from app.services.llm import chat_response

router = APIRouter(prefix="/plants", tags=["chat"])


@router.get("/{plant_id}/chat", response_model=list[ChatMessageResponse])
def list_chat_messages(plant_id: str, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.plant_id == plant_id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )


@router.post("/{plant_id}/chat", response_model=ChatMessageResponse, status_code=201)
async def create_chat_message(plant_id: str, body: ChatRequest, db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")

    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        plant_id=plant_id,
        role="user",
        content=body.message,
        timestamp=datetime.utcnow(),
    )
    db.add(user_msg)

    plant_info = {
        "nickname": plant.nickname,
        "species_name": plant.species.common_name if plant.species else "Unknown",
        "location": plant.location,
        "care_info": {
            "light_level": plant.species.light_level if plant.species else "medium",
            "water_frequency_days": plant.species.water_frequency_days if plant.species else 7,
        },
    }
    conversation = [
        {"role": m.role, "content": m.content}
        for m in db.query(ChatMessage)
        .filter(ChatMessage.plant_id == plant_id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    ]

    reply = await chat_response(plant_info, conversation, body.message)

    ai_msg = ChatMessage(
        id=str(uuid.uuid4()),
        plant_id=plant_id,
        role="assistant",
        content=reply,
        timestamp=datetime.utcnow(),
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    return ai_msg


@router.post("/{plant_id}/chat/stream")
async def chat_stream_endpoint(plant_id: str, body: ChatRequest, db: Session = Depends(get_db)):
    from fastapi.responses import StreamingResponse
    import asyncio
    import json

    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(404, "Plant not found")

    plant_info = {
        "nickname": plant.nickname,
        "species_name": plant.species.common_name if plant.species else "Unknown",
        "location": plant.location,
        "care_info": {
            "light_level": plant.species.light_level if plant.species else "medium",
            "water_frequency_days": plant.species.water_frequency_days if plant.species else 7,
        },
    }
    conversation = [
        {"role": m.role, "content": m.content}
        for m in db.query(ChatMessage)
        .filter(ChatMessage.plant_id == plant_id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    ]

    async def event_stream():
        reply = await chat_response(plant_info, conversation, body.message)
        user_id = str(uuid.uuid4())
        ai_id = str(uuid.uuid4())
        now = datetime.utcnow()

        user_msg = ChatMessage(id=user_id, plant_id=plant_id, role="user", content=body.message, timestamp=now)
        ai_msg = ChatMessage(id=ai_id, plant_id=plant_id, role="assistant", content=reply, timestamp=now)
        db.add(user_msg)
        db.add(ai_msg)
        db.commit()

        yield f"data: {json.dumps({'id': user_id, 'role': 'user', 'content': body.message})}\n\n"
        for word in reply.split():
            yield f"data: {json.dumps({'content': word + ' '})}\n\n"
            await asyncio.sleep(0.03)
        yield f"data: {json.dumps({'id': ai_id, 'role': 'assistant', 'content': reply, 'done': True})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")