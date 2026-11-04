import Listing from "../models/Listing.js";

export async function getListingSuggestions(req, res) {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (query.length < 2) return res.json([]);
  if (query.length > 100) return res.status(400).json({ message: "Search must be at most 100 characters." });
  // Treat punctuation as text, never as a user-supplied regular expression.
  const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    const items = await Listing.find({ status: "active", $or: [
      { title: { $regex: pattern, $options: "i" } },
      { category: { $regex: pattern, $options: "i" } },
    ] }).select("title category price").sort({ createdAt: -1 }).limit(5).lean();
    return res.json(items);
  } catch {
    return res.status(500).json({ message: "Suggestions are temporarily unavailable." });
  }
}
