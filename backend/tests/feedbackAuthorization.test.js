import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import { env } from "node:process";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import feedbackRoutes from "../routes/feedbackRoutes.js";

const secret = "feedback-tests-only-secret";
const feedback = {
  firstName: "Test", lastName: "Student",
  email: "student@thapar.edu", message: "Private support request",
};

async function setup(t, user = null) {
  const previousSecret = env.JWT_SECRET;
  env.JWT_SECRET = secret;
  t.after(() => {
    if (previousSecret === undefined) delete env.JWT_SECRET;
    else env.JWT_SECRET = previousSecret;
  });
  t.mock.method(User, "findById", () => ({ select: async () => user }));
  t.mock.method(console, "error", () => {});
  const reads = t.mock.method(Feedback, "find", () => ({ sort: async () => [feedback] }));
  const creates = t.mock.method(Feedback, "create", async (body) => body);
  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/api/feedback", feedbackRoutes);
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await once(server, "listening");
  return { url: `http://127.0.0.1:${server.address().port}/api/feedback`, reads, creates };
}

const session = `token=${jwt.sign({ userId: "000000000000000000000001" }, secret, { expiresIn: "1h" })}`;

for (const [name, cookie, user, status] of [
  ["anonymous visitor", null, null, 401],
  ["invalid session", "token=invalid", null, 401],
  ["deleted user", session, null, 401],
  ["ordinary user", session, { role: "user", email: "student@thapar.edu" }, 403],
]) {
  test(`${name} cannot read feedback`, { timeout: 5000 }, async (t) => {
    const fixture = await setup(t, user);
    const response = await fetch(fixture.url, { headers: cookie ? { Cookie: cookie } : {} });
    assert.equal(response.status, status);
    const body = await response.json();
    assert.equal(Array.isArray(body), false);
    assert.equal(JSON.stringify(body).includes(feedback.email), false);
    assert.equal(fixture.reads.mock.callCount(), 0, "Unauthorized requests must not query feedback");
  });
}

for (const [name, user] of [
  ["role admin", { role: "admin", email: "admin@thapar.edu" }],
  ["existing allowlisted admin", { role: "user", email: "ksingh2_be23@thapar.edu" }],
]) {
  test(`${name} can read feedback`, { timeout: 5000 }, async (t) => {
    const fixture = await setup(t, user);
    const response = await fetch(fixture.url, { headers: { Cookie: session } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [feedback]);
  });
}

test("anonymous visitors can still submit feedback", { timeout: 5000 }, async (t) => {
  const fixture = await setup(t);
  const response = await fetch(fixture.url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedback),
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { success: true, feedback });
  assert.deepEqual(fixture.creates.mock.calls[0].arguments[0], feedback);
});
