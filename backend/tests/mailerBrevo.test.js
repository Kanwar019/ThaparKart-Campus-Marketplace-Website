import assert from "node:assert/strict";
import { test } from "node:test";
import { env } from "node:process";
import nodemailer from "nodemailer";
import { sendMail } from "../utils/mailer.js";

const message = { to: "student@thapar.edu", subject: "Your OTP", text: "123456", html: "<p>123456</p>" };

function configure(t, overrides = {}) {
  const values = { MAIL_PROVIDER: "brevo", BREVO_API_KEY: "test-secret", BREVO_SENDER_EMAIL: "sender@example.test", BREVO_SENDER_NAME: "ThaparKart", ...overrides };
  for (const [key, value] of Object.entries(values)) {
    const previous = env[key];
    if (value === undefined) delete env[key]; else env[key] = value;
    t.after(() => { if (previous === undefined) delete env[key]; else env[key] = previous; });
  }
  t.mock.method(nodemailer, "createTransport", () => { throw new Error("SMTP blocked"); });
}

test("Brevo sends OTP over HTTPS without opening SMTP", async (t) => {
  configure(t);
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify({ messageId: "accepted-123" }), { status: 201 });
  });
  assert.deepEqual(await sendMail(message), { messageId: "accepted-123" });
  assert.equal(requests.length, 1);
  const { url, options } = requests[0];
  assert.equal(url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(options.method, "POST");
  assert.equal(options.headers["api-key"], "test-secret");
  assert.ok(options.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(options.body), {
    sender: { email: "sender@example.test", name: "ThaparKart" },
    to: [{ email: message.to }], subject: message.subject, htmlContent: message.html,
  });
});

for (const status of [400, 401, 403, 429, 500]) {
  test(`Brevo HTTP ${status} is a failure without leaking provider content`, async (t) => {
    configure(t);
    t.mock.method(globalThis, "fetch", async () => new Response("test-secret 123456", { status }));
    await assert.rejects(sendMail(message), (error) => {
      assert.match(error.message, new RegExp(`Brevo.*${status}`));
      assert.doesNotMatch(error.message, /test-secret|123456/);
      return true;
    });
  });
}

test("missing Brevo credentials fail before a network request", async (t) => {
  configure(t, { BREVO_API_KEY: undefined });
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Unexpected request"); });
  await assert.rejects(sendMail(message), /BREVO_API_KEY/);
  assert.equal(fetch.mock.callCount(), 0);
});

test("Brevo timeout fails without SMTP fallback or automatic retry", async (t) => {
  configure(t);
  const fetch = t.mock.method(globalThis, "fetch", async () => { throw new DOMException("timeout", "TimeoutError"); });
  await assert.rejects(sendMail(message), /Brevo.*timed out/);
  assert.equal(fetch.mock.callCount(), 1);
});

test("Brevo must return a message id before reporting success", async (t) => {
  configure(t);
  t.mock.method(globalThis, "fetch", async () => new Response("{}", { status: 201 }));
  await assert.rejects(sendMail(message), /Brevo.*message ID/);
});

test("unknown mail provider fails closed", async (t) => {
  configure(t, { MAIL_PROVIDER: "bervo" });
  await assert.rejects(sendMail(message), /MAIL_PROVIDER/);
});
