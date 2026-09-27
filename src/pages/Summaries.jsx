import { useState, useEffect } from 'react';
import { getSummaries, saveSummary, deleteSummary } from '../utils/storage';
import { callGemini } from '../utils/ai';
import DocumentUpload from '../components/DocumentUpload';
import ReactMarkdown from 'react-markdown';
import { PenTool, BookOpen, Trash2, ChevronDown, ChevronUp, Sparkles, ClipboardEdit, BookMarked, AlertCircle } from 'lucide-react';

export default function Summaries() {
  const [summaries, setSummaries] = useState([]);
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('create');

  useEffect(() => {
    getSummaries().then(list => { setSummaries(list); setLoadingList(false); }).catch(() => setLoadingList(false));
  }, []);

  const generate = async () => {
    if (!notes.trim()) return;
    setLoading(true); setError(''); setResult('');
    try {
      const prompt = `You are an expert note-taking assistant. Create a comprehensive, well-structured summary of the following lecture notes or text. 
Format the output with:
- A brief overview
- Key concepts (as bullet points)
- Important definitions
- Key takeaways
- Study tips

Notes to summarize:
---
${notes.slice(0, 8000)}
---

Use markdown formatting with headers and bullet points. Make it easy to study from.`;

      let full = '';
      await callGemini(prompt, (text) => { full = text; setResult(text); });

      const saved = await saveSummary({ title: title || `Summary — ${new Date().toLocaleDateString()}`, content: full, originalNotes: notes });
      setSummaries(prev => [saved, ...prev]);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await deleteSummary(id);
    setSummaries(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PenTool size={24} className="text-primary" /> Lecture Summaries</div>
          <div className="section-sub">Paste your notes — AI creates beautiful summaries</div>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          <button className={`btn btn-sm ${view==='create'?'btn-primary':'btn-outline'}`} onClick={() => setView('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ClipboardEdit size={16} /> Create</button>
          <button className={`btn btn-sm ${view==='list'?'btn-primary':'btn-outline'}`} onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookMarked size={16} /> Saved ({summaries.length})</button>
        </div>
      </div>

      {view === 'create' ? (
        <div className="grid-2" style={{ alignItems:'start',gap:24 }}>
          <div className="card">
            <h3 style={{ fontWeight:700,marginBottom:16,fontSize:15, display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardEdit size={18} /> Your Notes</h3>
            <div className="input-group">
              <label className="input-label">Summary Title (optional)</label>
              <input className="input" placeholder="e.g., Chapter 5 — Photosynthesis" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Paste lecture notes or text</label>
              <DocumentUpload label="Load notes from file" onTextLoaded={(text, fileName) => { setNotes(text.slice(0, 8000)); if (!title) setTitle(fileName.replace(/\.[^.]+$/, '')); }} />
              <textarea className="textarea" style={{ minHeight:280 }} placeholder="Paste your lecture notes, textbook paragraphs, or any study material here..." value={notes} onChange={e => setNotes(e.target.value)} />
              <div style={{ fontSize:11,color:'var(--text-muted)',marginTop:4 }}>{notes.length.toLocaleString()} / 8,000 chars</div>
            </div>
            {error && <div style={{ padding:'10px 14px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,color:'#f87171',fontSize:13,marginBottom:12, display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={16} /> {error}</div>}
            <button className="btn btn-primary btn-full" onClick={generate} disabled={loading || !notes.trim()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><span className="spinner" /> Summarizing...</> : <><Sparkles size={18} /> Generate Summary</>}
            </button>
          </div>

          <div className="card" style={{ minHeight:400 }}>
            <h3 style={{ fontWeight:700,marginBottom:16,fontSize:15, display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={18} /> AI Summary</h3>
            {!result && !loading && <div className="empty-state" style={{ padding:'40px 20px' }}><div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><PenTool size={32} /></div><h3>Your summary will appear here</h3><p>Paste notes and click Generate</p></div>}
            {loading && !result && <div style={{ display:'flex',gap:10,alignItems:'center',padding:20 }}><span className="spinner" /><span style={{ color:'var(--text-muted)',fontSize:14 }}>AI is reading and summarizing...</span></div>}
            {result && <div className="ai-response" style={{ overflowY:'auto',maxHeight:500 }}><ReactMarkdown>{result}</ReactMarkdown></div>}
          </div>
        </div>
      ) : (
        <div>
          {loadingList ? (
            <div style={{ display:'flex',gap:10,alignItems:'center',padding:20 }}><span className="spinner" /><span style={{ color:'var(--text-muted)',fontSize:14 }}>Loading from database...</span></div>
          ) : summaries.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><PenTool size={32} /></div><h3>No summaries yet</h3><p>Create your first AI summary from your lecture notes.</p><button className="btn btn-primary" style={{ marginTop:16, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setView('create')}><ClipboardEdit size={16} /> Create Summary</button></div></div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {summaries.map(s => <SummaryCard key={s.id} summary={s} onDelete={() => handleDelete(s.id)} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ summary, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card" style={{ cursor:'pointer' }}>
      <div style={{ display:'flex',alignItems:'center',gap:12 }} onClick={() => setExpanded(e => !e)}>
        <span style={{ display: 'flex', alignItems: 'center' }}><PenTool size={24} /></span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600,fontSize:14 }}>{summary.title}</div>
          <div style={{ fontSize:12,color:'var(--text-muted)' }}>{new Date(summary.created_at||summary.createdAt).toLocaleString()}</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); onDelete(); }} style={{ color:'#f87171',borderColor:'rgba(239,68,68,0.3)',flexShrink:0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}><Trash2 size={16} /></button>
        <span style={{ color:'var(--text-muted)' }}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </div>
      {expanded && <div className="ai-response" style={{ marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)' }}><ReactMarkdown>{summary.content}</ReactMarkdown></div>}
    </div>
  );
}
