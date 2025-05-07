import React from 'react';
import './Message.css';

const Message = ({ message }) => {
  const { content, type } = message;
  const isAi = type === 'ai';

  return (
    <div className={`message ${isAi ? 'ai' : 'human'}`}>
      <div className="message-avatar">
        {isAi ? '🤖' : '👤'}
      </div>
      <div className="message-content">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Message; 