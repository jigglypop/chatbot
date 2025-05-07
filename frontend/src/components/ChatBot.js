import React, { useEffect, useRef, useState } from 'react';
import './ChatBot.css';
import Message from './Message';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // 메시지 영역으로 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage = { id: Date.now(), content: input, type: 'human' };
    setMessages((prev) => [...prev, userMessage]);
    
    // 입력창 비우기
    setInput('');
    setLoading(true);

    try {
      // 채팅 기록 준비
      const chatHistory = messages.map(msg => ({
        type: msg.type,
        content: msg.content
      }));

      // AI 응답 메시지 준비
      const aiMessageId = Date.now() + 1;
      let aiMessageContent = '';
      setMessages((prev) => [...prev, { id: aiMessageId, content: '', type: 'ai' }]);
      
      // fetch를 사용하여 SSE 요청
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          chat_history: chatHistory
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 응답을 읽기 위한 reader 생성
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // 스트리밍 데이터 처리
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (done) {
          setLoading(false);
          break;
        }
        
        // 디코딩 및 처리
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = line.substring(6);
            if (eventData === '[DONE]') {
              setLoading(false);
              done = true;
              break;
            }
            
            try {
              const parsedData = JSON.parse(eventData);
              aiMessageContent += parsedData.data || '';
              
              setMessages((prev) => 
                prev.map(msg => 
                  msg.id === aiMessageId ? { ...msg, content: aiMessageContent } : msg
                )
              );
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
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
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>
      
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? '대화 중...' : '전송'}
        </button>
      </form>
    </div>
  );
};

export default ChatBot; 