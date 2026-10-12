// src/pages/all_listing.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL } from "../config/api.js";

import "../styles/All_Listing.css";
import { filterListings } from "../utils/listingSearch.js";

export const AllListing = ({ loggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogged = loggedIn ?? (location?.pathname.includes("-login") || false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [sortBy, setSortBy] = useState("price-asc");
  const [currentPage, setCurrentPage] = useState(1);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    const querySearch = searchParams.get("search") || "";
    const queryCat = searchParams.get("category");
    setSearchValue(querySearch);
    if (queryCat) {
      setSelectedCategories((prev) => (prev.includes(queryCat) ? prev : [queryCat]));
    }
  }, [searchParams]);

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
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }
    setSearchParams(params, { replace: true });
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDetails = (id) => {
    navigate(isLogged ? "/product-login" : "/product", { state: { listingId: id } });
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("price-asc");
    setCurrentPage(1);
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedConditions.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

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
              condition: l.condition || "",
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

  // ---- Derived filtered + sorted listings ----
  const filteredAndSorted = useMemo(() => {
    return filterListings(listings, {
      searchValue,
      selectedCategories,
      selectedConditions,
      minPrice,
      maxPrice,
      sortBy,
    });
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
        return "bg-cyan-200 text-cyan-950";
      case "Like New":
        return "bg-[#ffb5a7] text-stone-900";
      case "Good":
        return "bg-[#f7efae] text-stone-900";
      case "Fair":
        return "bg-gray-200 text-gray-900";
      case "Needs Repair":
        return "bg-red-200 text-red-950";
      default:
        return "bg-gray-200 text-gray-900";
    }
  };

  // Reusable filter controls for both desktop sidebar and mobile modal
  const FilterContent = () => (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <h2 className="text-xl font-bold text-[#0d1b2a] dark:text-white">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-[#c90202] hover:underline font-medium cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h3 className="text-base font-semibold text-[#1b263b] dark:text-neutral-200 mb-3">
          Categories
        </h3>
        <div className="flex flex-col gap-2 text-sm text-[#1b263b] dark:text-neutral-300">
          {allCategories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/60 rounded-md px-1.5 py-1 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded border border-[#00000040] dark:border-neutral-600 accent-[#c90202]"
              />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h3 className="text-base font-semibold text-[#1b263b] dark:text-neutral-200 mb-3">
          Price Range
        </h3>
        <div className="flex items-center gap-2.5 text-sm">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500 dark:text-neutral-400">Min (₹)</label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => {
                setCurrentPage(1);
                setMinPrice(e.target.value);
              }}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
              placeholder="0"
            />
          </div>
          <span className="mt-5 text-gray-400 dark:text-neutral-600">—</span>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500 dark:text-neutral-400">Max (₹)</label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => {
                setCurrentPage(1);
                setMaxPrice(e.target.value);
              }}
              className="w-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-black dark:focus:border-white transition-colors"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h3 className="text-base font-semibold text-[#1b263b] dark:text-neutral-200 mb-3">
          Condition
        </h3>
        <div className="flex flex-col gap-2 text-sm text-[#1b263b] dark:text-neutral-300">
          {allConditions.map((cond) => (
            <label
              key={cond}
              className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/60 rounded-md px-1.5 py-1 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(cond)}
                onChange={() => toggleCondition(cond)}
                className="w-4 h-4 rounded border border-[#00000040] dark:border-neutral-600 accent-[#c90202]"
              />
              <span className="text-sm">{cond}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort by */}
      <div>
        <h3 className="text-base font-semibold text-[#1b263b] dark:text-neutral-200 mb-3">
          Sort by
        </h3>
        <div className="flex flex-col gap-2 text-sm text-[#1b263b] dark:text-neutral-300">
          <label className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/60 rounded-md px-1.5 py-1 transition-colors">
            <input
              type="radio"
              name="sort"
              value="price-asc"
              checked={sortBy === "price-asc"}
              onChange={() => handleSortChange("price-asc")}
              className="w-4 h-4 accent-[#c90202]"
            />
            <span>Price: Low to High</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/60 rounded-md px-1.5 py-1 transition-colors">
            <input
              type="radio"
              name="sort"
              value="price-desc"
              checked={sortBy === "price-desc"}
              onChange={() => handleSortChange("price-desc")}
              className="w-4 h-4 accent-[#c90202]"
            />
            <span>Price: High to Low</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#fbfbfb] dark:bg-[#0f0f11] text-[#0d1b2a] dark:text-[#f4f4f5] min-h-screen flex flex-col transition-colors">
      {/* ---------- RESPONSIVE HEADER ---------- */}
      <Header
        loggedIn={isLogged}
        showBack={true}
        onBack={() => navigate(-1)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="flex-1 w-[92%] max-w-[1300px] mx-auto pb-16 pt-4 sm:pt-6">
        {/* Mobile Filter & Sort Toolbar (< lg) */}
        <div className="lg:hidden flex items-center justify-between gap-3 mb-6 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#c90202] text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-gray-500 dark:text-neutral-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-2.5 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-black dark:text-white text-xs sm:text-sm outline-none"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* ---------- DESKTOP FILTER SIDEBAR (>= lg) ---------- */}
          <aside className="hidden lg:flex w-[280px] shrink-0 bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-xl shadow-xs p-6 flex-col gap-4 sticky top-28 transition-colors">
            <FilterContent />
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-2 w-full px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 transition-colors shadow-button-shadow"
            >
              Apply Filters
            </button>
          </aside>

          {/* ---------- LISTINGS AREA ---------- */}
          <section className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#0d1b2a] dark:text-white">
                Recent Listings
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredAndSorted.length === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSorted.length)} of{" "}
                {filteredAndSorted.length} items
              </p>
            </div>

            {/* Cards grid */}
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-neutral-400 mt-4 p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                Loading listings...
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-neutral-400 mt-4 p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <p className="text-base font-medium text-black dark:text-white mb-2">No listings found</p>
                <p>Try adjusting your filters or search keywords.</p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map((item) => {
                  const cond = item.condition || "Good";
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/70 dark:border-neutral-800 shadow-xs hover:shadow-md overflow-hidden flex flex-col transition-all hover:translate-y-[-2px]"
                    >
                      <div
                        className="relative h-48 bg-cover bg-center bg-neutral-100 dark:bg-neutral-800"
                        style={{ backgroundImage: `url(${item.image || ""})` }}
                      >
                        {!item.image && (
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                            No image available
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-neutral-400 font-medium">
                          {item.category || "Miscellaneous"}
                        </p>
                        <h2 className="text-lg font-semibold text-[#0d1b2a] dark:text-white line-clamp-1">
                          {item.title}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800">
                          <span className="text-xl font-bold text-[#0d1b2a] dark:text-white">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getConditionClass(
                              cond
                            )}`}
                          >
                            {cond}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-neutral-400">
                          Seller: {item.sellerName || item.sellerEmail || "Student"}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleViewDetails(item.id)}
                          className="mt-2 w-full px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 transition-colors shadow-button-shadow cursor-pointer"
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
              <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage === 1}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
                    safePage === 1
                      ? "border-neutral-200 dark:border-neutral-800 text-gray-400 cursor-default"
                      : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700"
                  }`}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition ${
                      page === safePage
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-button-shadow"
                        : "border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage === totalPages}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
                    safePage === totalPages
                      ? "border-neutral-200 dark:border-neutral-800 text-gray-400 cursor-default"
                      : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ---------- MOBILE FILTER DRAWER (< lg) ---------- */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative z-10 bg-white dark:bg-[#161618] rounded-t-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-fadeIn">
            <FilterContent />
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full shadow-button-shadow hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 transition"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="px-5 py-3 border border-neutral-300 dark:border-neutral-700 rounded-full text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- FOOTER ---------- */}
      <Footer />
    </div>
  );
};

export const AllListingLogin = (props) => <AllListing loggedIn={true} {...props} />;

export default AllListing;
