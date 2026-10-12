// src/pages/create_listing.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL } from "../config/api.js";

import "../styles/Create_a_Listing.css";
import "../styles/Create_a_Listing_with_Login.css";
import { listingSearchUrl } from "../utils/listingSearch.js";

const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const CreateListing = ({ loggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogged = loggedIn ?? (location?.pathname.includes("-login") || false);

  const [searchValue, setSearchValue] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [imagePreviews, setImagePreviews] = useState([]); // strings (base64/data URLs)
  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = () => {
    navigate(listingSearchUrl(isLogged, { search: searchValue }));
  };

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

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const validFiles = [];
    for (const file of filesToRead) {
      if (!file.type || !file.type.startsWith("image/")) {
        alert(`${file.name} is not a supported image file.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds the 2MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }
    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    const readers = validFiles.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers)
      .then((results) => {
        setImagePreviews((prev) => [...prev, ...results]);
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
          imageUrls: imagePreviews,
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
      setImagePreviews([]);
    } catch (err) {
      console.error("Error creating listing:", err);
      alert("Could not connect to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={isLogged ? "bg-[#f7f7f7] min-h-screen flex flex-col" : "bg-white min-h-screen flex flex-col"}>
      {/* ---------- HEADER ---------- */}
      <header className={isLogged ? "w-full h-[164px] bg-white flex items-center shadow-sm" : "w-full h-[164px] bg-white flex items-center"}>
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Left: (back button if logged in) + logo */}
          <div className="flex items-center gap-4">
            {isLogged && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cursor-pointer hover:opacity-70 transition-opacity"
              >
                <img src={BackButton} alt="Back" className="w-6 h-6" />
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(isLogged ? "/landing-login" : "/")}
              className="flex items-baseline gap-0 cursor-pointer hover:opacity-80 transition-all duration-200"
            >
              <span className="text-[#c90202] font-subheading">Thapar</span>
              <span className="text-black font-subheading">Kart</span>
            </button>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              type="button"
              onClick={() => navigate(isLogged ? "/landing-login" : "/")}
              className="hover:text-[#c90202] font-body-text transition-colors"
            >
              Home
            </button>

            {/* Search bar */}
            <div className="hidden sm:flex w-[260px] md:w-[320px] lg:w-[360px] items-center justify-between px-4 py-2 rounded-[999px] border border-[#0000001a] bg-white focus-within:border-black transition">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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

            {isLogged ? (
              <button
                type="button"
                onClick={() => navigate("/my-account/orders")}
                className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
              >
                Account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="hover:text-[#c90202] font-body-text transition-colors"
              >
                Login
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(isLogged ? "/about-login" : "/about")}
              className={
                isLogged
                  ? "px-6 py-3.5 bg-black rounded-[999px] shadow-button-shadow cursor-pointer flex items-center justify-center hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
                  : "px-6 py-3 bg-black text-white rounded-[999px] hover:bg-[#1a1a1a] hover:scale-[1.03] transition-transform transition-colors"
              }
            >
              <span className={isLogged ? "font-small-text text-white" : ""}>Contact Us</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------- MAIN CONTENT ---------- */}
      {!isLogged ? (
        /* ---------- BLOCKED MESSAGE FOR GUESTS ---------- */
        <main className="flex-1 flex items-center justify-center p-10">
          <div className="bg-[#f7f7f7] w-full max-w-[750px] rounded-[28px] p-10 shadow-md text-center">
            <h1 className="text-[32px] font-bold mb-4">Create a Listing</h1>

            <p className="text-[#666] mb-6 text-lg">
              You must be logged in with your <strong>@thapar.edu</strong> account
              before creating a listing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-black text-white rounded-[20px] hover:bg-[#1a1a1a] hover:scale-[1.03] transition-transform transition-colors"
              >
                Login to Continue
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-8 py-4 bg-[#e6e6e6] rounded-[20px] hover:bg-[#d0d0d0] hover:scale-[1.03] transition-transform transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* ---------- FULL LISTING FORM FOR LOGGED-IN USERS ---------- */
        <main className="flex-1 py-8 md:py-12">
          <section className="w-[95%] max-w-[1100px] mx-auto">
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

                {/* Upload Images */}
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

                  {/* Preview row */}
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
      )}

      {/* ---------- FOOTER ---------- */}
      <Footer />
    </div>
  );
};

export const CreateListingWithLogin = (props) => <CreateListing loggedIn={true} {...props} />;

export default CreateListing;
