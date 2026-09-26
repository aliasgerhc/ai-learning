import { useState } from 'react';
import { API_BASE } from '../utils/apiClient';
import { BookOpen, User } from 'lucide-react';

export default function Login({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? 'auth.php?action=login' : 'auth.php?action=register';
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      const user = { ...data.data, isGuest: false };
      localStorage.setItem('eduai_auth', JSON.stringify(user));
      onAuth(user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGuest = () => {
    const guestUser = { id: 0, name: 'Guest User', email: 'guest@eduai.com', isGuest: true };
    localStorage.setItem('eduai_auth', JSON.stringify(guestUser));
    onAuth(guestUser);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="logo-icon" style={{ margin: '0 auto 16px', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Welcome to EduAI</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your AI-powered learning companion</p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input type="email" className="input" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" className="input" required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? <span className="spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="btn" style={{ background: 'none', color: 'var(--text-muted)', fontSize: 13 }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="divider" style={{ margin: '24px 0' }} />

        <button className="btn btn-outline btn-full" onClick={handleGuest} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <User size={18} /> Continue as Guest
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          Guest data is stored locally on your device only.
        </p>
      </div>
    </div>
  );
}
