import assert from "node:assert/strict";
import { test } from "node:test";
import { env } from "node:process";
import { once } from "node:events";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { loginUser } from "../controllers/authController.js";
import { authRequired } from "../middleware/authMiddleware.js";
import authRoutes from "../routes/auth/authRoutes.js";
import { otpVerifyLimiter } from "../middleware/rateLimitMiddleware.js";

const user = {
  _id: "000000000000000000000001", name: "Test User",
  email: "test@thapar.edu", role: "user",
  passwordHash: await bcrypt.hash("test-password", 4),
};
const secret = "auth-hardening-tests-only-secret";

function configure(t, value) {
  const previous = env.JWT_SECRET;
  if (value === undefined) delete env.JWT_SECRET;
  else env.JWT_SECRET = value;
  t.after(() => {
    if (previous === undefined) delete env.JWT_SECRET;
    else env.JWT_SECRET = previous;
  });
  t.mock.method(console, "error", () => {});
  t.mock.method(User, "findOne", async () => user);
  t.mock.method(User, "findById", () => ({ select: async () => user }));
}

function response() {
  return {
    statusCode: 200, cookies: [],
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    cookie(...args) { this.cookies.push(args); return this; },
  };
}

for (const [name, value] of [
  ["missing", undefined], ["empty", ""], ["whitespace", "   "],
  ["known default", "dev-secret-change-this"],
]) {
  test(`login cannot issue a token with a ${name} JWT secret`, async (t) => {
    configure(t, value);
    const res = response();
    await loginUser({ body: { email: user.email, password: "test-password" } }, res);
    assert.equal(res.statusCode, 500);
    assert.equal(res.cookies.length, 0);
    assert.equal(res.body.token, undefined);
  });

  test(`authentication fails closed with a ${name} JWT secret`, async (t) => {
    configure(t, value);
    const token = jwt.sign({ userId: user._id }, value || "dev-secret-change-this");
    const res = response();
    let allowed = false;
    await authRequired({ cookies: { token } }, res, () => { allowed = true; });
    assert.equal(allowed, false);
    assert.equal(res.statusCode, 401);
  });
}

test("configured login token authenticates protected requests", async (t) => {
  configure(t, secret);
  const res = response();
  await loginUser({ body: { email: user.email, password: "test-password" } }, res);
  assert.equal(res.statusCode, 200);
  const [name, token, options] = res.cookies[0];
  assert.equal(name, "token");
  assert.equal(options.httpOnly, true);
  assert.equal(jwt.verify(token, secret).userId, user._id);
  let allowed = false;
  await authRequired({ cookies: { token } }, response(), () => { allowed = true; });
  assert.equal(allowed, true);
});

test("registration and OTP verification share an attempt budget", { timeout: 5000 }, async (t) => {
  const lookup = t.mock.method(Otp, "findOne", async () => null);
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  const server = app.listen(0, "127.0.0.1");
  t.after(async () => {
    otpVerifyLimiter.resetKey("127.0.0.1");
    await new Promise((resolve) => server.close(resolve));
  });
  await once(server, "listening");
  const url = `http://127.0.0.1:${server.address().port}/api/auth`;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const result = await fetch(`${url}/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", email: user.email, password: "test-password", otp: "123456" }),
    });
    assert.equal(result.status, 400);
    await result.json();
  }
  for (const path of ["register", "verify-otp"]) {
    const result = await fetch(`${url}/${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", email: user.email, password: "test-password", otp: "123456" }),
    });
    assert.equal(result.status, 429);
    await result.json();
  }
  assert.equal(lookup.mock.callCount(), 10, "Blocked attempts must not check the OTP database");
});
