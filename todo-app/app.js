/**
 * app.js — To-Do List frontend logic
 *
 * Works in two modes:
 *  1. Standalone (file:// or static open) — uses localStorage only.
 *  2. Served via Express — syncs with the REST API and falls back to
 *     localStorage if the API is unreachable.
 */

/* ── Constants ────────────────────────────────────────────── */
const STORAGE_KEY = 'todo-app-tasks';
// Detect if we're served by a real server (not opened as file://)
const USE_API = window.location.hostname !== '' && window.location.protocol !== 'file:';
const API_BASE = '/api/tasks';

/* ── State ────────────────────────────────────────────────── */
let tasks = [];
let currentFilter = 'all';

/* ── DOM refs ─────────────────────────────────────────────── */
const taskInput        = document.getElementById('task-input');
const addBtn           = document.getElementById('add-btn');
const taskList         = document.getElementById('task-list');
const emptyState       = document.getElementById('empty-state');
const taskCounter      = document.getElementById('task-counter');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterBtns       = document.querySelectorAll('.filter-btn');

/* ── Persistence helpers ──────────────────────────────────── */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/* ── API helpers ──────────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

/* ── Initialise ───────────────────────────────────────────── */
async function init() {
  if (USE_API) {
    try {
      tasks = await apiFetch(API_BASE);
      saveTasks(); // keep localStorage in sync
    } catch {
      // Fall back to localStorage when API is unavailable
      tasks = loadFromStorage();
    }
  } else {
    tasks = loadFromStorage();
  }
  render();
}

/* ── Task creation ────────────────────────────────────────── */
async function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  if (USE_API) {
    try {
      const created = await apiFetch(API_BASE, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      tasks.push(created);
    } catch {
      tasks.push(makeLocalTask(text));
    }
  } else {
    tasks.push(makeLocalTask(text));
  }

  taskInput.value = '';
  saveTasks();
  render();
}

function makeLocalTask(text) {
  return {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

/* ── Toggle complete ──────────────────────────────────────── */
async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const updated = { ...task, completed: !task.completed };

  if (USE_API) {
    try {
      const fromServer = await apiFetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: updated.completed }),
      });
      Object.assign(task, fromServer);
    } catch {
      task.completed = updated.completed;
    }
  } else {
    task.completed = updated.completed;
  }

  saveTasks();
  render();
}

/* ── Delete task ──────────────────────────────────────────── */
async function deleteTask(id) {
  if (USE_API) {
    try {
      await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    } catch { /* proceed with local delete */ }
  }
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

/* ── Clear completed ──────────────────────────────────────── */
async function clearCompleted() {
  if (USE_API) {
    try {
      await apiFetch(API_BASE, { method: 'DELETE' });
      tasks = await apiFetch(API_BASE);
    } catch {
      tasks = tasks.filter(t => !t.completed);
    }
  } else {
    tasks = tasks.filter(t => !t.completed);
  }
  saveTasks();
  render();
}

/* ── Render ───────────────────────────────────────────────── */
function getFilteredTasks() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function render() {
  const filtered = getFilteredTasks();

  // Empty state
  if (filtered.length === 0) {
    taskList.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    taskList.innerHTML = filtered.map(taskHTML).join('');
  }

  // Counter (always based on all tasks)
  const activeCount = tasks.filter(t => !t.completed).length;
  taskCounter.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
}

function taskHTML(task) {
  const escapedText = escapeHtml(task.text);
  return `
    <li class="task-item${task.completed ? ' completed' : ''}" data-id="${task.id}">
      <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? 'checked' : ''}
        aria-label="Toggle task: ${escapedText}"
      />
      <span class="task-text">${escapedText}</span>
      <button class="delete-btn" aria-label="Delete task: ${escapedText}">✕</button>
    </li>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Event delegation ─────────────────────────────────────── */
taskList.addEventListener('click', e => {
  const li = e.target.closest('.task-item');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains('task-checkbox')) {
    toggleTask(id);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteTask(id);
  }
});

/* ── Filter buttons ───────────────────────────────────────── */
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

/* ── Add task events ──────────────────────────────────────── */
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

clearCompletedBtn.addEventListener('click', clearCompleted);

/* ── Boot ─────────────────────────────────────────────────── */
init();
