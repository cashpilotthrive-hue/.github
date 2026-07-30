/**
 * server.js — Express REST API for the To-Do List application
 *
 * Endpoints:
 *   GET    /health          — health check
 *   GET    /api/tasks       — list all tasks
 *   POST   /api/tasks       — create a task  { text }
 *   PUT    /api/tasks/:id   — update a task  { text?, completed? }
 *   DELETE /api/tasks/:id   — delete a task
 *   DELETE /api/tasks       — clear all completed tasks
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ───────────────────────────────────────────── */
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

/* ── In-memory task store ─────────────────────────────────── */
let tasks = [];

/* ── Health check ─────────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ── GET /api/tasks — list all tasks ──────────────────────── */
app.get('/api/tasks', (_req, res) => {
  res.json(tasks);
});

/* ── POST /api/tasks — create a task ─────────────────────── */
app.post('/api/tasks', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'text is required and must be a non-empty string' });
  }

  const task = {
    id:        uuidv4(),
    text:      text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json(task);
});

/* ── PUT /api/tasks/:id — update a task ───────────────────── */
app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { text, completed } = req.body;

  if (text !== undefined) {
    if (typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'text must be a non-empty string' });
    }
    task.text = text.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }
    task.completed = completed;
  }

  res.json(task);
});

/* ── DELETE /api/tasks/:id — delete a single task ─────────── */
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.json({ message: 'Task deleted' });
});

/* ── DELETE /api/tasks — clear all completed tasks ────────── */
app.delete('/api/tasks', (_req, res) => {
  tasks = tasks.filter(t => !t.completed);
  res.json(tasks);
});

/* ── Serve frontend in production ─────────────────────────── */
if (process.env.NODE_ENV === 'production') {
  // Rate-limit static file requests to mitigate enumeration/DoS
  const staticLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(staticLimiter);
  app.use(express.static(path.join(__dirname)));
  // Catch-all: serve index.html for any non-API route
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

/* ── Start server (only when not imported by tests) ────────── */
/* istanbul ignore next */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀  Todo API listening on port ${PORT}`);
  });
}

module.exports = app; // export for testing
