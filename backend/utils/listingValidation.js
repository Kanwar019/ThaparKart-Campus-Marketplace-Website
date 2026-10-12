export const isValidPrice = (price) =>
  typeof price === "number" && Number.isFinite(price) && price >= 0 && price <= 10000000;

const invalid = (message) => { throw Object.assign(new Error(message), { status: 400 }); };

export const MAX_IMAGE_CHARS = 3 * 1024 * 1024; // ~2MB raw image encoded in base64
export const VALID_IMAGE_PREFIX = /^(https?:\/\/|\/|data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml);base64,)/i;

export const isValidImageString = (image) => {
  if (typeof image !== "string") return false;
  const trimmed = image.trim();
  if (!trimmed || trimmed.length > MAX_IMAGE_CHARS) return false;
  return VALID_IMAGE_PREFIX.test(trimmed);
};

// Creation and partial edits share one set of rules. Never coerce arrays,
// booleans, or null into a price, or silently truncate submitted text.
export function validateListingInput(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) invalid("Listing fields are required.");
  const fields = {};
  for (const [name, limit] of [["title", 150], ["description", 3000], ["category", 100], ["condition", 100]]) {
    if (!Object.hasOwn(body, name) && (partial || name !== "title")) continue;
    if (typeof body[name] !== "string") invalid(`${name} must be text.`);
    const value = body[name].trim();
    if (name === "title" && !value) invalid("Title is required.");
    if (value.length > limit) invalid(`${name} must be at most ${limit} characters.`);
    fields[name] = value;
  }
  if (!partial || Object.hasOwn(body, "price")) {
    const value = body.price;
    if ((typeof value !== "number" && typeof value !== "string") ||
        (typeof value === "string" && !value.trim()) || !isValidPrice(Number(value))) {
      invalid("Price must be a finite number between 0 and 10000000.");
    }
    fields.price = Number(value);
  }

  if (Object.hasOwn(body, "imageUrls")) {
    const images = typeof body.imageUrls === "string" ? [body.imageUrls] : body.imageUrls;
    if (!Array.isArray(images) || images.length > 5 ||
        images.some((image) => typeof image !== "string" || !image.trim())) {
      invalid("Provide up to 5 non-empty image strings.");
    }
    for (const image of images) {
      const trimmed = image.trim();
      if (trimmed.length > MAX_IMAGE_CHARS) {
        invalid("Each image must be at most 2MB.");
      }
      if (!VALID_IMAGE_PREFIX.test(trimmed)) {
        invalid("Images must be valid image data URIs (PNG, JPEG, WebP, GIF, SVG) or URLs.");
      }
    }
    fields.imageUrls = images.map((image) => image.trim());
  }
  return fields;
}
