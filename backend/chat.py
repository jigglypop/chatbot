# chat.py
import os
import json
import asyncio
import logging
from typing import AsyncIterable, List, Dict
from dotenv import load_dotenv

from langchain.chat_models import ChatOpenAI
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.schema import HumanMessage, AIMessage, BaseMessage

load_dotenv()
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

async def get_chat_response(
    message: str,
    chat_history: List[Dict[str, str]]
) -> AsyncIterable[str]:
    temperature = float(os.getenv("TEMPERATURE", 0.7))
    base_url    = os.getenv("LANGCHAIN_ENDPOINT")
    openai_key  = os.getenv("OPENAI_API_KEY")
    logger.debug(f"Config: temperature={temperature}, base_url={base_url}, openai_key={'SET' if openai_key else 'NONE'}")
    messages: List[BaseMessage] = []
    for entry in chat_history:
        content = entry.get("content", "")
        msg_type = entry.get("type")
        if msg_type == "human":
            messages.append(HumanMessage(content=content))
        elif msg_type == "ai":
            messages.append(AIMessage(content=content))
    messages.append(HumanMessage(content=message))
    logger.debug(f"Built messages: {[type(m).__name__+':'+m.content for m in messages]}")
    handler = AsyncIteratorCallbackHandler()
    llm = ChatOpenAI(
        temperature=temperature,
        streaming=True,
        callbacks=[handler],
        openai_api_key=openai_key,
    )
    logger.debug(f"Initialized ChatOpenAI model: {llm}")
    task = asyncio.create_task(llm.agenerate(messages=[messages]))
    logger.debug(f"Started generation task: {task}")
    try:
        async for chunk in handler.aiter():
            logger.debug(f"Received chunk: {chunk}")
            yield json.dumps({"data": chunk})
        await task
        yield json.dumps({"data": "[DONE]"})
    except Exception as e:
        logger.error(f"Unhandled exception: {e}", exc_info=True)
        yield json.dumps({"error": str(e)})
