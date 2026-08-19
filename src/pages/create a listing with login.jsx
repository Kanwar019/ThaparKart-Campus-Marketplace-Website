// src/pages/create a listing with login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import divider from "../assets/divider.svg";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

import "../styles/Create_a_Listing_with_Login.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const CreateListingWithLogin = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // 🔹 NEW: store image data-urls that will go to DB
  const [imagePreviews, setImagePreviews] = useState([]); // strings (base64/data URLs)

  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

  // 🔹 UPDATED: multiple image upload, convert to base64 (similar to EditListing)
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    // limit to 5 images total
    const remainingSlots = 5 - imagePreviews.length;
    if (remainingSlots <= 0) {
      alert("You can upload up to 5 images only.");
      return;
    }

    const filesToRead = selected.slice(0, remainingSlots);

    const readers = filesToRead.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file); // base64
        })
    );

    Promise.all(readers)
      .then((results) => {
        setImagePreviews((prev) => [...prev, ...results]);
        // allow selecting same files again if needed
        e.target.value = "";
      })
      .catch((err) => console.error("Error reading files:", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !condition || !price || !description) {
      alert("Please fill in all required fields before posting.");
      return;
    }

    try {
      setSubmitting(true);
      setPosted(false);

      const res = await fetch(`${API_BASE_URL}/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          category,
          condition,
          price: Number(price),
          description,
          imageUrls: imagePreviews, // 🔹 send all images to DB
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        alert("Your session expired. Please log in again.");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Failed to create listing. Please try again.");
        return;
      }

      alert("Listing posted successfully.");

      setPosted(true);

      setTitle("");
      setCategory("");
      setCondition("");
      setPrice("");
      setDescription("");
      setImagePreviews([]); // clear uploaded images
    } catch (err) {
      console.error("Error creating listing:", err);
      alert("Could not connect to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen flex flex-col">
      {/* HEADER (same structure as LandingPage, with back & Account) */}
      <header className="w-full h-[164px] bg-white flex items-center shadow-sm">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Left: back button + logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img src={BackButton} alt="Back" className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/landing-login")}
              className="flex items-baseline gap-0 cursor-pointer"
            >
              <span className="text-[#c90202] font-subheading">Thapar</span>
              <span className="text-black font-subheading">Kart</span>
            </button>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              type="button"
              onClick={() => navigate("/landing-login")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
            >
              Home
            </button>

            {/* Search bar */}
            <div className="hidden sm:flex w-[260px] md:w-[320px] lg:w-[360px] items-center justify-between px-4 py-2 rounded-[999px] border border-[#0000001a] bg-white focus-within:border-black transition">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent outline-none font-body-text text-[#000000] placeholder:text-[#00000080]"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <HealthiconsMagnifyingGlassOutline className="w-5 h-5" />
              </button>
            </div>

            {/* Account → My Account Orders */}
            <button
              type="button"
              onClick={() => navigate("/my-account/orders")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
            >
              Account
            </button>

            {/* Contact Us → About / Contact section */}
            <button
              type="button"
              onClick={() => navigate("/about-login")}
              className="px-6 py-3.5 bg-black rounded-[999px] shadow-button-shadow cursor-pointer flex items-center justify-center hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
            >
              <span className="font-small-text text-white">Contact Us</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 py-8 md:py-12">
        <section className="w-[95%] max-w-[1100px] mx-auto">
          {/* Card like screenshot */}
          <div className="bg-white rounded-[24px] shadow-[0px_6px_20px_rgba(0,0,0,0.08)] px-5 py-6 md:px-10 md:py-10">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="font-bold text-[24px] md:text-[28px] lg:text-[30px] text-black">
                Create a New Listing
              </h1>
              <p className="mt-1 text-[13px] md:text-sm text-[#666666]">
                Fill in the details below to sell your item on the marketplace.
              </p>
            </div>

            {/* FORM */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Item Title */}
              <div className="space-y-2">
                <label className="text-[11px] md:text-xs font-medium text-black">
                  Item Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 'Barely used scientific calculator'"
                  className="w-full h-11 rounded-[999px] border border-[#e5e5e5] px-4 text-sm md:text-[15px] outline-none bg-[#fafafa]"
                />
              </div>

              {/* Category + Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[11px] md:text-xs font-medium text-black">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 rounded-[999px] border border-[#e5e5e5] bg-[#fafafa] px-4 pr-10 text-sm md:text-[15px] outline-none appearance-none"
                    >
                      <option value="">Select a category</option>
                      <option value="Books & Notes">Books &amp; Notes</option>
                      <option value="Electronics & Gadgets">
                        Electronics &amp; Gadgets
                      </option>
                      <option value="Cycles">Cycles</option>
                      <option value="Hostel Essentials">Hostel Essentials</option>
                      <option value="Clothes & Accessories">
                        Clothes &amp; Accessories
                      </option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-xs">
                      ▾
                    </span>
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <label className="text-[11px] md:text-xs font-medium text-black">
                    Condition
                  </label>
                  <div className="relative">
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full h-11 rounded-[999px] border border-[#e5e5e5] bg-[#fafafa] px-4 pr-10 text-sm md:text-[15px] outline-none appearance-none"
                    >
                      <option value="">Select condition</option>
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Repair">Needs Repair</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-xs">
                      ▾
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[11px] md:text-xs font-medium text-black">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 rounded-[999px] border border-[#e5e5e5] bg-[#fafafa] pl-8 pr-4 text-sm md:text-[15px] outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[11px] md:text-xs font-medium text-black">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item in detail..."
                  className="w-full min-h-[140px] rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-sm md:text-[15px] outline-none resize-none"
                />
              </div>

              {/* Upload Images (UI similar, but supports multiple + previews) */}
              <div className="space-y-3">
                <label className="text-[11px] md:text-xs font-medium text-black">
                  Upload Images
                </label>

                <label className="block w-full rounded-[20px] border border-dashed border-[#e5e5e5] bg-white py-6 px-4 text-center cursor-pointer hover:border-[#c90202] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-1 text-xs md:text-[13px]">
                    <div className="text-[#c90202] font-semibold">
                      Click to upload
                    </div>
                    <div className="text-[#777777]">
                      or drag and drop &nbsp;•&nbsp; PNG, JPG, GIF up to 10MB
                    </div>
                    <div className="text-[11px] text-[#999999]">
                      You can add up to 5 photos.
                    </div>
                  </div>
                </label>

                {/* 🔹 SIMPLE PREVIEW ROW – keeps similar style, but for multiple images */}
                {imagePreviews.length > 0 && (
                  <div className="flex items-center gap-4 rounded-[20px] border border-[#e5e5e5] bg-white px-4 py-3 overflow-x-auto">
                    <div className="w-10 h-10 bg-[#f2f2f2] rounded-md flex items-center justify-center text-xs text-[#555555] flex-shrink-0">
                      Img
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      <div className="text-sm font-medium text-black">
                        {imagePreviews.length} image
                        {imagePreviews.length > 1 ? "s" : ""} selected
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {imagePreviews.map((src, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-md overflow-hidden bg-[#f2f2f2]"
                        >
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Post Listing button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={posted || submitting}
                  className={`px-6 py-3 rounded-[20px] text-sm md:text-[15px] font-medium shadow-button-shadow cursor-pointer transition-transform transition-colors
                    ${
                      posted
                        ? "bg-[#0f9d58] text-white cursor-default"
                        : "bg-[#c90202] text-white hover:bg-[#a10101] hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                >
                  {submitting
                    ? "Posting..."
                    : posted
                    ? "Posted"
                    : "Post Listing"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER (same as LandingPage) */}
      <footer className="bg-white py-10 relative mt-6">
        <img
          className="w-[calc(100%_-_160px)] max-w-[1200px] mx-auto top-0 left-0 right-0 h-px object-cover absolute inset-x-0"
          alt="Divider"
          src={divider}
        />

        <div className="w-[90%] mx-auto flex items-center justify-between pt-4">
          <p className="h-9 flex items-center justify-center font-subheading text-[length:var(--subheading-font-size)]">
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </p>

          <div className="flex items-center gap-3">
            <img
              src={facebookIcon}
              alt="facebook"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={instagramIcon}
              alt="instagram"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={linkedinIcon}
              alt="linkedin"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={youtubeIcon}
              alt="youtube"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateListingWithLogin;
