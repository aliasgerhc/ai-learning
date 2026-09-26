import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getQuizResults, getSummaries } from '../utils/storage';
import { Bot, FileText, BrainCircuit, PenTool, Calendar, BookOpen, Brain, Star, Trophy, Rocket } from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: <Bot size={22} color="white" />, label: 'Ask AI Tutor', sub: 'Get instant answers', path: '/tutor', gradient: 'var(--gradient-primary)' },
  { icon: <FileText size={22} color="white" />, label: 'Chat with PDF', sub: 'Upload & query docs', path: '/pdf-chat', gradient: 'var(--gradient-secondary)' },
  { icon: <BrainCircuit size={22} color="white" />, label: 'Take a Quiz', sub: 'Test your knowledge', path: '/quiz', gradient: 'var(--gradient-green)' },
  { icon: <PenTool size={22} color="white" />, label: 'Summarize Notes', sub: 'AI-powered summaries', path: '/summaries', gradient: 'var(--gradient-orange)' },
  { icon: <Calendar size={22} color="white" />, label: 'Study Planner', sub: 'Plan your schedule', path: '/planner', gradient: 'var(--gradient-pink)' },
  { icon: <BookOpen size={22} color="white" />, label: 'Submit Assignment', sub: 'AI evaluation', path: '/assignments', gradient: 'var(--gradient-primary)' },
];

const TIPS = [
  "📌 Use PDF Chat to ask questions directly from your textbooks.",
  "🧠 Take short quizzes after every study session for better retention.",
  "📅 Plan your study schedule 3 days in advance for optimal results.",
  "🤖 Ask the AI Tutor to explain concepts in simple terms.",
  "📝 Summarize your lecture notes right after class for best results.",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState({ quizzes: [], summaries: [] });
  const [loading, setLoading] = useState(true);
  
  const rawAuth = localStorage.getItem('eduai_auth');
  const auth = rawAuth ? JSON.parse(rawAuth) : { name: 'Student' };

  useEffect(() => {
    async function load() {
      try {
        const apiStats = await getDashboardStats();
        if (apiStats) {
          setStats(apiStats.stats);
          setRecent({ quizzes: apiStats.recent_quizzes || [], summaries: apiStats.recent_summaries || [] });
        } else {
          // fallback
          const [qr, sm] = await Promise.all([getQuizResults(), getSummaries()]);
          const avgScore = qr.length ? Math.round(qr.reduce((a, r) => a + (r.score || 0), 0) / qr.length) : 0;
          setStats({ total_quizzes: qr.length, total_summaries: sm.length, avg_score: avgScore, best_score: qr.length ? Math.max(...qr.map(r => r.score)) : 0 });
          setRecent({ quizzes: qr.slice(0, 5), summaries: sm.slice(0, 5) });
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const tip = TIPS[new Date().getDay() % TIPS.length];

  const STAT_CARDS = [
    { icon: <Brain size={24} color="white" />, label: 'Quizzes Taken',  value: stats?.total_quizzes   ?? '—', gradient: 'var(--gradient-primary)' },
    { icon: <PenTool size={24} color="white" />, label: 'Summaries Made', value: stats?.total_summaries ?? '—', gradient: 'var(--gradient-secondary)' },
    { icon: <Star size={24} color="white" />, label: 'Avg Quiz Score', value: stats?.avg_score ? `${stats.avg_score}%` : '—', gradient: 'var(--gradient-green)' },
    { icon: <Trophy size={24} color="white" />, label: 'Best Score',     value: stats?.best_score ? `${stats.best_score}%` : '—', gradient: 'var(--gradient-orange)' },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(37,99,235,0.15) 100%)',
        border: '1px solid rgba(124,58,237,0.3)', marginBottom: 28, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }} role="img" aria-label="wave">👋</span>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>Welcome back, {auth.name}!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>Ready to learn something amazing today?</p>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '10px 16px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-secondary)' }}>
            💡 <strong>Daily Tip:</strong> {tip}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {STAT_CARDS.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.gradient }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{loading ? <span className="pulse">…</span> : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div><div className="section-title">⚡ Quick Actions</div><div className="section-sub">Jump right into your learning</div></div>
      </div>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {QUICK_ACTIONS.map((action, i) => (
          <button key={i} onClick={() => navigate(action.path)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer', transition: 'var(--transition)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.4)'; e.currentTarget.style.background='var(--bg-card-hover)'; e.currentTarget.style.boxShadow='var(--shadow-card)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.boxShadow=''; }}>
            <div style={{ width:48,height:48,background:action.gradient,borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{action.icon}</div>
            <div>
              <div style={{ fontWeight:600,fontSize:14,color:'var(--text-primary)',marginBottom:2 }}>{action.label}</div>
              <div style={{ fontSize:12,color:'var(--text-muted)' }}>{action.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="section-header"><div><div className="section-title">🕐 Recent Activity</div><div className="section-sub">Your latest learning sessions</div></div></div>

      {!loading && recent.quizzes.length === 0 && recent.summaries.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Rocket size={32} />
            </div>
            <h3>Start your learning journey!</h3>
            <p>Take a quiz, chat with AI, or summarize your notes to see activity here.</p>
            <button className="btn btn-primary" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate('/tutor')}>
              <Bot size={18} /> Start with AI Tutor
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {recent.quizzes.map((r, i) => (
            <div className="file-item" key={i}>
              <span className="file-icon"><Brain size={18} /></span>
              <div className="file-info">
                <div className="file-name">Quiz: {r.topic || 'General'}</div>
                <div className="file-size">{new Date(r.created_at || r.date).toLocaleDateString()}</div>
              </div>
              <span className={`badge ${(r.score||0)>=70?'badge-green':'badge-orange'}`}>{r.score}%</span>
            </div>
          ))}
          {recent.summaries.map((s, i) => (
            <div className="file-item" key={i}>
              <span className="file-icon"><PenTool size={18} /></span>
              <div className="file-info">
                <div className="file-name">{s.title||'Untitled Summary'}</div>
                <div className="file-size">{new Date(s.created_at||s.createdAt).toLocaleDateString()}</div>
              </div>
              <span className="badge badge-blue">Summary</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
