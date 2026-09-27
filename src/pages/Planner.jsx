import { useState, useEffect } from 'react';
import { callGemini } from '../utils/ai';
import { getStudyPlans, saveStudyPlan } from '../utils/storage';
import DocumentUpload from '../components/DocumentUpload';
import ReactMarkdown from 'react-markdown';
import { Calendar, BookOpen, PenTool, ChevronDown, ChevronUp } from 'lucide-react';

export default function Planner() {
  const [plans, setPlans] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [view, setView] = useState('create');
  const [form, setForm] = useState({ subjects: '', deadline: '', hoursPerDay: '3', goal: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getStudyPlans().then(list => {
      setPlans(list);
      setLoadingList(false);
    }).catch(() => setLoadingList(false));
  }, []);

  const generate = async () => {
    if (!form.subjects || !form.deadline) return;
    setLoading(true); setError(''); setResult('');
    try {
      const prompt = `You are an expert academic study planner. Create a detailed, personalized study schedule for a student.

Student Details:
- Subjects/Topics to cover: ${form.subjects}
- Deadline/Exam date: ${form.deadline}
- Available study hours per day: ${form.hoursPerDay} hours
- Study goal: ${form.goal || 'Master all topics and perform well'}

Create a day-by-day study plan from today (${new Date().toLocaleDateString()}) until the deadline. Include:
1. Overview - Summary of the plan
2. Daily Schedule - Specific topics for each day with time allocation
3. Weekly Goals - What to achieve each week
4. Study Techniques - Recommended methods for each subject
5. Review Strategy - How to revise before the deadline
6. Important Milestones - Key checkpoints

Use markdown with clear headers, tables where appropriate. Make it motivating and achievable.`;

      let full = '';
      await callGemini(prompt, (text) => { full = text; setResult(text); });
      const newList = await saveStudyPlan({ title: `Plan for: ${form.subjects.slice(0, 40)}`, content: full, deadline: form.deadline, subjects: form.subjects });
      setPlans(prev => [newList, ...prev]);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={24} className="text-primary" /> AI Study Planner</div>
          <div className="section-sub">Generate personalized study schedules with AI</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${view === 'create' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><PenTool size={16} /> Create Plan</button>
          <button className={`btn btn-sm ${view === 'plans' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('plans')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={16} /> My Plans ({plans.length})</button>
        </div>
      </div>

      {view === 'create' ? (
        <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={18} /> Plan Details</h3>

            <div className="input-group">
              <label className="input-label">Subjects / Topics to Study *</label>
              <DocumentUpload label="Load topics from file" onTextLoaded={(text) => setForm(f => ({ ...f, subjects: text.slice(0, 4000) }))} />
              <textarea
                className="textarea"
                style={{ minHeight: 100 }}
                placeholder="e.g., Mathematics (Calculus, Algebra), Physics (Mechanics, Waves), Chemistry (Organic)"
                value={form.subjects}
                onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Exam / Deadline Date *</label>
              <input
                type="date"
                className="input"
                min={new Date().toISOString().split('T')[0]}
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Study Hours Per Day: {form.hoursPerDay}h</label>
              <input
                type="range" min="1" max="12" step="0.5"
                value={form.hoursPerDay}
                onChange={e => setForm(f => ({ ...f, hoursPerDay: e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>1h</span><span>6h</span><span>12h</span>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Study Goal (optional)</label>
              <input className="input" placeholder="e.g., Score 90%+ in finals, Master all concepts" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={generate} disabled={loading || !form.subjects || !form.deadline} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><span className="spinner" /> Planning...</> : <><Calendar size={18} /> Generate Study Plan</>}
            </button>
          </div>

          <div className="card" style={{ minHeight: 400 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} /> Your Study Plan</h3>
            {!result && !loading && (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><Calendar size={32} /></div>
                <h3>Your plan will appear here</h3>
                <p>Fill in your subjects and deadline to generate a personalized schedule</p>
              </div>
            )}
            {loading && !result && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 20 }}>
                <span className="spinner" />
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>AI is creating your personalized schedule...</span>
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
            <div style={{ display:'flex',gap:10,alignItems:'center',padding:20 }}><span className="spinner" /><span style={{ color:'var(--text-muted)',fontSize:14 }}>Loading plans...</span></div>
          ) : plans.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><Calendar size={32} /></div>
                <h3>No study plans yet</h3>
                <p>Create your first AI-powered study schedule.</p>
                <button className="btn btn-primary" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setView('create')}><PenTool size={16} /> Create Plan</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {plans.map(p => <PlanCard key={p.id} plan={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan }) {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = plan.deadline
    ? Math.max(0, Math.ceil((new Date(plan.deadline) - new Date()) / 86400000))
    : null;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <span style={{ display: 'flex', alignItems: 'center' }}><Calendar size={24} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{plan.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created {new Date(plan.created_at || plan.createdAt).toLocaleDateString()}</div>
        </div>
        {daysLeft !== null && (
          <span className={`badge ${daysLeft <= 3 ? 'badge-red' : daysLeft <= 7 ? 'badge-orange' : 'badge-green'}`}>
            {daysLeft}d left
          </span>
        )}
        <span style={{ color: 'var(--text-muted)' }}>{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </div>
      {expanded && (
        <div className="ai-response" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', overflowY: 'auto', maxHeight: 600 }}>
          <ReactMarkdown>{plan.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// Ensure icons used in render exist
import { Target, ClipboardList } from 'lucide-react';
