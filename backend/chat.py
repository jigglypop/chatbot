import os
import json
import asyncio
from typing import AsyncIterable, List, Dict
from langchain_openai import ChatOpenAI
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain.schema import HumanMessage, AIMessage

async def get_chat_response(message: str, chat_history: List[Dict]) -> AsyncIterable[str]:
    """
    LangChain을 사용하여 채팅 응답을 생성합니다.
    SSE를 통해 스트리밍됩니다.
    """
    # 콜백 핸들러 설정
    callback_handler = AsyncIteratorCallbackHandler()
    
    # OpenAI 모델 초기화
    llm = ChatOpenAI(
        temperature=0.7,
        streaming=True,
        callbacks=[callback_handler],
    )
    
    # 채팅 기록 변환
    messages = []
    for chat in chat_history:
        if chat["type"] == "human":
            messages.append(HumanMessage(content=chat["content"]))
        elif chat["type"] == "ai":
            messages.append(AIMessage(content=chat["content"]))
    
    # 사용자 메시지 추가
    messages.append(HumanMessage(content=message))
    
    # 비동기 실행
    task = asyncio.create_task(llm.agenerate(messages=[messages]))
    
    # 응답 스트리밍
    collected_chunks = []
    async for chunk in callback_handler.aiter():
        collected_chunks.append(chunk)
        yield json.dumps({"data": chunk})
    
    # 작업 완료 대기
    await task
    
    yield json.dumps({"data": "[DONE]"}) 