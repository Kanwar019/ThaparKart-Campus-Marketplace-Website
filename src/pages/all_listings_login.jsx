// src/pages/all_listings_login.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import divider from "../assets/divider.svg";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";

import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

import "../styles/All_Listing.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const AllListingLogin = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [sortBy, setSortBy] = useState("price-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 9;

  const allCategories = [
    "Books & Notes",
    "Electronics & Gadgets",
    "Cycles",
    "Hostel Essentials",
    "Clothes & Accessories",
    "Miscellaneous",
  ];

  const allConditions = ["New", "Like New", "Good", "Fair", "Needs Repair"];

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

  const toggleCategory = (cat) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCondition = (cond) => {
    setCurrentPage(1);
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (id) => {
    navigate("/product-login", { state: { listingId: id } });
  };

  // 🔹 Fetch listings from backend
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listings`);
        if (!res.ok) {
          throw new Error("Failed to load listings");
        }

        const data = await res.json();

        const normalized = Array.isArray(data)
          ? data.map((l) => ({
              ...l,
              id: l._id,
              image: l.imageUrls && l.imageUrls.length > 0 ? l.imageUrls[0] : "",
              condition: "Good",
            }))
          : [];

        setListings(normalized);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...listings];

    if (searchValue.trim() !== "") {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.category || "").toLowerCase().includes(query)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((item) => selectedCategories.includes(item.category));
    }

    if (selectedConditions.length > 0) {
      result = result.filter((item) =>
        selectedConditions.includes(item.condition || "Good")
      );
    }

    const min = parseInt(minPrice, 10);
    const max = parseInt(maxPrice, 10);

    if (!isNaN(min)) {
      result = result.filter((item) => (item.price || 0) >= min);
    }
    if (!isNaN(max)) {
      result = result.filter((item) => (item.price || 0) <= max);
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return result;
  }, [
    listings,
    searchValue,
    selectedCategories,
    selectedConditions,
    sortBy,
    minPrice,
    maxPrice,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredAndSorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getConditionClass = (cond) => {
    switch (cond) {
      case "New":
        return "bg-cyan-200";
      case "Like New":
        return "bg-[#ffb5a7]";
      case "Good":
        return "bg-[#f7efae]";
      case "Fair":
        return "bg-gray-200";
      case "Needs Repair":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      {/* 🔙 Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-30 cursor-pointer transition-transform hover:scale-[1.10]"
      >
        <img src={BackButton} alt="Back" className="w-7 h-7" />
      </button>

      {/* ---------- HEADER (Account instead of Login) ---------- */}
      <header className="w-full h-[164px] bg-white flex items-center z-20">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/landing-login")}
            className="flex items-baseline gap-0 cursor-pointer"
            aria-label="Go to homepage"
          >
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </button>

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
            <div className="hidden sm:flex w-[260px] md:w-[320px] lg:w-[360px] items-center justify-between px-4 py-2 rounded-[999px] border border-[#0000001a] bg-white focus-within:border-black transition-colors">
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
                className="flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <img src={MagnifyingGlassIcon} alt="search" className="w-5 h-5" />
              </button>
            </div>

            {/* Account instead of Login */}
            <button
              type="button"
              onClick={() => navigate("/my-account/orders")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
            >
              Account
            </button>

            <button
              type="button"
              onClick={() => navigate("/about-login")}
              className="px-6 py-3.5 bg-black rounded-[999px] shadow-button-shadow text-white hover:bg-[#1a1a1a] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="flex-1 w-[90%] mx-auto pb-16 pt-4 md:pt-6">
        <div className="flex gap-8 items-start">
          {/* ---------- FILTER SIDEBAR ---------- */}
          <aside className="w-[280px] bg-white rounded-xl shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-4">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-[#0d1b2a] text-center">
                Filters
              </h2>
            </div>

            {/* Categories */}
            <div className="border-b pb-4 pt-3">
              <h3 className="text-lg font-semibold text-[#1b263b] mb-3">
                Categories
              </h3>
              <div className="flex flex-col gap-2 text-sm text-[#1b263b]">
                {allCategories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md px-1 py-[2px]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border border-[#00000040]"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="border-b pb-6 pt-3">
              <h3 className="text-lg font-semibold text-[#1b263b] mb-4">
                Price Range
              </h3>

              <div className="relative w-full h-1.5 bg-gray-200 rounded-full mb-4">
                <div className="absolute left-[10%] right-[15%] top-0 h-1.5 bg-[#1b263b] rounded-full" />
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600">Min (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setMinPrice(e.target.value);
                    }}
                    className="w-24 border rounded-lg px-2 py-1 text-sm"
                    placeholder="Min"
                  />
                </div>
                <span className="mt-5 text-gray-400">—</span>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600">Max (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setMaxPrice(e.target.value);
                    }}
                    className="w-24 border rounded-lg px-2 py-1 text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="border-b pb-4 pt-3">
              <h3 className="text-lg font-semibold text-[#1b263b] mb-3">
                Condition
              </h3>
              <div className="flex flex-col gap-2 text-sm text-[#1b263b]">
                {allConditions.map((cond) => (
                  <label
                    key={cond}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md px-1 py-[2px]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(cond)}
                      onChange={() => toggleCondition(cond)}
                      className="w-4 h-4 rounded border border-[#00000040]"
                    />
                    <span>{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort by */}
            <div className="pt-3">
              <h3 className="text-lg font-semibold text-[#1b263b] mb-3">
                Sort by
              </h3>
              <div className="flex flex-col gap-2 text-sm text-[#1b263b]">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md px-1 py-[2px]">
                  <input
                    type="radio"
                    name="sort"
                    value="price-asc"
                    checked={sortBy === "price-asc"}
                    onChange={() => handleSortChange("price-asc")}
                    className="w-4 h-4"
                  />
                  <span>Price: Low to High</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-md px-1 py-[2px]">
                  <input
                    type="radio"
                    name="sort"
                    value="price-desc"
                    checked={sortBy === "price-desc"}
                    onChange={() => handleSortChange("price-desc")}
                    className="w-4 h-4"
                  />
                  <span>Price: High to Low</span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => console.log("Filters applied")}
              className="mt-4 w-full px-4 py-2.5 bg-black text-white rounded-[999px] text-sm hover:bg-[#1a1a1a] transition-colors"
            >
              Apply Filters
            </button>
          </aside>

          {/* ---------- LISTINGS AREA ---------- */}
          <section className="flex-1 flex flex-col gap-6">
            {/* Header row */}
            <div className="flex items-baseline justify-between">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#0d1b2a]">
                Recent Listings
              </h1>
              <p className="text-sm text-gray-600">
                Showing {filteredAndSorted.length === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSorted.length)} of{" "}
                {filteredAndSorted.length} items
              </p>
            </div>

            {/* Cards grid */}
            {loading ? (
              <div className="text-sm text-gray-500 mt-4">Loading listings...</div>
            ) : pageItems.length === 0 ? (
              <div className="text-sm text-gray-500 mt-4">
                No items match your filters/search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pageItems.map((item) => {
                  const cond = item.condition || "Good";
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                    >
                      <div
                        className="relative h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image || ""})` }}
                      />
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <p className="text-sm text-gray-500">
                          {item.category || "Miscellaneous"}
                        </p>
                        <h3 className="text-lg font-semibold text-[#0d1b2a] leading-snug">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xl font-bold text-[#1b263b]">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-[#1b263b] ${getConditionClass(
                              cond
                            )}`}
                          >
                            {cond}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleViewDetails(item.id)}
                          className="mt-3 w-full rounded-[999px] bg-black text-white text-sm py-2 hover:bg-[#1a1a1a] hover:scale-[1.01] active:scale-[0.98] transition-transform transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                <button
                  type="button"
                  onClick={() => safePage > 1 && handlePageChange(safePage - 1)}
                  disabled={safePage === 1}
                  className={`px-4 py-2 rounded-[999px] border text-sm ${
                    safePage === 1
                      ? "border-[#0000001a] text-gray-400 cursor-default"
                      : "border-[#0000001a] hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  const isActive = page === safePage;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-[999px] text-sm ${
                        isActive
                          ? "bg-black text-white"
                          : "border border-[#0000001a] hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    safePage < totalPages && handlePageChange(safePage + 1)
                  }
                  disabled={safePage === totalPages}
                  className={`px-4 py-2 rounded-[999px] border text-sm ${
                    safePage === totalPages
                      ? "border-[#0000001a] text-gray-400 cursor-default"
                      : "border-[#0000001a] hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-white py-10 relative">
        <img
          src={divider}
          alt="Divider"
          className="w-[calc(100%_-_160px)] max-w-[1200px] mx-auto h-px object-cover absolute top-0 left-0 right-0"
        />

        <div className="w-[90%] mx-auto flex items-center justify-between pt-4">
          <p className="font-subheading text-[length:var(--subheading-font-size)]">
            <span className="text-[#c90202]">Thapar</span>
            <span className="text-black">Kart</span>
          </p>

          <div className="flex items-center gap-3">
            <img
              src={facebookIcon}
              alt="facebook"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02]"
            />
            <img
              src={instagramIcon}
              alt="instagram"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02]"
            />
            <img
              src={linkedinIcon}
              alt="linkedin"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02]"
            />
            <img
              src={youtubeIcon}
              alt="youtube"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02]"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AllListingLogin;
