import assert from "node:assert/strict";
import { test } from "node:test";
import User from "../models/User.js";
import { getProfile } from "../controllers/userController.js";

test("profile includes the authenticated user ID without exposing credentials", async (t) => {
  t.mock.method(User, "exists", async () => ({ _id: "fixture" }));
  const user = new User({
    _id: "000000000000000000000001", name: "Test", email: "test@thapar.edu",
    passwordHash: "private", role: "user",
  });
  let body;
  await getProfile({ user }, { json(value) { body = value; } });
  assert.equal(body._id, "000000000000000000000001");
  assert.equal(body.id, "000000000000000000000001");
  assert.equal(body.name, "Test");
  assert.equal(body.email, "test@thapar.edu");
  assert.equal(body.isAdmin, false);
  assert.equal(body.passwordHash, undefined);
});
