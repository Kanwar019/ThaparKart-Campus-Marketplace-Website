import assert from "node:assert/strict";
import { test } from "node:test";

const search = await import("./listingSearch.js").catch(error => {
  if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
  return {};
});

test("search navigation preserves route mode and safely encodes user text", () => {
  assert.equal(typeof search.listingSearchUrl, "function");
  const url = new URL(search.listingSearchUrl(true, { search: " C++ & notes? ", category: "Books & Notes" }), "https://example.test");
  assert.equal(url.pathname, "/listings-login");
  assert.equal(url.searchParams.get("search"), "C++ & notes?");
  assert.equal(url.searchParams.get("category"), "Books & Notes");
  assert.equal(search.listingSearchUrl(false, { search: "  " }), "/listings");
});

const listings = [
  { id: "a", title: "Calculus", description: "Linear algebra", category: "Books & Notes", condition: "New", price: 125.75 },
  { id: "b", title: "C++ [notes]", category: "Books & Notes", condition: "Good", price: 75 },
  { id: "c", title: "Laptop", category: "Electronics & Gadgets", condition: "Good", price: 500 },
  { id: "d", title: "Free supplies", price: 0 },
];
for (const [name, filters, ids] of [
  ["description and whitespace", { searchValue: " ALGEBRA " }, ["a"]],
  ["literal special characters", { searchValue: "C++ [" }, ["b"]],
  ["category and condition intersection", { selectedCategories: ["Books & Notes"], selectedConditions: ["New"] }, ["a"]],
  ["multiple category union", { selectedCategories: ["Books & Notes", "Electronics & Gadgets"] }, ["b", "a", "c"]],
  ["decimal prices", { minPrice: "125.5", maxPrice: "125.8" }, ["a"]],
  ["unknown condition is not Good", { selectedConditions: ["Good"] }, ["b", "c"]],
  ["missing category matches displayed Miscellaneous", { selectedCategories: ["Miscellaneous"] }, ["d"]],
  ["descending sort", { sortBy: "price-desc" }, ["c", "a", "b", "d"]],
]) {
  test(`filters handle ${name}`, () => {
    assert.equal(typeof search.filterListings, "function");
    assert.deepEqual(search.filterListings(listings, filters).map(item => item.id), ids);
    assert.deepEqual(listings.map(item => item.id), ["a", "b", "c", "d"]);
  });
}
