from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.analyze import router as analyze_router
from app.api.cover_letter import router as cover_router

app = FastAPI(
    title="AI Career Copilot API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
        "http://127.0.0.1:5175",
        "http://localhost:5175"
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(upload_router)
app.include_router(analyze_router)
app.include_router(cover_router)


@app.get("/")
def home():

    return {
        "message": "AI Career Copilot API Running"
    }
