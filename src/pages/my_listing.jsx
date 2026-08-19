// src/pages/my_listing.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import divider from "../assets/divider.svg";
import BackButton from "../assets/icons/BackButton.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

import "../styles/My_Listing.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getStatusStyles = (statusRaw) => {
  const status = (statusRaw || "").toLowerCase();

  if (status === "active") {
    return "bg-green-200 text-green-800";
  }
  if (status === "sold") {
    return "bg-gray-300 text-[#1b263b]";
  }
  if (status === "reserved") {
    return "bg-[#f7efae] text-yellow-900";
  }

  return "bg-gray-200 text-gray-700";
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
    <div className="bg-white min-h-screen flex flex-col">
      {/* -------- HEADER (same style as Reservation with login) -------- */}
      <header className="w-full h-[90px] bg-white flex items-center shadow-sm">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer hover:opacity-70 transition"
            >
              <img src={BackButton} alt="Back" className="w-6 h-6" />
            </button>

            <div
              className="cursor-pointer select-none"
              onClick={() => navigate("/landing-login")}
            >
              <span className="text-[#c90202] font-subheading">Thapar</span>
              <span className="text-black font-subheading">Kart</span>
            </div>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate("/landing-login")}
              className="font-body-text text-black hover:text-[#c90202] transition"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/about-login")}
              className="px-6 py-3 bg-black text-white rounded-full hover:bg-[#1a1a1a] transition shadow-button-shadow"
            >
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* -------- MAIN CONTENT -------- */}
      <main className="w-[90%] mx-auto pt-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins-bold text-2xl text-[#0d1b2a]">
            My Listings
          </h1>

          {/* Wrapper for action buttons */}
          <div className="flex items-center gap-3">
            {/* New Messages Button */}
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="px-6 py-3.5 rounded-[999px] bg-white text-black border border-[#0000001a] shadow-sm hover:bg-gray-50 transition-colors"
            >
              Messages
            </button>

            <button
              type="button"
              onClick={handleAddNew}
              className="px-6 py-3.5 rounded-[999px] bg-black text-white shadow-button-shadow hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
            >
              Add New Item
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-gray-500 mb-4">Loading your listings…</p>
        )}

        {/* Cards grid */}
        <div className="flex flex-wrap gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="w-[262px] bg-white rounded-xl overflow-hidden shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] flex flex-col"
            >
              {/* Image + status pill */}
              <div
                className="relative w-full aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: `url('${item.image}')` }}
              >
                <div
                  className={`inline-flex px-3 py-1 absolute top-3 right-3 rounded-full ${item.statusColor} text-xs font-bold`}
                >
                  {item.status}
                </div>
              </div>

              {/* Text + buttons */}
              <div className="flex flex-col gap-4 px-4 pt-2 pb-4">
                <div>
                  <div className="font-semibold text-[#0d1b2a] text-sm leading-snug">
                    {item.title}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {item.price}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item.id)}
                    className="flex-1 border border-[#0000001a] rounded-lg py-2 text-sm hover:bg-gray-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 border border-[#0000001a] rounded-lg py-2 text-sm hover:bg-gray-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && listings.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">
              You haven&apos;t created any listings yet.
            </p>
          )}
        </div>
      </main>

      {/* -------- FOOTER (same as Landing/Reservation) -------- */}
      <footer className="bg-white py-10 relative mt-auto">
        <img
          src={divider}
          className="w-[90%] mx-auto absolute top-0 left-1/2 -translate-x-1/2"
          alt="divider"
        />

        <div className="w-[90%] mx-auto flex justify-between items-center pt-6">
          <p className="font-subheading">
            <span className="text-[#c90202]">Thapar</span>
            <span className="text-black">Kart</span>
          </p>

          <div className="flex gap-3">
            <img
              src={facebookIcon}
              className="w-6 cursor-pointer hover:scale-110 transition"
              alt="facebook"
            />
            <img
              src={instagramIcon}
              className="w-6 cursor-pointer hover:scale-110 transition"
              alt="instagram"
            />
            <img
              src={linkedinIcon}
              className="w-6 cursor-pointer hover:scale-110 transition"
              alt="linkedin"
            />
            <img
              src={youtubeIcon}
              className="w-6 cursor-pointer hover:scale-110 transition"
              alt="youtube"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MyListing;