import { useState, useRef, useEffect } from 'react';
import { getCourses, addCourse, deleteCourse } from '../utils/storage';
import { BookOpen, Search, Paperclip, FileText, X } from 'lucide-react';

const CATEGORIES = ['Mathematics', 'Science', 'History', 'Literature', 'Programming', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Languages', 'Other'];
const COLORS = [
  { name: 'Purple', value: 'var(--gradient-primary)' },
  { name: 'Blue', value: 'var(--gradient-secondary)' },
  { name: 'Green', value: 'var(--gradient-green)' },
  { name: 'Orange', value: 'var(--gradient-orange)' },
  { name: 'Pink', value: 'var(--gradient-pink)' },
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', category: 'Science', description: '', color: COLORS[0].value, progress: 0 });
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    getCourses().then(list => {
      setCourses(list);
      setLoadingList(false);
    }).catch(() => setLoadingList(false));
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setIsSubmitting(true);
    try {
      const newCourse = await addCourse({ ...form, files: files.map(f => ({ name: f.name, size: f.size })) });
      setCourses(prev => [newCourse, ...prev]);
      setForm({ name: '', category: 'Science', description: '', color: COLORS[0].value, progress: 0 });
      setFiles([]);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    await deleteCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleFiles = (newFiles) => {
    setFiles(prev => [...prev, ...Array.from(newFiles)]);
  };

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={24} className="text-primary" /> Course Management</div>
          <div className="section-sub">Organize your study materials and courses</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {showForm ? <><X size={16} /> Cancel</> : '+ Add Course'}
        </button>
      </div>

      {/* Add Course Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, border: '1px solid rgba(124,58,237,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={18} /> New Course</h3>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Course Name *</label>
              <input className="input" placeholder="e.g., Advanced Mathematics" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea className="textarea" style={{ minHeight: 80 }} placeholder="Brief description of this course..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="input-group">
            <label className="input-label">Color Theme</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => setForm(f => ({ ...f, color: c.value }))}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', background: c.value, border: form.color === c.value ? '3px solid white' : '3px solid transparent', cursor: 'pointer', transition: 'var(--transition)', outline: 'none',
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Progress: {form.progress}%</label>
            <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))} style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
          </div>

          {/* File Upload */}
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            style={{ padding: 20, marginBottom: 16 }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Paperclip size={28} color="var(--text-muted)" /></div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Drop study materials here</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF, DOCX, TXT (files stored locally)</div>
            <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          </div>

          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {files.map((f, i) => (
                <div key={i} className="file-item" style={{ padding: '8px 12px' }}>
                  <span className="file-icon" style={{ display: 'flex', alignItems: 'center' }}><FileText size={16} /></span>
                  <div className="file-info">
                    <div className="file-name" style={{ fontSize: 13 }}>{f.name}</div>
                    <div className="file-size">{(f.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button onClick={() => setFiles(fs => fs.filter((_, fi) => fi !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name.trim() || isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isSubmitting ? <span className="spinner" /> : <><BookOpen size={16} /> Add Course</>}
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
        <input className="input" style={{ paddingLeft: 38 }} placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Courses Grid */}
      {loadingList ? (
        <div style={{ display:'flex',gap:10,alignItems:'center',padding:20 }}><span className="spinner" /><span style={{ color:'var(--text-muted)',fontSize:14 }}>Loading courses...</span></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}><BookOpen size={32} /></div>
            <h3>{courses.length === 0 ? 'No courses yet' : 'No matching courses'}</h3>
            <p>{courses.length === 0 ? 'Add your first course to organize your study materials.' : 'Try a different search term.'}</p>
            {courses.length === 0 && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>+ Add Course</button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(c => (
            <CourseCard key={c.id} course={c} onDelete={() => handleDelete(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, onDelete }) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Color stripe */}
      <div style={{ height: 4, background: course.color, borderRadius: '4px 4px 0 0', position: 'absolute', top: 0, left: 0, right: 0 }} />

      <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: course.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, color: 'white'
          }}>
            <BookOpen size={22} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{course.name}</div>
          <span className="badge badge-purple" style={{ marginBottom: 8 }}>{course.category}</span>
          {course.description && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>{course.description}</div>
          )}
        </div>
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, transition: 'var(--transition)', display: 'flex' }}
          onMouseEnter={e => e.target.style.color = '#f87171'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{course.progress}%</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${course.progress}%`, background: course.color }} />
        </div>
      </div>

      {/* Files */}
      {course.files?.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {course.files.map((f, i) => (
            <span key={i} className="tag" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FileText size={12} /> {f.name.slice(0, 15)}{f.name.length > 15 ? '…' : ''}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
        Added {new Date(course.created_at || course.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
