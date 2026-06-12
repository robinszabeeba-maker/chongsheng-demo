from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.billing import charge_user, compute_points
from app.database import get_db
from app.deps import get_api_key_user
from app.models import ApiKey, User
from app.providers import get_provider

router = APIRouter(prefix="/v1", tags=["open-api"])


class VisionRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    task_type: str = "breed"
    pet_type: Optional[str] = None


class AudioRequest(BaseModel):
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    task_type: str = "bark"


class VideoRequest(BaseModel):
    video_url: str
    pet_type: str = "dog"
    duration_sec: Optional[float] = None


class HealthRequest(BaseModel):
    pet_profile: dict
    symptoms: list


class ChatRequest(BaseModel):
    messages: list


async def _invoke(
    db: Session,
    api_key: ApiKey,
    user: User,
    sku: str,
    units: float,
    call,
):
    provider = get_provider()
    needed = compute_points(db, sku, units)
    if user.points_balance < needed:
        charge_user(db, user, api_key, sku, units, False, "insufficient_points")
        raise HTTPException(status_code=402, detail="insufficient_points")
    try:
        result = await call(provider)
        points, _ = charge_user(db, user, api_key, sku, units, True)
        return {"success": True, "points_charged": points, "data": result}
    except ValueError as e:
        charge_user(db, user, api_key, sku, units, False, str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception:
        charge_user(db, user, api_key, sku, units, False, "upstream_error")
        raise HTTPException(status_code=502, detail="upstream_error")


@router.post("/vision/analyze")
async def vision_analyze(
    body: VisionRequest,
    auth=Depends(get_api_key_user),
    db: Session = Depends(get_db),
):
    api_key, user = auth
    return await _invoke(
        db, api_key, user, "I01", 1,
        lambda p: p.vision_analyze(body.model_dump()),
    )


@router.post("/audio/analyze")
async def audio_analyze(
    body: AudioRequest,
    auth=Depends(get_api_key_user),
    db: Session = Depends(get_db),
):
    api_key, user = auth
    return await _invoke(
        db, api_key, user, "A01", 1,
        lambda p: p.audio_analyze(body.model_dump()),
    )


@router.post("/video/behavior/tasks")
async def video_behavior(
    body: VideoRequest,
    auth=Depends(get_api_key_user),
    db: Session = Depends(get_db),
):
    api_key, user = auth
    duration_min = (body.duration_sec or 12.5) / 60
    return await _invoke(
        db, api_key, user, "V01", duration_min,
        lambda p: p.video_create_task(body.model_dump()),
    )


@router.post("/health/assessment")
async def health_assessment(
    body: HealthRequest,
    auth=Depends(get_api_key_user),
    db: Session = Depends(get_db),
):
    api_key, user = auth
    return await _invoke(
        db, api_key, user, "H01", 1,
        lambda p: p.health_assessment(body.model_dump()),
    )


@router.post("/chat/general")
async def chat_general(
    body: ChatRequest,
    auth=Depends(get_api_key_user),
    db: Session = Depends(get_db),
):
    api_key, user = auth
    units = 1
    return await _invoke(
        db, api_key, user, "T01", units,
        lambda p: p.chat(body.model_dump(), "T01"),
    )


@router.post("/chat/consult")
async def chat_consult(
    body: ChatRequest,
    auth=Depends(get_api_key_user),
    db: Session = Depends(get_db),
):
    api_key, user = auth
    units = 1
    return await _invoke(
        db, api_key, user, "T02", units,
        lambda p: p.chat(body.model_dump(), "T02"),
    )
