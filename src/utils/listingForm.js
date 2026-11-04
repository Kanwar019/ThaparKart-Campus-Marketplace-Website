export function listingFormError({ title, price, description, category, condition }) {
  if (!title.trim()) return "Title is required.";
  if (!String(price).trim() || !Number.isFinite(Number(price)) || Number(price) < 0 || Number(price) > 10000000) {
    return "Enter a price between 0 and 10000000. Use 0 for a free item.";
  }
  for (const [name, value, limit] of [["Title", title, 150], ["Description", description, 3000],
    ["Category", category, 100], ["Condition", condition, 100]]) {
    if (value.trim().length > limit) return `${name} must be at most ${limit} characters.`;
  }
  return "";
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reader.onabort = () => reject(new Error("Could not read the image. Please select it again."));
    reader.readAsDataURL(file);
  });
}

// Validate the whole batch before reading: never silently discard selected photos.
export async function readListingImages(files, existingCount, read = readImage) {
  if (existingCount + files.length > 5) throw new Error("You can upload up to 5 images only.");
  for (const file of files) {
    if (!/^image\/(png|jpeg|webp|gif|svg\+xml)$/i.test(file.type)) {
      throw new Error(`${file.name} is not supported. Use PNG, JPEG, WebP, GIF or SVG.`);
    }
    if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name} exceeds the 2MB size limit.`);
  }
  return Promise.all(files.map(read));
}
