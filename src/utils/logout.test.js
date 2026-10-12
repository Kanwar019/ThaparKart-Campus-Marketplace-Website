import assert from "node:assert/strict";
import { test } from "node:test";
import { logout } from "./logout.js";

function setup(t, request) {
  const events = [];
  t.mock.method(globalThis, "fetch", request);
  const storage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const alert = Object.getOwnPropertyDescriptor(globalThis, "alert");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true, value: { removeItem(key) { events.push(["remove", key]); } },
  });
  Object.defineProperty(globalThis, "alert", {
    configurable: true, value: (message) => events.push(["alert", message]),
  });
  t.after(() => {
    if (storage) Object.defineProperty(globalThis, "localStorage", storage);
    else delete globalThis.localStorage;
    if (alert) Object.defineProperty(globalThis, "alert", alert);
    else delete globalThis.alert;
  });
  return { events, navigate: (...args) => events.push(["navigate", ...args]) };
}

test("logout waits for the credentialed POST before clearing admin state and redirecting", async (t) => {
  let finish;
  const { events, navigate } = setup(t, async (url, options) => {
    assert.equal(url, "https://api.example.test/api/auth/logout");
    assert.equal(options.method, "POST");
    assert.equal(options.credentials, "include");
    return new Promise((resolve) => { finish = resolve; });
  });
  const pending = logout("https://api.example.test", navigate);
  assert.deepEqual(events, []);
  assert.equal(typeof finish, "function");
  finish({ ok: true });
  await pending;
  assert.deepEqual(events, [
    ["remove", "isAdmin"],
    ["remove", "authToken"],
    ["remove", "userEmail"],
    ["navigate", "/login", { replace: true }],
  ]);
});

for (const [name, request] of [
  ["server error", async () => ({ ok: false, status: 500 })],
  ["network error", async () => { throw new Error("Offline"); }],
]) {
  test(`logout reports ${name} without redirecting or clearing state`, async (t) => {
    const { events, navigate } = setup(t, request);
    await logout("https://api.example.test", navigate);
    assert.equal(events.length, 1);
    assert.equal(events[0][0], "alert");
    assert.match(events[0][1], /try again/i);
  });
}

test("blocked local storage does not prevent redirect after server logout", async (t) => {
  const { events, navigate } = setup(t, async () => ({ ok: true }));
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true, get() { throw new Error("Storage blocked"); },
  });
  await logout("https://api.example.test", navigate);
  assert.deepEqual(events, [["navigate", "/login", { replace: true }]]);
});
