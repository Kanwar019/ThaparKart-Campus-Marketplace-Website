import assert from "node:assert/strict";
import { test } from "node:test";
import Listing from "../models/Listing.js";
import { updateListing, deleteListing } from "../controllers/listingController.js";
import { deleteMyListing } from "../controllers/userController.js";

const id = "000000000000000000000001";
const owner = "000000000000000000000002";
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } });

for (const status of ["reserved", "sold", "deleted"]) {
  test(`listing edit cannot reactivate a ${status} item`, async (t) => {
    const listing = new Listing({ _id: id, user: owner, title: "Book", price: 100, status });
    t.mock.method(Listing, "findOne", async () => listing);
    t.mock.method(listing, "save", async () => listing);
    const res = response();
    await updateListing({ params: { id }, user: { _id: owner }, body: { status: "active", price: 50 } }, res);
    assert.equal(res.statusCode, 409);
    assert.equal(listing.status, status);
    assert.equal(listing.price, 100);
  });
}

for (const handler of [deleteListing, deleteMyListing]) {
  test(`${handler.name} cannot delete a reserved item`, async (t) => {
    let deleted = false;
    t.mock.method(Listing, "findOneAndUpdate", async (filter) => {
      assert.equal(filter.user, owner);
      const allowed = filter.status?.$in || [filter.status];
      if (filter.status && !allowed.includes("reserved")) return null;
      deleted = true;
      return { _id: id };
    });
    const res = response();
    await handler({ params: { id }, user: { _id: owner } }, res);
    assert.notEqual(res.statusCode, 200);
    assert.equal(deleted, false);
  });
}

test("a reservation winning the race prevents a stale listing edit", async (t) => {
  const listing = new Listing({ _id: id, user: owner, title: "Book", status: "active" });
  t.mock.method(Listing, "findOne", async () => listing);
  t.mock.method(listing, "save", async () => listing);
  t.mock.method(Listing, "findOneAndUpdate", async (filter) => {
    assert.equal(filter.status, "active");
    assert.equal(filter.user, owner);
    return null; // A buyer reserved it between the read and write.
  });
  const res = response();
  await updateListing({ params: { id }, user: { _id: owner }, body: { title: "Changed" } }, res);
  assert.equal(res.statusCode, 409);
});

test("editing a title preserves a concurrent price change", async (t) => {
  const earlier = new Listing({ _id: id, user: owner, title: "Book", price: 100, status: "active" });
  t.mock.method(Listing, "findOne", async () => earlier);
  t.mock.method(Listing, "findOneAndUpdate", async (_filter, update) => ({
    _id: id, title: "Book", price: 250, status: "active", ...update.$set,
  }));
  const res = response();
  await updateListing({ params: { id }, user: { _id: owner }, body: { title: "New title" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.listing.title, "New title");
  assert.equal(res.body.listing.price, 250);
});
