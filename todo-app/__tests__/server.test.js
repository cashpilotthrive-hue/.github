/**
 * __tests__/server.test.js
 *
 * Integration tests for the Todo REST API using supertest.
 */

'use strict';

const request = require('supertest');
const app     = require('../server');

/* ── Helper: create a task ────────────────────────────────── */
async function createTask(text = 'Test task') {
  const res = await request(app).post('/api/tasks').send({ text });
  return res.body;
}

/* ── Health check ─────────────────────────────────────────── */
describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

/* ── GET /api/tasks ───────────────────────────────────────── */
describe('GET /api/tasks', () => {
  it('returns an array', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

/* ── POST /api/tasks ──────────────────────────────────────── */
describe('POST /api/tasks', () => {
  it('creates a task with valid text', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ text: 'Buy groceries' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      text: 'Buy groceries',
      completed: false,
    });
    expect(typeof res.body.id).toBe('string');
    expect(typeof res.body.createdAt).toBe('string');
  });

  it('trims whitespace from text', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ text: '  Walk the dog  ' });

    expect(res.status).toBe(201);
    expect(res.body.text).toBe('Walk the dog');
  });

  it('returns 400 when text is missing', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when text is empty string', async () => {
    const res = await request(app).post('/api/tasks').send({ text: '   ' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when text is not a string', async () => {
    const res = await request(app).post('/api/tasks').send({ text: 42 });
    expect(res.status).toBe(400);
  });
});

/* ── PUT /api/tasks/:id ───────────────────────────────────── */
describe('PUT /api/tasks/:id', () => {
  it('marks a task as completed', async () => {
    const task = await createTask('Read a book');
    const res  = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('updates the text of a task', async () => {
    const task = await createTask('Old text');
    const res  = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ text: 'New text' });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe('New text');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/tasks/non-existent-id')
      .send({ completed: true });

    expect(res.status).toBe(404);
  });

  it('returns 400 when completed is not a boolean', async () => {
    const task = await createTask('Task for bool test');
    const res  = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ completed: 'yes' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when text is empty string', async () => {
    const task = await createTask('Task for empty text');
    const res  = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ text: '' });

    expect(res.status).toBe(400);
  });
});

/* ── DELETE /api/tasks/:id ────────────────────────────────── */
describe('DELETE /api/tasks/:id', () => {
  it('deletes an existing task', async () => {
    const task = await createTask('Delete me');
    const res  = await request(app).delete(`/api/tasks/${task.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted');

    // Verify it's gone
    const list = await request(app).get('/api/tasks');
    expect(list.body.find(t => t.id === task.id)).toBeUndefined();
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/tasks/non-existent-id');
    expect(res.status).toBe(404);
  });
});

/* ── DELETE /api/tasks — clear completed ──────────────────── */
describe('DELETE /api/tasks (clear completed)', () => {
  it('removes completed tasks and keeps active ones', async () => {
    const active    = await createTask('Keep me');
    const completed = await createTask('Remove me');

    // Mark one as completed
    await request(app)
      .put(`/api/tasks/${completed.id}`)
      .send({ completed: true });

    const res = await request(app).delete('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const ids = res.body.map(t => t.id);
    expect(ids).toContain(active.id);
    expect(ids).not.toContain(completed.id);
  });
});
