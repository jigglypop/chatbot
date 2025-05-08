import React, { useEffect, useRef, useState } from 'react';
import './ChatBot.css';
import Message from './Message';
import { useSSE } from '../api/common';

// 채팅 메시지 타입 정의
interface ChatMessage {
  id: number;
  content: string;
  type: 'human' | 'ai';
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { send, isLoading, error } = useSSE();

  // 자동 스크롤
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 사용자의 메시지 추가
    const userId = Date.now();
    setMessages(prev => [...prev, { id: userId, content: input, type: 'human' }]);

    // AI 플레이스홀더 추가
    const aiId = userId + 1;
    setMessages(prev => [...prev, { id: aiId, content: '', type: 'ai' }]);
    let aiContent = '';

    // 대화 기록 준비 (기존 + 최신 사용자 메시지)
    const historyPayload = messages
      .map(msg => ({ type: msg.type, content: msg.content }))
      .concat({ type: 'human', content: input });
    // 입력창 초기화
    setInput('');

    // 스트리밍 요청 및 청크 파싱
    await send(
      'http://127.0.0.1:8000/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, chat_history: historyPayload }),
      },
      (chunk: string) => {
    aiContent += chunk;
    setMessages(prev =>
      prev.map(msg =>
        msg.id === aiId ? { ...msg, content: aiContent } : msg
      )
    );
      }
    );
  };

  return (
    <div className="chatbot">
      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>안녕하세요! 질문을 입력해주세요!</p>
            </div>
          ) : (
            messages.map(msg => <Message key={msg.id} message={msg} />)
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? '대화 중...' : '전송'}
        </button>
      </form>

      {error && <div className="error">에러: {error.message}</div>}
    </div>
  );
};

export default ChatBot;
