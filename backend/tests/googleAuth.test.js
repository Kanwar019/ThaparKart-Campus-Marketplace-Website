import { test } from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { googleLogin } from '../controllers/googleAuthController.js';
import { loginUser } from '../controllers/authController.js';
import { changePassword } from '../controllers/userController.js';

const identity = { sub: 'google-user-123', email: 'student@thapar.edu', email_verified: true, hd: 'thapar.edu', name: 'Student' };
function setup(t, payload = identity) {
  for (const [key, value] of Object.entries({ GOOGLE_CLIENT_ID: 'test.apps.googleusercontent.com', JWT_SECRET: 'test-only-long-google-session-secret' })) {
    const old = process.env[key]; process.env[key] = value;
    t.after(() => { if (old === undefined) delete process.env[key]; else process.env[key] = old; });
  }
  const verify = t.mock.method(OAuth2Client.prototype, 'verifyIdToken', async () => ({ getPayload: () => payload }));
  const writes = t.mock.method(User, 'findOneAndUpdate', async () => ({ _id: 'existing-id', email: identity.email, name: 'Existing name', role: 'user' }));
  const req = { body: { credential: 'signed-google-token' }, is: (type) => type === 'application/json' };
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, cookie(...args) { this.cookieArgs = args; } };
  return { req, res, verify, writes };
}

test('verified college account preserves existing user ID and uses our session format', async t => {
  const { req, res, verify, writes } = setup(t);
  await googleLogin(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.user.id, 'existing-id');
  assert.equal(jwt.verify(res.body.token, process.env.JWT_SECRET).userId, 'existing-id');
  assert.deepEqual(verify.mock.calls[0].arguments[0], { idToken: 'signed-google-token', audience: process.env.GOOGLE_CLIENT_ID });
  const [filter, update, options] = writes.mock.calls[0].arguments;
  assert.equal(filter.email, identity.email);
  assert.deepEqual(filter.$or, [{ googleSub: identity.sub }, { googleSub: { $exists: false } }]);
  assert.equal(update.$set.googleSub, identity.sub);
  assert.equal(update.$setOnInsert.role, 'user');
  assert.equal(update.$setOnInsert.passwordHash, undefined);
  assert.equal(options.upsert, true);
  assert.equal(res.cookieArgs[2].httpOnly, true);
});

for (const [description, payload] of [
  ['personal Gmail', { ...identity, email: 'student@gmail.com', hd: undefined }],
  ['unverified email', { ...identity, email_verified: false }],
  ['missing Workspace domain', { ...identity, hd: undefined }],
  ['wrong Workspace', { ...identity, hd: 'other.edu' }],
  ['suffix spoof', { ...identity, email: 'student@thapar.edu.attacker.com' }],
  ['missing subject', { ...identity, sub: undefined }],
]) test(`rejects ${description} without database writes`, async t => {
  const { req, res, writes } = setup(t, payload);
  await googleLogin(req, res);
  assert.equal(res.statusCode, 403);
  assert.equal(writes.mock.callCount(), 0);
  assert.equal(res.cookieArgs, undefined);
});

test('invalid signature, audience or expiry rejected by verifier yields 401', async t => {
  const { req, res, verify, writes } = setup(t);
  verify.mock.mockImplementation(async () => { throw new Error('invalid token'); });
  await googleLogin(req, res);
  assert.equal(res.statusCode, 401);
  assert.equal(writes.mock.callCount(), 0);
});

test('missing Google configuration fails closed', async t => {
  const { req, res, verify } = setup(t);
  delete process.env.GOOGLE_CLIENT_ID;
  await googleLogin(req, res);
  assert.equal(res.statusCode, 503);
  assert.equal(verify.mock.callCount(), 0);
});

test('cross-site form submissions cannot establish a Google session', async t => {
  const { req, res, verify } = setup(t);
  req.is = () => false;
  await googleLogin(req, res);
  assert.equal(res.statusCode, 415);
  assert.equal(verify.mock.callCount(), 0);
});

test('conflicting linked identity or concurrent insert does not issue a session', async t => {
  const { req, res, writes } = setup(t);
  writes.mock.mockImplementation(async () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); });
  await googleLogin(req, res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.cookieArgs, undefined);
});

test('Google-only user passes schema validation without a password; ordinary user still requires one', () => {
  assert.equal(new User({ name: 'Student', email: identity.email, googleSub: identity.sub }).validateSync(), undefined);
  assert.ok(new User({ name: 'Student', email: identity.email }).validateSync()?.errors.passwordHash);
});

test('Google-only accounts receive a clear response from password change', async t => {
  const { res } = setup(t);
  t.mock.method(User, 'findById', async () => ({ _id: 'existing-id' }));
  await changePassword({ user: { _id: 'existing-id' }, body: { oldPassword: 'old', newPassword: 'new-password' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Google/);
});

test('Google-only accounts cannot log in using an arbitrary password', async t => {
  const { res } = setup(t);
  t.mock.method(User, 'findOne', async () => ({ _id: 'existing-id' }));
  await loginUser({ body: { email: identity.email, password: 'arbitrary' } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.cookieArgs, undefined);
});
