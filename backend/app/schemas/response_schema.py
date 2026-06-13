from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    match_score: int
    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]


class CoverLetterResponse(BaseModel):
    cover_letter: str