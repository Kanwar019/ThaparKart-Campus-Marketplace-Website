import assert from "node:assert/strict";
import { test } from "node:test";
import Listing from "../models/Listing.js";
import { createListing, updateListing, getAllListings } from "../controllers/listingController.js";
import { MAX_IMAGE_CHARS, isValidImageString } from "../utils/listingValidation.js";

const owner = "000000000000000000000001";
const id = "000000000000000000000002";
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

for (const handler of [createListing, updateListing]) {
  for (const [label, invalidPayload] of [
    ["non-image data URI (PDF)", { imageUrls: ["data:application/pdf;base64,JVBERi0xLjQK"] }],
    ["non-image text URI (HTML)", { imageUrls: ["data:text/html;base64,PHNjcmlwdD4="] }],
    ["arbitrary malicious string", { imageUrls: ["javascript:alert(1)"] }],
    ["oversized base64 image (> 2MB)", { imageUrls: ["data:image/png;base64," + "A".repeat(MAX_IMAGE_CHARS + 1)] }],
  ]) {
    test(`${handler.name} rejects ${label} with 400`, async (t) => {
      t.mock.method(Listing, "findOne", async () => ({ _id: id, user: owner, status: "active" }));
      let writes = 0;
      t.mock.method(Listing, "create", async (data) => { writes++; return data; });
      t.mock.method(Listing, "findOneAndUpdate", async () => { writes++; return {}; });
      const res = response();
      await handler({ user: { _id: owner }, params: { id }, body: { title: "Item", price: 50, ...invalidPayload } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(writes, 0);
    });
  }
}

for (const [label, validImg] of [
  ["valid PNG data URI", "data:image/png;base64,iVBORw0KGgo="],
  ["valid JPEG data URI", "data:image/jpeg;base64,/9j/4AAQSkZJRg=="],
  ["valid WebP data URI", "data:image/webp;base64,UklGRg=="],
  ["valid SVG data URI", "data:image/svg+xml;base64,PHN2Zz4="],
  ["valid HTTP URL", "http://example.com/uploads/photo.jpg"],
  ["valid HTTPS URL", "https://cdn.example.com/item.png"],
  ["valid relative image path", "/uploads/cycle.jpg"],
]) {
  test(`createListing accepts ${label}`, async (t) => {
    let saved;
    t.mock.method(Listing, "create", async (data) => { saved = data; return data; });
    const res = response();
    await createListing({ user: { _id: owner }, body: { title: "Item", price: 10, imageUrls: [validImg] } }, res);
    assert.equal(res.statusCode, 201);
    assert.deepEqual(saved.imageUrls, [validImg]);
  });
}

test("isValidImageString correctly checks size and prefix", () => {
  assert.equal(isValidImageString("data:image/png;base64,abc"), true);
  assert.equal(isValidImageString("https://example.com/img.jpg"), true);
  assert.equal(isValidImageString("/uploads/img.png"), true);
  assert.equal(isValidImageString("data:application/pdf;base64,abc"), false);
  assert.equal(isValidImageString("not-an-image"), false);
  assert.equal(isValidImageString("data:image/png;base64," + "A".repeat(MAX_IMAGE_CHARS + 10)), false);
  assert.equal(isValidImageString(""), false);
  assert.equal(isValidImageString(null), false);
});

test("getAllListings respects limit query param without page", async (t) => {
  let appliedLimit = null;
  const mockQuery = {
    sort() { return this; },
    populate() { return this; },
    limit(n) { appliedLimit = n; return this; },
    then(resolve) { resolve([{ _id: "1" }, { _id: "2" }]); },
  };
  t.mock.method(Listing, "find", () => mockQuery);
  const res = response();
  await getAllListings({ query: { limit: "6" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(appliedLimit, 6);
  assert.equal(res.body.length, 2);
});

test("getAllListings clamps excessive limit query param", async (t) => {
  let appliedLimit = null;
  const mockQuery = {
    sort() { return this; },
    populate() { return this; },
    limit(n) { appliedLimit = n; return this; },
    then(resolve) { resolve([]); },
  };
  t.mock.method(Listing, "find", () => mockQuery);
  const res = response();
  await getAllListings({ query: { limit: "999" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(appliedLimit, 100);
});

test("getAllListings supports paginated query with limit and page", async (t) => {
  let appliedLimit = null;
  let appliedSkip = null;
  const mockQuery = {
    sort() { return this; },
    skip(n) { appliedSkip = n; return this; },
    limit(n) { appliedLimit = n; return this; },
    populate() { return Promise.resolve([{ _id: "1" }]); },
  };
  t.mock.method(Listing, "find", () => mockQuery);
  t.mock.method(Listing, "countDocuments", async () => 15);
  const res = response();
  await getAllListings({ query: { page: "2", limit: "5" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(appliedSkip, 5);
  assert.equal(appliedLimit, 5);
  assert.equal(res.body.page, 2);
  assert.equal(res.body.totalPages, 3);
  assert.equal(res.body.total, 15);
});
