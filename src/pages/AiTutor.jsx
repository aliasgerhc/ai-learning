import { useState, useRef, useEffect } from 'react';
import { callGemini } from '../utils/ai';
import { getChatHistory, addChatMessage, clearChatHistory } from '../utils/storage';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Trash2, Send, XCircle } from 'lucide-react';

const SYSTEM_PROMPT = `You are EduAI, a friendly and knowledgeable AI tutor for students. 
You help students understand complex topics, answer academic questions, explain concepts clearly, 
provide examples, and guide learning. Be encouraging, clear, and thorough in your explanations. 
Use markdown formatting for better readability.`;

const SUGGESTED = [
  "Explain quantum mechanics in simple terms",
  "How does photosynthesis work?",
  "What is the Pythagorean theorem?",
  "Summarize the French Revolution",
  "Help me understand machine learning",
  "What is DNA and how does it work?",
];

export default function AiTutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load history from DB on mount
  useEffect(() => {
    getChatHistory().then(h => {
      setMessages(h.map(m => ({ role: m.role, content: m.content, ts: m.created_at || m.ts })));
      setLoadingHistory(false);
    }).catch(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const userMessage = { role: 'user', content: userMsg, ts: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setStreamingText('');

    // Save user message to DB
    addChatMessage('user', userMsg);

    try {
      const context = [...messages, userMessage].slice(-8).map(m =>
        `${m.role === 'user' ? 'Student' : 'EduAI'}: ${m.content}`
      ).join('\n\n');

      const prompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${context}\n\nStudent: ${userMsg}\n\nEduAI:`;

      let fullResponse = '';
      await callGemini(prompt, (text) => {
        fullResponse = text;
        setStreamingText(text);
      });

      const aiMessage = { role: 'ai', content: fullResponse, ts: Date.now() };
      setMessages(prev => [...prev, aiMessage]);
      setStreamingText('');

      // Save AI response to DB
      addChatMessage('ai', fullResponse);
    } catch (err) {
      const errMsg = { role: 'ai', content: `❌ **Error:** ${err.message}`, ts: Date.now() };
      setMessages(prev => [...prev, errMsg]);
      setStreamingText('');
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleClear = async () => {
    setMessages([]);
    await clearChatHistory();
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Bot size={24} className="text-primary" /> AI Tutor</div>
          <div className="section-sub">Ask anything — your personal AI study companion</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleClear} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={16} /> Clear Chat</button>
      </div>

      {messages.length === 0 && !loadingHistory && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>💡 Try asking:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED.map((s, i) => (
              <button key={i} className="btn btn-outline btn-sm" onClick={() => sendMessage(s)} style={{ fontSize: 12 }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          {loadingHistory && (
            <div style={{ display:'flex',gap:10,alignItems:'center',padding:20 }}>
              <span className="spinner" /><span style={{ color:'var(--text-muted)',fontSize:13 }}>Loading chat history...</span>
            </div>
          )}

          {!loadingHistory && messages.length === 0 && !streamingText && (
            <div className="empty-state" style={{ margin: 'auto' }}>
              <div className="empty-state-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={32} /></div>
              <h3>Hi! I'm your AI Tutor</h3>
              <p>Ask me anything about your studies. I'm here to help!</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="msg-avatar">{msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}</div>
              <div className="msg-bubble">
                {msg.role === 'ai' ? (
                  <div className="ai-response"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                ) : msg.content}
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="message ai">
              <div className="msg-avatar"><Bot size={16} /></div>
              <div className="msg-bubble">
                <div className="ai-response typing-cursor"><ReactMarkdown>{streamingText}</ReactMarkdown></div>
              </div>
            </div>
          )}

          {loading && !streamingText && (
            <div className="message ai">
              <div className="msg-avatar"><Bot size={16} /></div>
              <div className="msg-bubble" style={{ display:'flex',gap:6,alignItems:'center' }}>
                <span className="spinner" />
                <span style={{ color:'var(--text-muted)',fontSize:13 }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask your AI tutor anything... (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || loadingHistory}
            rows={1}
          />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ padding:'10px 18px',flexShrink:0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? <span className="spinner" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
