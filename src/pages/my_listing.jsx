// src/pages/my_listing.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL, getAuthHeaders } from "../config/api.js";
import "../styles/My_Listing.css";

const getStatusStyles = (statusRaw) => {
  const status = (statusRaw || "").toLowerCase();

  if (status === "active") {
    return "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300";
  }
  if (status === "sold") {
    return "bg-gray-300 text-[#1b263b] dark:bg-neutral-700 dark:text-neutral-300";
  }
  if (status === "reserved") {
    return "bg-[#f7efae] text-yellow-900 dark:bg-yellow-900/60 dark:text-yellow-200";
  }

  return "bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300";
};

export const MyListing = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        setLoading(true);

        // ✅ must match backend: GET /api/listings/mine
        const res = await fetch(`${API_BASE_URL}/api/listings/mine`, {
          credentials: "include",
          headers: { ...getAuthHeaders() },
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.error("Not authenticated");
          }
          throw new Error("Failed to load listings");
        }

        const data = await res.json();

        const mapped = data.map((item) => ({
          id: String(item._id),
          title: item.title || "Untitled item",
          price: `₹${Number(item.price || 0).toLocaleString("en-IN")}`,
          status: item.status || "active",
          statusColor: getStatusStyles(item.status),
          image:
            (Array.isArray(item.imageUrls) && item.imageUrls[0]) ||
            "/background.png",
          category: item.category || "",
          condition: item.condition || "",
          description: item.description || "",
        }));

        setListings(mapped);
      } catch (err) {
        console.error("Error loading my listings:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  const handleAddNew = () => {
    navigate("/create-listing-login");
  };

  const handleEdit = (id) => {
    navigate(`/edit-listings/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmDelete) return;

    try {
      // ✅ must match backend: DELETE /api/listings/:id
      const res = await fetch(
        `${API_BASE_URL}/api/listings/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { ...getAuthHeaders() },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(
          errData.message ||
            "Failed to delete listing on server. Please try again."
        );
        return;
      }

      // ✅ only remove from UI when backend delete succeeds
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Could not connect to server. Please try again.");
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] text-gray-900 dark:text-neutral-100 min-h-screen flex flex-col transition-colors">
      {/* -------- HEADER -------- */}
      <Header loggedIn={true} showBack={true} />

      {/* -------- MAIN CONTENT -------- */}
      <main className="w-[92%] sm:w-[90%] max-w-7xl mx-auto pt-6 sm:pt-8 pb-16 sm:pb-20 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-poppins-bold text-2xl sm:text-3xl text-[#0d1b2a] dark:text-white">
              My Listings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
              Manage, edit, or remove your items currently on sale
            </p>
          </div>

          {/* Wrapper for action buttons */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* New Messages Button */}
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-[999px] bg-white dark:bg-neutral-800 text-black dark:text-white border border-[#0000001a] dark:border-neutral-700 shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 transition text-sm font-medium"
            >
              Messages
            </button>

            <button
              type="button"
              onClick={handleAddNew}
              className="px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-[999px] bg-black dark:bg-[#c90202] text-white shadow-button-shadow hover:bg-[#1a1a1a] dark:hover:bg-[#b00202] hover:scale-[1.02] active:scale-[0.98] transition text-sm font-medium"
            >
              Add New Item
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">Loading your listings…</p>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] border border-transparent dark:border-neutral-800 flex flex-col transition"
            >
              {/* Image + status pill */}
              <div
                className="relative w-full aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: `url('${item.image}')` }}
              >
                <div
                  className={`inline-flex px-3 py-1 absolute top-3 right-3 rounded-full ${item.statusColor} text-xs font-bold shadow-sm`}
                >
                  {item.status}
                </div>
              </div>

              {/* Text + buttons */}
              <div className="flex flex-col flex-1 justify-between gap-4 px-4 pt-3 pb-4">
                <div>
                  <div className="font-semibold text-[#0d1b2a] dark:text-white text-sm sm:text-base leading-snug truncate">
                    {item.title}
                  </div>
                  <div className="text-gray-600 dark:text-neutral-400 text-sm font-medium mt-1">
                    {item.price}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item.id)}
                    className="flex-1 border border-[#0000001a] dark:border-neutral-700 text-gray-800 dark:text-neutral-200 rounded-lg py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-lg py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/40 transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && listings.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-4 col-span-full">
              You haven&apos;t created any listings yet.
            </p>
          )}
        </div>
      </main>

      {/* -------- FOOTER -------- */}
      <Footer />
    </div>
  );
};

export default MyListing;