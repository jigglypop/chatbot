import React from 'react';
import './App.css';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>LangChain 챗봇</h1>
      </header>
      <main className="app-main">
        <ChatBot />
      </main>
      <footer className="app-footer">
        <p>LangChain + FastAPI + React로 구현된 챗봇</p>
      </footer>
    </div>
  );
}

export default App; 