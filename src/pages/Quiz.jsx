import { useState } from 'react';
import { callGemini } from '../utils/ai';
import { saveQuizResult } from '../utils/storage';
import DocumentUpload from '../components/DocumentUpload';
import ReactMarkdown from 'react-markdown';
import { BrainCircuit, Check, X, Eye, ArrowRight, RotateCcw, ListChecks, Target, AlertCircle, Lightbulb, Trophy, Star, Zap } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [5, 10, 15, 20];
const SUBJECTS = ['Mathematics', 'Science', 'History', 'Literature', 'Programming', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Custom'];

export default function Quiz() {
  const [step, setStep] = useState('config'); // config | loading | quiz | result
  const [config, setConfig] = useState({ subject: 'Science', difficulty: 'Medium', count: 10, topic: '' });
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentContext, setDocumentContext] = useState('');

  const generateQuiz = async () => {
    setLoading(true); setError(''); setStep('loading');
    try {
      const topic = config.topic || config.subject;
      const document = documentContext ? `\nUse this uploaded study document as the primary source:\n---\n${documentContext.slice(0, 8000)}\n---\n` : '';
      const prompt = `Generate exactly ${config.count} multiple-choice quiz questions about "${topic}" at ${config.difficulty} difficulty level for students.${document}

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Brief explanation why the answer is correct."
  }
]

The "answer" field must be the index (0-3) of the correct option in "options". Generate exactly ${config.count} questions.`;

      const raw = await callGemini(prompt);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Invalid response format. Please try again.');
      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No questions generated.');
      setQuestions(parsed);
      setAnswers({});
      setRevealed({});
      setCurrent(0);
      setStep('quiz');
    } catch (err) {
      setError(err.message);
      setStep('config');
    }
    setLoading(false);
  };

  const selectAnswer = (qIdx, optIdx) => {
    if (revealed[qIdx]) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const revealAnswer = () => {
    if (answers[current] === undefined) return;
    setRevealed(prev => ({ ...prev, [current]: true }));
  };

  const next = () => {
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else finishQuiz();
  };

  const finishQuiz = async () => {
    const correct = questions.filter((q, i) => answers[i] === q.answer).length;
    const score = Math.round((correct / questions.length) * 100);
    await saveQuizResult({ topic: config.topic || config.subject, score, correct, total: questions.length, difficulty: config.difficulty });
    setStep('result');
  };

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  if (step === 'loading') return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 20px', borderWidth: 4 }} />
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Generating Quiz...</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>AI is crafting {config.count} {config.difficulty} questions on {config.topic || config.subject}</p>
    </div>
  );

  if (step === 'result') {
    const pct = score;
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: score >= 80 ? '#fbbf24' : score >= 60 ? '#60a5fa' : '#94a3b8' }}>
            {score >= 80 ? <Trophy size={60} /> : score >= 60 ? <Star size={60} /> : <Zap size={60} />}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Quiz Complete!</h2>
          <div style={{
            width: 120, height: 120, margin: '20px auto',
            borderRadius: '50%',
            background: `conic-gradient(${score >= 70 ? 'var(--accent-green)' : score >= 50 ? 'var(--accent-orange)' : '#ef4444'} ${pct}%, rgba(255,255,255,0.07) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ width: 90, height: 90, background: 'var(--bg-secondary)', borderRadius: '50%', position: 'absolute' }} />
            <span style={{ position: 'relative', fontSize: 24, fontWeight: 900 }}>{score}%</span>
          </div>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            {correct} / {questions.length} Correct
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            {score >= 80 ? 'Excellent work! You\'ve mastered this topic.' : score >= 60 ? 'Good job! Keep practicing to improve.' : 'Keep studying! You\'ll get better with practice.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setStep('config'); setQuestions([]); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RotateCcw size={16} /> New Quiz</button>
            <button className="btn btn-secondary" onClick={() => setStep('review')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ListChecks size={16} /> Review Answers</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="fade-in">
        <div className="section-header" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ListChecks size={24} /> Quiz Review</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setStep('config'); setQuestions([]); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RotateCcw size={16} /> New Quiz</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions.map((q, qi) => (
            <div key={qi} className="card" style={{ borderColor: answers[qi] === q.answer ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{answers[qi] === q.answer ? <Check size={18} color="#10b981" /> : <X size={18} color="#ef4444" />}</span>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Q{qi + 1}. {q.question}</div>
              </div>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{
                  padding: '8px 14px', borderRadius: 8, marginBottom: 6, fontSize: 13,
                  background: oi === q.answer ? 'rgba(16,185,129,0.15)' : oi === answers[qi] && oi !== q.answer ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${oi === q.answer ? 'rgba(16,185,129,0.4)' : oi === answers[qi] && oi !== q.answer ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                  color: oi === q.answer ? '#34d399' : oi === answers[qi] && oi !== q.answer ? '#f87171' : 'var(--text-secondary)',
                }}>
                  {String.fromCharCode(65 + oi)}. {opt}
                </div>
              ))}
              {q.explanation && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(37,99,235,0.1)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <Lightbulb size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} /> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'quiz' && questions.length > 0) {
    const q = questions[current];
    const isRevealed = revealed[current];
    const selectedOpt = answers[current];

    return (
      <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {current + 1} of {questions.length}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-purple">{config.difficulty}</span>
              <span className="badge badge-blue">{config.topic || config.subject}</span>
            </div>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, lineHeight: 1.5 }}>{q.question}</h3>

          {q.options.map((opt, oi) => {
            let cls = 'quiz-option';
            if (isRevealed) {
              if (oi === q.answer) cls += ' correct';
              else if (oi === selectedOpt) cls += ' wrong';
            } else if (oi === selectedOpt) cls += ' selected';

            return (
              <div key={oi} className={cls} onClick={() => selectAnswer(current, oi)}>
                <div className="quiz-letter">{String.fromCharCode(65 + oi)}</div>
                <span style={{ fontSize: 14 }}>{opt}</span>
                {isRevealed && oi === q.answer && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}><Check size={16} /></span>}
                {isRevealed && oi === selectedOpt && oi !== q.answer && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}><X size={16} /></span>}
              </div>
            );
          })}

          {isRevealed && q.explanation && (
            <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}><Lightbulb size={14} /> Explanation</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.explanation}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'space-between' }}>
            {!isRevealed ? (
              <button className="btn btn-secondary" onClick={revealAnswer} disabled={selectedOpt === undefined} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={16} /> Reveal Answer
              </button>
            ) : <div />}
            <button className="btn btn-primary" onClick={next} disabled={selectedOpt === undefined} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {current < questions.length - 1 ? <>Next <ArrowRight size={16} /></> : <><Target size={16} /> Finish Quiz</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Config step
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BrainCircuit size={24} className="text-primary" /> Quiz Generator</div>
          <div className="section-sub">AI-generated quizzes tailored to your topic</div>
        </div>
        <DocumentUpload label="Add study document" onTextLoaded={(text, fileName) => setDocumentContext(text || `Uploaded study file: ${fileName}`)} />
      </div>

      <div className="card">
        {error && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Subject</label>
          <select className="select" value={config.subject} onChange={e => setConfig(c => ({ ...c, subject: e.target.value }))}>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {config.subject === 'Custom' && (
          <div className="input-group">
            <label className="input-label">Custom Topic</label>
            <input className="input" placeholder="e.g., World War II, Calculus derivatives..." value={config.topic} onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))} />
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Topic / Subtopic (optional)</label>
          <input className="input" placeholder="e.g., Photosynthesis, Newton's Laws..." value={config.subject !== 'Custom' ? config.topic : ''} onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))} disabled={config.subject === 'Custom'} />
        </div>

        <div className="input-group">
          <label className="input-label">Difficulty</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {DIFFICULTIES.map(d => (
              <button key={d} className={`btn ${config.difficulty === d ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setConfig(c => ({ ...c, difficulty: d }))} style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
                {d === 'Easy' ? <Target size={14} color={config.difficulty === d ? 'white' : '#10b981'} /> : d === 'Medium' ? <Target size={14} color={config.difficulty === d ? 'white' : '#f59e0b'} /> : <Target size={14} color={config.difficulty === d ? 'white' : '#ef4444'} />} {d}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Number of Questions</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {QUESTION_COUNTS.map(n => (
              <button key={n} className={`btn ${config.count === n ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setConfig(c => ({ ...c, count: n }))} style={{ flex: 1, justifyContent: 'center' }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={generateQuiz} disabled={loading}>
          {loading ? <><span className="spinner" /> Generating...</> : <><BrainCircuit size={18} /> Generate Quiz</>}
        </button>
      </div>
    </div>
  );
}
