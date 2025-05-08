import './App.css';
import ChatBot from './components/ChatBot';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>NH농협은행</h1>
      </header>
      <main className="app-main">
        <ChatBot />
      </main>
      <footer className="app-footer">
      </footer>
    </div>
  )
}

