from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI()

# 允许跨域请求（前端才能访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本地开发先允许所有前端
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求体模型
class AnalyzeRequest(BaseModel):
    text: str
    source: str  # "text", "audio", or "video"

@app.post("/analyze")
async def analyze(data: AnalyzeRequest):
    return {
        "source": data.source,
        "risk_score": random.randint(30, 95),
        "category": random.choice(["hate speech", "misinformation", "xenophobia"]),
        "confidence": round(random.uniform(0.7, 1.0), 2),
        "text_snippet": data.text[:50]
    }
