import assert from "node:assert/strict";
import { test } from "node:test";
import { env } from "node:process";
import nodemailer from "nodemailer";

function configure(t, port) {
  const values = { SMTP_HOST: "smtp.example.test", SMTP_PORT: port, SMTP_USER: "fixture", SMTP_PASS: "fixture" };
  for (const [key, value] of Object.entries(values)) {
    const previous = env[key];
    env[key] = value;
    t.after(() => {
      if (previous === undefined) delete env[key];
      else env[key] = previous;
    });
  }
  t.mock.method(console, "log", () => {});
  t.mock.method(console, "error", () => {});
}

for (const port of ["587", "465"]) {
  test(`SMTP port ${port} requires encrypted delivery and certificate verification`, async (t) => {
    configure(t, port);
    let options;
    const sent = [];
    t.mock.method(nodemailer, "createTransport", (config) => {
      options = config;
      return {
        async verify() {},
        async sendMail(message) { sent.push(message); return { messageId: "fixture" }; },
      };
    });
    const { sendMail } = await import(`../utils/mailer.js?port=${port}`);
    await sendMail({ to: "recipient@example.test", subject: "Test", text: "Fixture" });
    assert.notEqual(options.tls?.rejectUnauthorized, false);
    assert.equal(options.secure, port === "465");
    if (port === "587") assert.equal(options.requireTLS, true);
    assert.equal(sent.length, 1);
  });
}

test("failed SMTP certificate verification prevents sending", async (t) => {
  configure(t, "587");
  let sends = 0;
  t.mock.method(nodemailer, "createTransport", () => ({
    async verify() { throw new Error("certificate has expired"); },
    async sendMail() { sends += 1; },
  }));
  const { sendMail } = await import("../utils/mailer.js?failed-verification");
  await assert.rejects(sendMail({ to: "recipient@example.test", subject: "Test", text: "Fixture" }));
  assert.equal(sends, 0);
});
