import assert from "node:assert/strict";
import { test } from "node:test";
import { listingFormError, readListingImages } from "./listingForm.js";

const draft = { title: "Book", price: "100", description: "Notes", category: "Books", condition: "Good" };
test("listing price requires an explicit value, including zero for free items", () => {
  for (const price of ["", " ", "NaN", "Infinity", "-1", "10000001"]) {
    assert.ok(listingFormError({ ...draft, price }), price);
  }
  for (const price of ["0", "10.50", "10000000"]) assert.equal(listingFormError({ ...draft, price }), "");
});
test("listing text limits reject blank titles and overlong drafts", () => {
  assert.ok(listingFormError({ ...draft, title: " " }));
  assert.ok(listingFormError({ ...draft, title: "x".repeat(151) }));
  assert.ok(listingFormError({ ...draft, description: "x".repeat(3001) }));
});
const png = { name: "photo.png", type: "image/png", size: 100 };
test("image batches enforce the total count, supported formats and size before reading", async () => {
  const neverRead = () => assert.fail("Invalid batches must not be read");
  await assert.rejects(readListingImages([png, png], 4, neverRead), /5 images/);
  await assert.rejects(readListingImages([{ ...png, type: "image/heic" }], 0, neverRead), /not supported/);
  await assert.rejects(readListingImages([{ ...png, size: 2097153 }], 0, neverRead), /2MB/);
});
test("image results retain selection order and read failures are reported", async () => {
  assert.deepEqual(await readListingImages([png, { ...png, name: "two.png" }], 3, async f => f.name), ["photo.png", "two.png"]);
  await assert.rejects(readListingImages([png], 0, async () => { throw new Error("Read failed"); }), /Read failed/);
});
