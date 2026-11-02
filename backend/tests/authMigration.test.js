import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import authRoutes from '../routes/auth/authRoutes.js';
import User from '../models/User.js';
import { getProfile } from '../controllers/userController.js';

test('retired email auth endpoints return Google guidance without account writes', async t => {
  const write = t.mock.method(User, 'create', () => { throw new Error('Unexpected account write'); });
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, 'listening');
  for (const path of ['register', 'send-otp', 'verify-otp', 'reset-password', 'forgot-password']) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    assert.equal(response.status, 410, path);
    assert.match((await response.json()).message, /Google/);
  }
  assert.equal(write.mock.callCount(), 0);
});

for (const hasPassword of [true, false]) test(`profile exposes password capability ${hasPassword} without credentials`, async t => {
  const lookup = t.mock.method(User, 'exists', async () => hasPassword ? { _id: 'user-id' } : null);
  const res = { json(body) { this.body = body; return this; } };
  await getProfile({ user: { _id: 'user-id', name: 'Student', email: 'student@thapar.edu', role: 'user' } }, res);
  assert.equal(res.body.hasPassword, hasPassword);
  assert.equal(res.body.passwordHash, undefined);
  assert.equal(res.body.googleSub, undefined);
  assert.equal(lookup.mock.calls[0].arguments[0]._id, 'user-id');
});
