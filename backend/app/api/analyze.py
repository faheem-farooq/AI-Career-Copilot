from fastapi import APIRouter, HTTPException

from app.schemas.analyze_schema import AnalyzeRequest
from app.schemas.response_schema import AnalysisResponse
from app.services.openai_service import analyze_resume

router = APIRouter(
    prefix="/analyze",
    tags=["Analysis"]
)


@router.post("/", response_model=AnalysisResponse)
async def analyze(request: AnalyzeRequest):
    try:
        result = await analyze_resume(
            request.resume_text,
            request.job_description
        )

        return result

    except Exception as e:
        message = str(e)
        if "insufficient_quota" in message or "429" in message:
            message = "OpenAI quota exceeded. Check your billing or plan and try again."

        raise HTTPException(
            status_code=503,
            detail=message
        )