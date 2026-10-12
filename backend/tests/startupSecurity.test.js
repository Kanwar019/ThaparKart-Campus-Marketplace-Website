import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { env, execPath } from "node:process";

const fixtureUri = "mongodb://fixture:private-test-password@localhost/fixture";

function start(secret) {
  // Prevent all database and listening side effects while exercising the real
  // server entry point in an isolated process, with fake configuration only.
  return spawnSync(execPath, ["--input-type=module", "-e", `
    import mongoose from "mongoose";
    import http from "node:http";
    mongoose.connect = async () => { console.log("TEST_DATABASE_CONNECT"); };
    http.Server.prototype.listen = function () { console.log("TEST_LISTEN"); return this; };
    await import("./server.js");
  `], {
    cwd: new URL("../", import.meta.url),
    env: { ...env, JWT_SECRET: secret, MONGO_URI: fixtureUri },
    encoding: "utf8", timeout: 5000,
  });
}

for (const secret of ["", "dev-secret-change-this"]) {
  test(`startup rejects ${secret ? "known-default" : "empty"} JWT configuration before connecting`, () => {
    const result = start(secret);
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /JWT_SECRET/);
    assert.equal(result.stdout.includes("TEST_DATABASE_CONNECT"), false);
    assert.equal(result.stdout.includes("TEST_LISTEN"), false);
  });
}

test("configured startup does not print database credentials", () => {
  const result = start("startup-tests-only-secret");
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /TEST_DATABASE_CONNECT/);
  assert.match(result.stdout, /TEST_LISTEN/);
  assert.equal(`${result.stdout}${result.stderr}`.includes(fixtureUri), false);
  assert.equal(`${result.stdout}${result.stderr}`.includes("private-test-password"), false);
});
