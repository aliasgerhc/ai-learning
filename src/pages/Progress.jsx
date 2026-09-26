import { useState, useEffect } from 'react';
import { getQuizResults } from '../utils/storage';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { BrainCircuit, Star, Trophy, CheckCircle, TrendingUp, BarChart, Target, Clock, Zap } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } } },
  scales: {
    x: { ticks: { color: '#94a3b8', font: { family: 'Inter' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#94a3b8', font: { family: 'Inter' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
  },
};

export default function Progress() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizResults().then(list => {
      setResults(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const last10 = results.slice(0, 10).reverse();
  const avgScore = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
  const bestScore = results.length ? Math.max(...results.map(r => r.score)) : 0;
  const totalQuizzes = results.length;
  const passRate = results.length ? Math.round(results.filter(r => r.score >= 60).length / results.length * 100) : 0;

  const scoreData = {
    labels: last10.map((r, i) => `Quiz ${i + 1}`),
    datasets: [{
      label: 'Score %',
      data: last10.map(r => r.score),
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,0.15)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#7c3aed',
      pointRadius: 5,
    }],
  };

  const topicCounts = {};
  results.forEach(r => { topicCounts[r.topic || 'General'] = (topicCounts[r.topic || 'General'] || 0) + 1; });
  const topTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const barData = {
    labels: topTopics.map(t => t[0]),
    datasets: [{
      label: 'Quizzes Taken',
      data: topTopics.map(t => t[1]),
      backgroundColor: ['rgba(124,58,237,0.7)', 'rgba(37,99,235,0.7)', 'rgba(6,182,212,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(236,72,153,0.7)'],
      borderRadius: 8,
    }],
  };

  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  results.forEach(r => { if (r.difficulty) diffCounts[r.difficulty] = (diffCounts[r.difficulty] || 0) + 1; });

  const doughnutData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [{
      data: [diffCounts.Easy, diffCounts.Medium, diffCounts.Hard],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
      borderColor: 'transparent',
      hoverOffset: 4,
    }],
  };

  const STATS = [
    { icon: <BrainCircuit size={24} color="white" />, label: 'Total Quizzes', value: totalQuizzes, gradient: 'var(--gradient-primary)' },
    { icon: <Star size={24} color="white" />, label: 'Average Score', value: `${avgScore}%`, gradient: 'var(--gradient-secondary)' },
    { icon: <Trophy size={24} color="white" />, label: 'Best Score', value: `${bestScore}%`, gradient: 'var(--gradient-green)' },
    { icon: <CheckCircle size={24} color="white" />, label: 'Pass Rate', value: `${passRate}%`, gradient: 'var(--gradient-orange)' },
  ];

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={24} className="text-primary" /> Progress & Analytics</div>
          <div className="section-sub">Track your learning journey over time</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {STATS.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{loading ? <span className="pulse">…</span> : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex',gap:10,alignItems:'center',padding:20 }}><span className="spinner" /><span style={{ color:'var(--text-muted)',fontSize:14 }}>Loading analytics...</span></div>
      ) : results.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><BarChart size={32} /></div>
            <h3>No data yet</h3>
            <p>Take some quizzes to see your progress analytics here!</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Score Trend */}
          {last10.length > 1 && (
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} /> Score Trend (Last 10 Quizzes)</div>
              <div style={{ height: 240 }}>
                <Line
                  data={scoreData}
                  options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }}
                />
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* Topic Bar */}
            {topTopics.length > 0 && (
              <div className="card">
                <div className="section-title" style={{ marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><BrainCircuit size={18} /> Quizzes by Topic</div>
                <div style={{ height: 220 }}>
                  <Bar data={barData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
                </div>
              </div>
            )}

            {/* Difficulty Donut */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={18} /> Difficulty Breakdown</div>
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Doughnut data={doughnutData} options={{ ...chartDefaults, scales: undefined, cutout: '65%' }} />
              </div>
            </div>
          </div>

          {/* Recent Quiz History */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} /> Recent Quiz History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.slice(0, 10).map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(results.length, 10) - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: r.score >= 80 ? '#fbbf24' : r.score >= 60 ? '#60a5fa' : '#94a3b8' }}>
                    {r.score >= 80 ? <Trophy size={20} /> : r.score >= 60 ? <Star size={20} /> : <Zap size={20} />}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{r.topic || 'General Quiz'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.created_at || r.date).toLocaleDateString()} · {r.difficulty || 'Medium'} · {r.correct}/{r.total} correct</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{r.score}%</div>
                    <div className="progress-bar-wrap" style={{ width: 80, marginTop: 4 }}>
                      <div className="progress-bar" style={{ width: `${r.score}%`, background: r.score >= 70 ? 'var(--gradient-green)' : r.score >= 50 ? 'var(--gradient-orange)' : 'linear-gradient(135deg,#ef4444,#dc2626)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
