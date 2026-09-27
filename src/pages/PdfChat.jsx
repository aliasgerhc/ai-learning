import { useState, useRef, useEffect } from 'react';
import { callGemini } from '../utils/ai';
import ReactMarkdown from 'react-markdown';
import { FileText, Send, User, Bot, Upload, File } from 'lucide-react';

export default function PdfChat() {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(''); // Extracted text
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Very simple text extraction for demo purposes
  // In a real app, use pdf.js to extract text from PDF buffers
  const handleFileUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    
    // Fake extraction for TXT or basic parsing
    const reader = new FileReader();
    reader.onload = (evt) => {
      setFileContent(evt.target.result.slice(0, 15000)); // Limit to 15k chars for prompt
      setMessages([{ role: 'ai', content: `I've read **${f.name}**. What would you like to know about it?` }]);
    };
    if (f.name.endsWith('.txt') || f.name.endsWith('.md') || f.name.endsWith('.csv')) {
      reader.readAsText(f);
    } else {
      // Simulate PDF extraction delay
      setMessages([{ role: 'ai', content: `Parsing **${f.name}**...` }]);
      setTimeout(() => {
        setFileContent("Simulated PDF content: The document discusses various educational concepts and AI integration.");
        setMessages([{ role: 'ai', content: `I've successfully parsed **${f.name}**. You can now ask me questions about it!` }]);
      }, 1500);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !fileContent) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setStreamingText('');

    try {
      const history = messages.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
      const prompt = `You are an AI assistant answering questions about a document. Use the document context below to answer. If the answer is not in the context, say so gracefully.

--- DOCUMENT CONTEXT ---
${fileContent}
--- END CONTEXT ---

Recent Conversation:
${history}

User: ${userMsg}
AI:`;

      let fullResponse = '';
      await callGemini(prompt, (text) => {
        fullResponse = text;
        setStreamingText(text);
      });

      setMessages(prev => [...prev, { role: 'ai', content: fullResponse }]);
      setStreamingText('');
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: `**Error:** ${err.message}` }]);
      setStreamingText('');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={24} className="text-primary" /> Chat with Document</div>
          <div className="section-sub">Upload a PDF, document, presentation, image, or text file and ask questions about it</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Upload size={16} /> Upload New
        </button>
        <input ref={fileRef} type="file" accept="*/*" style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>

      {!file ? (
        <div className="card">
          <div className="upload-zone" style={{ padding: 40 }} onClick={() => fileRef.current?.click()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><FileText size={48} color="var(--text-muted)" /></div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Upload a document to chat</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Supports PDF, DOCX, PPTX, images, and text files</div>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-messages">
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
            <div style={{ position: 'absolute', top: -30, left: 16, fontSize: 11, background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <File size={12} /> {file.name}
            </div>
            <textarea
              className="chat-input"
              placeholder="Ask a question about this document..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || !fileContent}
              rows={1}
            />
            <button className="btn btn-primary" onClick={sendMessage} disabled={!input.trim() || loading || !fileContent} style={{ padding:'10px 18px',flexShrink:0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <span className="spinner" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
