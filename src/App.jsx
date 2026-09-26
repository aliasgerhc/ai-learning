import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import AiTutor from './pages/AiTutor';
import PdfChat from './pages/PdfChat';
import Quiz from './pages/Quiz';
import Summaries from './pages/Summaries';
import Planner from './pages/Planner';
import Progress from './pages/Progress';
import Assignments from './pages/Assignments';

export default function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('eduai_auth');
    if (raw) {
      try {
        setAuth(JSON.parse(raw));
      } catch {}
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('eduai_auth');
    setAuth(null);
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" /></div>;
  }

  if (!auth) {
    return <Login onAuth={(user) => setAuth(user)} />;
  }

  return (
    <BrowserRouter>
      <Layout auth={auth} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/tutor" element={<AiTutor />} />
          <Route path="/pdf-chat" element={<PdfChat />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
