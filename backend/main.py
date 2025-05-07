import os
from typing import List
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sse_starlette.sse import EventSourceResponse
from fastapi.responses import JSONResponse

from chat import get_chat_response

# 환경 변수 로드
load_dotenv()

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 배포 환경에서는 구체적인 오리진을 설정하세요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "LangChain ChatBot API"}

@app.post("/chat")
async def chat(request: Request):
    """
    채팅 API 엔드포인트
    """
    data = await request.json()
    message = data.get("message", "")
    chat_history = data.get("chat_history", [])
    
    if not message:
        return JSONResponse(
            status_code=400,
            content={"error": "message is required"}
        )
    
    return EventSourceResponse(
        get_chat_response(message, chat_history),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 