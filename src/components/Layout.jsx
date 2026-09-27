import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import ApiKeyModal from './ApiKeyModal';
import { LayoutDashboard, BookOpen, Bot, FileText, BrainCircuit, PenTool, Calendar, TrendingUp, Menu, Key, LogOut, Moon, Sun } from 'lucide-react';

const NAV_LINKS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
  { icon: <BookOpen size={20} />, label: 'Courses', path: '/courses' },
  { icon: <Bot size={20} />, label: 'AI Tutor', path: '/tutor' },
  { icon: <FileText size={20} />, label: 'PDF Chat', path: '/pdf-chat' },
  { icon: <BrainCircuit size={20} />, label: 'Quiz', path: '/quiz' },
  { icon: <PenTool size={20} />, label: 'Summaries', path: '/summaries' },
  { icon: <Calendar size={20} />, label: 'Planner', path: '/planner' },
  { icon: <TrendingUp size={20} />, label: 'Progress', path: '/progress' },
  { icon: <BookOpen size={20} />, label: 'Assignments', path: '/assignments' },
];

const MOBILE_LINKS = [
  { icon: <LayoutDashboard size={20} />, label: 'Home', path: '/' },
  { icon: <Bot size={20} />, label: 'Tutor', path: '/tutor' },
  { icon: <BrainCircuit size={20} />, label: 'Quiz', path: '/quiz' },
  { icon: <FileText size={20} />, label: 'PDF', path: '/pdf-chat' },
  { icon: <BookOpen size={20} />, label: 'More', path: '/courses' },
];

export default function Layout({ children, auth, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('eduai_theme') || 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('eduai_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark');

  return (
    <div className="layout">
      {showKeyModal && <ApiKeyModal onClose={() => setShowKeyModal(false)} />}
      
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="logo-icon"><BookOpen size={20} color="white" /></div>
          <span className="logo-text">EduAI</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn" onClick={() => setShowKeyModal(true)} aria-label="Open Gemini API settings" title="Gemini API settings">
            <Key size={18} />
          </button>
          <button className="icon-btn mobile-logout-btn" onClick={onLogout} aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
          <button className="icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open navigation" title="Open navigation">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-icon"><BookOpen size={22} color="white" /></div>
            <span className="logo-text">EduAI</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ position: 'relative' }}>
            <div className="user-avatar">{auth?.name?.charAt(0)?.toUpperCase() || 'S'}</div>
            <div className="user-info">
              <div className="user-name">{auth?.name || 'Student'}</div>
              <div className="user-role">{auth?.isGuest ? 'Guest Mode' : 'Pro Learner'}</div>
            </div>
            <button 
              onClick={onLogout}
              style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="app-toolbar">
          <span className="toolbar-label">Learning workspace</span>
          <div className="toolbar-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className="api-key-btn" onClick={() => setShowKeyModal(true)}>
              <Key size={15} /> <span>API Key</span>
            </button>
          </div>
        </div>
        <div className="content-container">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {MOBILE_LINKS.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">{link.icon}</div>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
