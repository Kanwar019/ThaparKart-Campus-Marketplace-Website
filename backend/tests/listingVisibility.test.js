import assert from "node:assert/strict";
import { test } from "node:test";
import { once } from "node:events";
import express from "express";
import Listing from "../models/Listing.js";
import listingRoutes from "../routes/listing/listingRoutes.js";

test("public listing details hide deleted records but retain other listing states", async (t) => {
  const id = "000000000000000000000001";
  let record;
  t.mock.method(Listing, "findById", (requestedId) => {
    assert.equal(requestedId, id);
    return { populate: async () => record };
  });
  const app = express();
  app.use("/api/listings", listingRoutes);
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await once(server, "listening");
  const url = `http://127.0.0.1:${server.address().port}/api/listings/${id}`;

  record = { _id: id, status: "deleted", title: "Removed item", user: { email: "seller@thapar.edu" } };
  const deletedResponse = await fetch(url);
  assert.equal(deletedResponse.status, 404);
  const deletedBody = await deletedResponse.json();
  assert.deepEqual(deletedBody, { message: "Listing not found" });

  record = null;
  const missingResponse = await fetch(url);
  assert.equal(missingResponse.status, 404);
  assert.deepEqual(await missingResponse.json(), deletedBody);

  for (const status of ["active", "reserved", "sold"]) {
    record = { _id: id, status, title: "Existing item" };
    const response = await fetch(url);
    assert.equal(response.status, 200, `${status} details remain available`);
    assert.deepEqual(await response.json(), record);
  }
});
