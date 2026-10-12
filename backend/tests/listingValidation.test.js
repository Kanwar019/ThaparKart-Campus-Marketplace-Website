import assert from "node:assert/strict";
import { test } from "node:test";
import Listing from "../models/Listing.js";
import { createListing, updateListing } from "../controllers/listingController.js";

const owner = "000000000000000000000001";
const id = "000000000000000000000002";
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } });

for (const handler of [createListing, updateListing]) {
  for (const [label, invalid] of [
    ["negative price", { price: -1 }], ["excessive price", { price: 10000001 }],
    ["infinite price", { price: Infinity }], ["non-numeric price", { price: "abc" }],
    ["blank price", { price: "  " }], ["null price", { price: null }],
    ["boolean price", { price: true }], ["array price", { price: [20] }],
    ["blank title", { title: "  " }], ["object title", { title: {} }],
    ["long title", { title: "a".repeat(151) }],
    ["long description", { description: "a".repeat(3001) }],
    ["object description", { description: {} }], ["object category", { category: {} }],
    ["array condition", { condition: [] }], ["object images", { imageUrls: [{}] }],
    ["too many images", { imageUrls: Array(6).fill("https://example.test/image.png") }],
  ]) {
    test(`${handler.name} rejects ${label} without writing`, async (t) => {
      t.mock.method(Listing, "findOne", async () => ({ _id: id, user: owner, status: "active" }));
      let writes = 0;
      t.mock.method(Listing, "create", async data => { writes++; return data; });
      t.mock.method(Listing, "findOneAndUpdate", async () => { writes++; return {}; });
      const res = response();
      await handler({ user: { _id: owner }, params: { id }, body: { title: "Book", price: 100, ...invalid } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(writes, 0);
    });
  }
}

test("create normalizes valid fields and allows a free item", async (t) => {
  let saved;
  t.mock.method(Listing, "create", async data => (saved = data));
  const res = response();
  await createListing({ user: { _id: owner }, body: { title: " Book ", price: "0", description: " Good ", imageUrls: "data:image/png;base64,YQ==" } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(saved.title, "Book");
  assert.equal(saved.price, 0);
  assert.equal(saved.description, "Good");
  assert.deepEqual(saved.imageUrls, ["data:image/png;base64,YQ=="]);
});

test("partial updates normalize only supplied fields", async (t) => {
  t.mock.method(Listing, "findOne", async () => ({ _id: id, user: owner, status: "active" }));
  let update;
  t.mock.method(Listing, "findOneAndUpdate", async (_filter, changes) => { update = changes.$set; return changes.$set; });
  const res = response();
  await updateListing({ user: { _id: owner }, params: { id }, body: { price: "125.50", category: " Books " } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(update, { price: 125.5, category: "Books" });
});
