from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as v1_router

app = FastAPI(
    title="calculators@TrueMFD API",
    version="1.0.0",
    description="Versioned financial calculator APIs for the TrueMFD calculator suite.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.truemfd.com",
        "https://truemfd.com",
        "https://truemfd-calculators-web.onrender.com",
        "http://localhost:5173",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api/v1")
