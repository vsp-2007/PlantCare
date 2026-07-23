from fastapi import APIRouter, HTTPException

from app.schemas import IdentifyRequest, IdentifyResponse
from app.services.kindwise import identify_plant

router = APIRouter(prefix="/vision", tags=["vision"])


@router.post("/identify", response_model=IdentifyResponse)
async def identify(body: IdentifyRequest):
    try:
        result = await identify_plant(body.image_base64)
        return IdentifyResponse(**result)
    except Exception as e:
        status = 429 if "limit" in str(e).lower() else 500
        raise HTTPException(status, str(e))