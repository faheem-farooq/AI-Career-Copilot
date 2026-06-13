from fastapi import APIRouter, HTTPException

from app.schemas.analyze_schema import CoverLetterRequest
from app.schemas.response_schema import CoverLetterResponse
from app.services.openai_service import generate_cover_letter

router = APIRouter(
    prefix="/cover-letter",
    tags=["Cover Letter"]
)


@router.post("/", response_model=CoverLetterResponse)
async def create_cover_letter(request: CoverLetterRequest):
    try:
        cover_letter = await generate_cover_letter(
            request.resume_text,
            request.job_description
        )

        return {
            "cover_letter": cover_letter
        }

    except Exception as e:
        message = str(e)
        if "insufficient_quota" in message or "429" in message:
            message = "AI quota exceeded. Check your billing or plan and try again."

        raise HTTPException(
            status_code=503,
            detail=message
        )
