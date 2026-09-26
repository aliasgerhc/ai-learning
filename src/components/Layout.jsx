import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import ApiKeyModal from './ApiKeyModal';
import { LayoutDashboard, BookOpen, Bot, FileText, BrainCircuit, PenTool, Calendar, TrendingUp, Menu, Key, LogOut } from 'lucide-react';

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
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

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
          <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => setShowKeyModal(true)}>
            <Key size={18} />
          </button>
          <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon"><BookOpen size={22} color="white" /></div>
            <span className="logo-text">EduAI</span>
          </div>
          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 13, gap: 6 }} onClick={() => setShowKeyModal(true)}>
            <Key size={14} /> API Key
          </button>
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
