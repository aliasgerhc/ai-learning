// ================================================
// EduAI — Storage Layer
// Primary: PHP/MySQL API
// Fallback: LocalStorage (when backend offline)
// ================================================

import { api } from './apiClient';

// ---- LocalStorage helpers (fallback) ----
const PREFIX = 'eduai_';
function lsGet(key, def = null) {
  try { const v = localStorage.getItem(PREFIX + key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function lsSet(key, val) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
}

// ----------------------------------------------------------------
// COURSES
// ----------------------------------------------------------------
export async function getCourses() {
  try {
    return await api.get('courses.php');
  } catch {
    return lsGet('courses', []);
  }
}

export async function addCourse(course) {
  try {
    const created = await api.post('courses.php', course);
    return created;
  } catch {
    const courses = lsGet('courses', []);
    const newCourse = { ...course, id: Date.now(), createdAt: new Date().toISOString() };
    courses.unshift(newCourse);
    lsSet('courses', courses);
    return newCourse;
  }
}

export async function updateCourse(id, data) {
  try {
    return await api.put(`courses.php?id=${id}`, data);
  } catch {
    const courses = lsGet('courses', []).map(c => c.id === id ? { ...c, ...data } : c);
    lsSet('courses', courses);
    return data;
  }
}

export async function deleteCourse(id) {
  try {
    await api.delete(`courses.php?id=${id}`);
  } catch {
    const courses = lsGet('courses', []).filter(c => c.id !== id);
    lsSet('courses', courses);
  }
}

// ----------------------------------------------------------------
// CHAT HISTORY
// ----------------------------------------------------------------
export async function getChatHistory() {
  try {
    return await api.get('chat.php');
  } catch {
    return lsGet('chat_history', []);
  }
}

export async function addChatMessage(role, content) {
  // Also persist to localStorage immediately for fast UI
  const msgs = lsGet('chat_history', []);
  msgs.push({ role, content, ts: Date.now() });
  lsSet('chat_history', msgs);

  try {
    await api.post('chat.php', { role, content });
  } catch {
    // fallback already handled
  }
}

export async function clearChatHistory() {
  lsSet('chat_history', []);
  try {
    await api.delete('chat.php');
  } catch {}
}

// ----------------------------------------------------------------
// SUMMARIES
// ----------------------------------------------------------------
export async function getSummaries() {
  try {
    return await api.get('summaries.php');
  } catch {
    return lsGet('summaries', []);
  }
}

export async function saveSummary(summary) {
  try {
    const created = await api.post('summaries.php', {
      title:          summary.title,
      content:        summary.content,
      original_notes: summary.originalNotes ?? '',
    });
    return created;
  } catch {
    const list = lsGet('summaries', []);
    const item = { ...summary, id: Date.now(), createdAt: new Date().toISOString() };
    list.unshift(item);
    lsSet('summaries', list);
    return item;
  }
}

export async function deleteSummary(id) {
  try {
    await api.delete(`summaries.php?id=${id}`);
  } catch {
    const list = lsGet('summaries', []).filter(s => s.id !== id);
    lsSet('summaries', list);
  }
}

// ----------------------------------------------------------------
// QUIZ RESULTS
// ----------------------------------------------------------------
export async function getQuizResults() {
  try {
    const d = await api.get('quiz.php');
    return d.results ?? d;
  } catch {
    return lsGet('quiz_results', []);
  }
}

export async function getQuizStats() {
  try {
    const d = await api.get('quiz.php');
    return d.stats ?? null;
  } catch {
    return null;
  }
}

export async function saveQuizResult(result) {
  try {
    await api.post('quiz.php', result);
  } catch {
    const list = lsGet('quiz_results', []);
    list.unshift({ ...result, id: Date.now(), date: new Date().toISOString() });
    lsSet('quiz_results', list);
  }
}

// ----------------------------------------------------------------
// ASSIGNMENTS
// ----------------------------------------------------------------
export async function getAssignments() {
  try {
    return await api.get('assignments.php');
  } catch {
    return lsGet('assignments', []);
  }
}

export async function saveAssignment(assignment) {
  try {
    return await api.post('assignments.php', assignment);
  } catch {
    const list = lsGet('assignments', []);
    const item = { ...assignment, id: Date.now(), date: new Date().toISOString() };
    list.unshift(item);
    lsSet('assignments', list);
    return item;
  }
}

export async function deleteAssignment(id) {
  try {
    await api.delete(`assignments.php?id=${id}`);
  } catch {
    const list = lsGet('assignments', []).filter(a => a.id !== id);
    lsSet('assignments', list);
  }
}

// ----------------------------------------------------------------
// STUDY PLANS
// ----------------------------------------------------------------
export async function getStudyPlans() {
  try {
    return await api.get('plans.php');
  } catch {
    return lsGet('study_plans', []);
  }
}

export async function saveStudyPlan(plan) {
  try {
    return await api.post('plans.php', {
      title:         plan.title,
      subjects:      plan.subjects,
      deadline:      plan.deadline || null,
      hours_per_day: plan.hoursPerDay ?? 3,
      goal:          plan.goal ?? '',
      content:       plan.content,
    });
  } catch {
    const list = lsGet('study_plans', []);
    const item = { ...plan, id: Date.now(), createdAt: new Date().toISOString() };
    list.unshift(item);
    lsSet('study_plans', list);
    return item;
  }
}

export async function deleteStudyPlan(id) {
  try {
    await api.delete(`plans.php?id=${id}`);
  } catch {
    const list = lsGet('study_plans', []).filter(p => p.id !== id);
    lsSet('study_plans', list);
  }
}

// ----------------------------------------------------------------
// DASHBOARD STATS (from API)
// ----------------------------------------------------------------
export async function getDashboardStats() {
  try {
    return await api.get('stats.php');
  } catch {
    return null;
  }
}
