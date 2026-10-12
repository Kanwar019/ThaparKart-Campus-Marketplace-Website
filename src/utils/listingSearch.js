export function listingSearchUrl(loggedIn, { search = "", category = "" } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (category) params.set("category", category);
  const path = loggedIn ? "/listings-login" : "/listings";
  return params.size ? `${path}?${params}` : path;
}

const text = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";

export function filterListings(listings, {
  searchValue = "", selectedCategories = [], selectedConditions = [],
  minPrice = "", maxPrice = "", sortBy = "price-asc",
} = {}) {
  const query = text(searchValue);
  const categories = selectedCategories.map(text);
  const conditions = selectedConditions.map(text);
  const min = minPrice.trim() === "" ? NaN : Number(minPrice);
  const max = maxPrice.trim() === "" ? NaN : Number(maxPrice);
  return listings.filter((item) => {
    const category = text(item.category) || "miscellaneous";
    if (query && ![item.title, item.description, category].some(value => text(value).includes(query))) return false;
    if (categories.length && !categories.includes(category)) return false;
    if (conditions.length && !conditions.includes(text(item.condition))) return false;
    if (Number.isFinite(min) && (!Number.isFinite(item.price) || item.price < min)) return false;
    if (Number.isFinite(max) && (!Number.isFinite(item.price) || item.price > max)) return false;
    return true;
  }).sort((a, b) => sortBy === "price-desc" ? (b.price || 0) - (a.price || 0) : (a.price || 0) - (b.price || 0));
}
