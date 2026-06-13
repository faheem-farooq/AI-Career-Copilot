from fastapi import APIRouter
from fastapi import File
from fastapi import HTTPException
from fastapi import UploadFile

from app.services.resume_parser import (
    extract_text_from_pdf
)

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


@router.post("/")
async def upload_resume(
    file: UploadFile = File(...)
):
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF resume."
        )

    try:
        resume_text = await extract_text_from_pdf(
            file
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read this PDF. {str(e)}"
        ) from e

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from this PDF. Try a text-based PDF instead of a scanned image."
        )

    return {
        "filename": file.filename,
        "resume_text": resume_text
    }
