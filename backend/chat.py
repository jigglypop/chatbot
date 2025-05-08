import os
import json
import asyncio
from typing import AsyncIterable, List, Dict
from langchain.chat_models import ChatOpenAI
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.schema import HumanMessage, AIMessage, BaseMessage

async def get_chat_response(
    message: str,
    chat_history: List[Dict[str, str]]
) -> AsyncIterable[str]:
    temperature = float(os.getenv("TEMPERATURE", 0.7))
    openai_key  = os.getenv("OPENAI_API_KEY")
    messages: List[BaseMessage] = []
    for entry in chat_history:
        content = entry.get("content", "")
        msg_type = entry.get("type")
        if msg_type == "human":
            messages.append(HumanMessage(content=content))
        elif msg_type == "ai":
            messages.append(AIMessage(content=content))
    messages.append(HumanMessage(content=message))
    handler = AsyncIteratorCallbackHandler()
    llm = ChatOpenAI(
        temperature=temperature,
        streaming=True,
        callbacks=[handler],
        openai_api_key=openai_key,
    )
    task = asyncio.create_task(llm.agenerate(messages=[messages]))
    try:
        async for chunk in handler.aiter():
            yield json.dumps({"token": chunk})
        await task
        yield json.dumps({"token": "[DONE]"})
    except Exception as e:
        yield json.dumps({"error": str(e)})
