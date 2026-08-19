// controllers/adminController.js
import User from "../models/User.js";
import Listing from "../models/Listing.js";
import Feedback from "../models/Feedback.js";

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const [users, listings, feedback] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Feedback.countDocuments(),
    ]);

    res.json({
      users,
      listings,
      feedback,
    });
  } catch (err) {
    console.error("Error in getAdminStats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/export  -> CSV with users + listings + feedback
export const exportAllData = async (req, res) => {
  try {
    const [users, listings, feedbacks] = await Promise.all([
      User.find().lean(),
      Listing.find().lean(),
      Feedback.find().lean(),
    ]);

    const columns = [
      "type",
      "id",
      "name",
      "email",
      "title",
      "price",
      "category",
      "condition",
      "message",
      "createdAt",
    ];

    const rows = [];

    // Users
    users.forEach((u) => {
      rows.push({
        type: "user",
        id: u._id,
        name: u.name || "",
        email: u.email || "",
        title: "",
        price: "",
        category: "",
        condition: "",
        message: "",
        createdAt: u.createdAt ? u.createdAt.toISOString() : "",
      });
    });

    // Listings
    listings.forEach((l) => {
      rows.push({
        type: "listing",
        id: l._id,
        name: "",
        email: l.sellerEmail || "", // or l.ownerEmail if that's your field
        title: l.title || "",
        price: l.price != null ? String(l.price) : "",
        category: l.category || "",
        condition: l.condition || "",
        message: "",
        createdAt: l.createdAt ? l.createdAt.toISOString() : "",
      });
    });

    // Feedback
    feedbacks.forEach((fb) => {
      rows.push({
        type: "feedback",
        id: fb._id,
        name: `${fb.firstName || ""} ${fb.lastName || ""}`.trim(),
        email: fb.email || "",
        title: "",
        price: "",
        category: "",
        condition: "",
        message: fb.message || "",
        createdAt: fb.createdAt ? fb.createdAt.toISOString() : "",
      });
    });

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value).replace(/"/g, '""');
      return /[",\n]/.test(str) ? `"${str}"` : str;
    };

    const headerLine = columns.join(",");
    const lines = rows.map((row) =>
      columns.map((col) => escapeCsv(row[col])).join(",")
    );
    const csv = [headerLine, ...lines].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="thaparkart-export.csv"'
    );
    res.status(200).send(csv);
  } catch (err) {
    console.error("Error in exportAllData:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default { getAdminStats, exportAllData };
