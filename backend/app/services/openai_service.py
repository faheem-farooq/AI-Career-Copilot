import json
import re

from groq import Groq

from app.config import GROQ_API_KEY


def get_client():
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set")

    return Groq(api_key=GROQ_API_KEY)


def parse_json_content(content: str):
    cleaned_content = content.strip()

    if cleaned_content.startswith("```"):
        cleaned_content = re.sub(r"^```(?:json)?\s*", "", cleaned_content)
        cleaned_content = re.sub(r"\s*```$", "", cleaned_content)

    try:
        return json.loads(cleaned_content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned_content, re.DOTALL)
        if match:
            return json.loads(match.group(0))

        raise RuntimeError(
            f"Model did not return valid JSON. Preview: {cleaned_content[:200]}"
        )


def normalize_analysis_result(result: dict):
    match_score = result.get("match_score")

    if isinstance(match_score, (int, float)):
        if 0 <= match_score <= 1:
            result["match_score"] = int(round(match_score * 100))
        else:
            result["match_score"] = int(round(match_score))

    return result


async def analyze_resume(
    resume_text: str,
    job_description: str
):
    client = get_client()

    prompt = f"""
    You are an expert technical recruiter.

    Resume:
    {resume_text}

    Job Description:
    {job_description}

    Return ONLY valid JSON with no markdown, no code fences, and no extra text.

    {{
        "match_score": number,
        "strengths": [],
        "weaknesses": [],
        "missing_skills": []
    }}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content or ""
    return normalize_analysis_result(parse_json_content(content))


async def generate_cover_letter(
    resume_text: str,
    job_description: str
):
    client = get_client()

    prompt = f"""
    You are an expert career coach and professional writer.

    Write a polished, tailored cover letter using the candidate's resume and
    the job description. Keep it concise, specific, and natural.

    Requirements:
    - Return only the cover letter text.
    - Do not use markdown.
    - Do not invent company details that are not in the job description.
    - Do not include placeholders such as [Company Name] or [Hiring Manager].
    - Use 3 to 5 short paragraphs.
    - Highlight the strongest overlaps between the resume and the role.

    Resume:
    {resume_text}

    Job Description:
    {job_description}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content
