import assert from "node:assert/strict";
import { test } from "node:test";
import { saveAuthToken, getAuthHeaders, clearTemporaryAuthToken } from "../config/api.js";
import { logout } from "./logout.js";

test("blocked browser storage retains authentication until successful logout", async (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem() { throw new Error("Storage blocked"); },
    setItem() { throw new Error("Storage blocked"); },
    removeItem() { throw new Error("Storage blocked"); },
  } });
  t.after(() => { clearTemporaryAuthToken(); if (previous) Object.defineProperty(globalThis, "localStorage", previous); else delete globalThis.localStorage; });
  saveAuthToken("test-session");
  assert.deepEqual(getAuthHeaders(), { Authorization: "Bearer test-session" });
  t.mock.method(globalThis, "fetch", async (_url, options) => {
    assert.equal(options.headers.Authorization, "Bearer test-session");
    return { ok: true };
  });
  await logout("https://example.test", () => {});
  assert.deepEqual(getAuthHeaders(), {});
});
