import { useState, useEffect } from 'react';
import { callGemini } from '../utils/ai';
import { getAssignments, saveAssignment } from '../utils/storage';
import DocumentUpload from '../components/DocumentUpload';
import ReactMarkdown from 'react-markdown';
import { BookOpen, ClipboardList, PenTool, Target, ChevronDown, ChevronUp } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'Science', 'History', 'Literature', 'Programming', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Other'];

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [view, setView] = useState('submit'); // submit | history
  const [form, setForm] = useState({ subject: 'Science', title: '', content: '', criteria: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getAssignments().then(list => {
      setAssignments(list);
      setLoadingList(false);
    }).catch(() => setLoadingList(false));
  }, []);

  const evaluate = async () => {
    if (!form.content.trim()) return;
    setLoading(true); setError(''); setResult('');
    try {
      const prompt = `You are an expert academic evaluator. Please evaluate the following student assignment.

Subject: ${form.subject}
Assignment Title: ${form.title || 'Untitled Assignment'}
${form.criteria ? `Grading Criteria: ${form.criteria}` : ''}

Assignment Content:
---
${form.content.slice(0, 8000)}
---

Provide a thorough evaluation including:
## Overall Grade
Give a letter grade (A+, A, B+, B, C+, C, D, F) and a percentage score.

## Strengths
What the student did well (at least 3 points)

## Areas for Improvement
Specific weaknesses and how to fix them (at least 3 points)

## Detailed Feedback
Section-by-section or paragraph-by-paragraph feedback

## Suggestions
Concrete suggestions to improve this assignment

## Learning Recommendations
Topics or skills the student should focus on

Be constructive, encouraging, and specific. Use markdown formatting.`;

      let full = '';
      await callGemini(prompt, (text) => { full = text; setResult(text); });
      const newList = await saveAssignment({ subject: form.subject, title: form.title || 'Untitled', content: form.content, feedback: full, criteria: form.criteria });
      setAssignments(prev => [newList, ...prev]);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={24} className="text-primary" /> Assignment Evaluation</div>
          <div className="section-sub">AI evaluates your work and provides detailed feedback</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${view === 'submit' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('submit')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><PenTool size={16} /> Submit</button>
          <button className={`btn btn-sm ${view === 'history' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('history')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={16} /> History ({assignments.length})</button>
        </div>
      </div>

      {view === 'submit' ? (
        <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} /> Assignment Details</h3>

            <div className="input-group">
              <label className="input-label">Subject</label>
              <select className="select" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Assignment Title</label>
              <input className="input" placeholder="e.g., Essay on Climate Change" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="input-group">
              <label className="input-label">Grading Criteria (optional)</label>
              <input className="input" placeholder="e.g., Clarity, Depth of analysis, Citations" value={form.criteria} onChange={e => setForm(f => ({ ...f, criteria: e.target.value }))} />
            </div>

            <div className="input-group">
              <label className="input-label">Assignment Content *</label>
              <DocumentUpload label="Load assignment from file" onTextLoaded={(text) => setForm(f => ({ ...f, content: text.slice(0, 8000) }))} />
              <textarea
                className="textarea"
                style={{ minHeight: 240 }}
                placeholder="Paste your assignment, essay, or work here for AI evaluation..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {form.content.length.toLocaleString()} / 8,000 chars
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={evaluate} disabled={loading || !form.content.trim()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><span className="spinner" /> Evaluating...</> : <><Target size={18} /> Evaluate Assignment</>}
            </button>
          </div>

          <div className="card" style={{ minHeight: 400 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>AI Feedback</h3>
            {!result && !loading && (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><ClipboardList size={32} /></div>
                <h3>Feedback will appear here</h3>
                <p>Paste your assignment and click Evaluate to get detailed AI feedback</p>
              </div>
            )}
            {loading && !result && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 20 }}>
                <span className="spinner" />
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>AI is evaluating your work...</span>
              </div>
            )}
            {result && (
              <div className="ai-response" style={{ overflowY: 'auto', maxHeight: 600 }}>
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {loadingList ? (
            <div style={{ display:'flex',gap:10,alignItems:'center',padding:20 }}><span className="spinner" /><span style={{ color:'var(--text-muted)',fontSize:14 }}>Loading assignments...</span></div>
          ) : assignments.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><ClipboardList size={32} /></div>
                <h3>No assignments evaluated yet</h3>
                <p>Submit your first assignment for AI feedback.</p>
                <button className="btn btn-primary" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setView('submit')}><PenTool size={16} /> Submit Assignment</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {assignments.map(a => <AssignmentCard key={a.id} assignment={a} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment }) {
  const [expanded, setExpanded] = useState(false);
  const grade = assignment.feedback?.match(/[A-F][+-]?(?=\s|$|<)/)?.[0] || '—';
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <span style={{ display: 'flex', alignItems: 'center' }}><ClipboardList size={24} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{assignment.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{assignment.subject} · {new Date(assignment.created_at || assignment.date).toLocaleDateString()}</div>
        </div>
        <span className="badge badge-purple">{grade}</span>
        <span style={{ color: 'var(--text-muted)' }}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </div>
      {expanded && (
        <div className="ai-response" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', overflowY: 'auto', maxHeight: 600 }}>
          <ReactMarkdown>{assignment.feedback}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
