import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sse_starlette.sse import EventSourceResponse
from fastapi.responses import JSONResponse
from chat import get_chat_response
from uuid import uuid4

load_dotenv()
unique_id = uuid4().hex[:8]
os.environ["LANGCHAIN_TRACING_V2"] = os.getenv("LANGCHAIN_TRACING_V2", "true")
os.environ["LANGCHAIN_PROJECT"]   = f"{os.getenv('LANGCHAIN_PROJECT_PREFIX', 'LangGraph Tutorial - ')}{unique_id}"
os.environ["LANGCHAIN_ENDPOINT"]  = os.getenv("LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com")
os.environ["LANGCHAIN_API_KEY"]   = os.getenv("LANGCHAIN_API_KEY", "")
os.environ["OPENAI_API_KEY"]      = os.getenv("OPENAI_API_KEY", "")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "LangChain ChatBot API"}

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message      = data.get("message", "")
    chat_history = data.get("chat_history", [])
    return EventSourceResponse(
        get_chat_response(message, chat_history),
        media_type="text/event-stream"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 