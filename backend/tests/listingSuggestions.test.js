import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import Listing from "../models/Listing.js";
import routes from "../routes/listing/listingRoutes.js";

test("suggestions route is public, bounded, active-only and treats punctuation literally", async t => {
  let calls = 0;
  t.mock.method(Listing, "find", filter => {
    calls++;
    assert.equal(filter.status, "active");
    const regex = new RegExp(filter.$or[0].title.$regex, "i");
    assert.ok(regex.test("C++ textbook"));
    assert.equal(regex.test("Calculus"), false);
    return {
      select(fields) { assert.equal(fields, "title category price"); return this; },
      sort() { return this; },
      limit(count) { assert.equal(count, 5); return this; },
      lean: async () => [{ _id: "book", title: "C++ textbook", price: 150 }],
    };
  });
  const app = express(); app.use("/api/listings", routes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/listings/suggestions`;
  for (const query of ["", "a"]) {
    const response = await fetch(`${url}?q=${query}`);
    assert.equal(response.status, 200); assert.deepEqual(await response.json(), []);
  }
  assert.equal(calls, 0);
  const tooLong = await fetch(`${url}?q=${"a".repeat(101)}`);
  assert.equal(tooLong.status, 400); assert.equal(calls, 0);
  const response = await fetch(`${url}?q=C%2B%2B`);
  assert.equal(response.status, 200);
  assert.equal((await response.json())[0].title, "C++ textbook");
  assert.equal(calls, 1);
});
