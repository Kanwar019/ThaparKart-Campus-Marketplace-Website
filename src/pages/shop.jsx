// src/pages/Shop.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import image1 from "../assets/image-1.png";
import BackButton from "../assets/icons/BackButton.svg";
import image8 from "../assets/image-8.png";
import image10 from "../assets/image-10.png";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL } from "../config/api.js";
import { useTheme } from "../contexts/ThemeContext.jsx";
import "../styles/Shop.css";
import { listingSearchUrl } from "../utils/listingSearch.js";

const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const Shop = ({ loggedIn }) => {
  const [searchValue, setSearchValue] = useState("");
  const [newArrivals, setNewArrivals] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const isLogged = loggedIn ?? (location?.pathname.includes("-login") || false);

  const handleSearch = () => {
    setMobileMenuOpen(false);
    setShowMobileSearch(false);
    navigate(listingSearchUrl(isLogged, { search: searchValue }));
  };

  const handleHome = () => {
    setMobileMenuOpen(false);
    navigate(isLogged ? "/landing-login" : "/");
  };

  const handleBrowseListings = () => {
    const el = document.getElementById("new-arrivals");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const goToAllListings = () => navigate(isLogged ? "/listings-login" : "/listings");
  const goToCreateListing = () => navigate(isLogged ? "/create-listing-login" : "/create-listing");

  const handleCategoryClick = (category) => {
    navigate(listingSearchUrl(isLogged, { category }));
  };

  const goToProduct = (listingId) => {
    navigate(isLogged ? "/product-login" : "/product", { state: { listingId } });
  };

  // -------- FETCH NEWEST 3 LISTINGS FOR "NEW ARRIVALS" --------
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listings`);
        if (!res.ok) {
          throw new Error("Failed to load listings");
        }
        const data = await res.json();

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        setNewArrivals(sorted.slice(0, 3));
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setNewArrivals([]);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="shop bg-white dark:bg-[#0f0f11] text-black dark:text-white min-h-screen flex flex-col transition-colors">
      <main className="flex-1">
        {/* HERO */}
        <section className="relative w-full min-h-[540px] md:min-h-[620px] lg:min-h-[660px] flex flex-col">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${image1})`,
              backgroundPosition: "center bottom",
            }}
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

          {/* NAV + HERO CONTENT */}
          <div className="relative z-10 w-[92%] max-w-[1300px] mx-auto flex-1 flex flex-col justify-between py-6">
            {/* NAV BAR */}
            <div className="flex items-center justify-between w-full">
              {/* Left: Back + Logo */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate(isLogged ? "/landing-login" : "/landing")}
                  className="cursor-pointer transition-transform hover:scale-110 p-1"
                  aria-label="Back"
                >
                  <img src={BackButton} alt="Back" className="w-5 h-5 sm:w-6 sm:h-6 invert" />
                </button>

                <button
                  type="button"
                  onClick={handleHome}
                  className="flex items-baseline gap-0 cursor-pointer"
                >
                  <span className="text-[#c90202] font-subheading text-2xl sm:text-3xl">Thapar</span>
                  <span className="text-white font-subheading text-2xl sm:text-3xl">Kart</span>
                </button>
              </div>

              {/* Right Desktop Nav */}
              <div className="hidden md:flex items-center gap-4 lg:gap-6">
                <button
                  type="button"
                  onClick={handleHome}
                  className="font-body-text text-white hover:text-[#ffdddd] transition-colors"
                >
                  Home
                </button>

                {/* Desktop Search bar */}
                <div className="flex w-[260px] lg:w-[340px] items-center justify-between px-4 py-2 rounded-full border border-white/40 bg-white/10 backdrop-blur-xs focus-within:border-white transition">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search"
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/70 text-sm"
                  />
                  <button type="button" onClick={handleSearch} className="p-0.5">
                    <HealthiconsMagnifyingGlassOutline className="w-5 h-5 invert" />
                  </button>
                </div>

                {isLogged ? (
                  <button
                    type="button"
                    onClick={() => navigate("/my-account/orders")}
                    className="font-body-text text-white hover:text-[#ffdddd] transition-colors"
                  >
                    Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-body-text text-white hover:text-[#ffdddd] transition-colors"
                  >
                    Login
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate(isLogged ? "/about-login" : "/about")}
                  className="px-5 py-2.5 bg-white/15 border border-white/60 rounded-full shadow-button-shadow hover:bg-white/25 transition-all font-medium text-sm text-white"
                >
                  Contact Us
                </button>

                {/* Dark Mode toggle */}
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? (
                    <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Mobile controls */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMobileSearch((prev) => !prev)}
                  className="p-2 rounded-full text-white hover:bg-white/10 transition"
                  aria-label="Toggle search"
                >
                  <HealthiconsMagnifyingGlassOutline className="w-5 h-5 invert" />
                </button>

                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full border border-white/30 bg-white/10 text-white"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? (
                    <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="p-2 rounded-lg text-white hover:bg-white/10 transition"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile search input */}
            {showMobileSearch && (
              <div className="md:hidden mt-4 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 animate-fadeIn">
                <div className="flex items-center px-4 py-2 rounded-full border border-white/40 bg-white/10">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search listings..."
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/70 text-sm"
                    autoFocus
                  />
                  <button type="button" onClick={handleSearch} className="p-1">
                    <HealthiconsMagnifyingGlassOutline className="w-5 h-5 invert" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile menu drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-start">
                <div className="bg-[#18181b] border-b border-neutral-800 p-6 flex flex-col gap-4 shadow-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <span className="font-bold text-lg text-white">Menu</span>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 text-white hover:opacity-75"
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleHome}
                    className="text-left py-2 font-medium text-lg text-white hover:text-[#c90202] transition"
                  >
                    Home
                  </button>
                  {isLogged ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/my-account/orders");
                      }}
                      className="text-left py-2 font-medium text-lg text-white hover:text-[#c90202] transition"
                    >
                      Account
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/login");
                      }}
                      className="text-left py-2 font-medium text-lg text-white hover:text-[#c90202] transition"
                    >
                      Login
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(isLogged ? "/about-login" : "/about");
                    }}
                    className="w-full py-3 mt-2 bg-white text-black font-semibold rounded-full shadow-button-shadow"
                  >
                    Contact Us
                  </button>
                </div>
                <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
              </div>
            )}

            {/* Hero text */}
            <div className="flex flex-col items-center justify-center text-center py-12 md:py-16">
              <h1 className="font-semibold leading-tight text-white max-w-[900px] text-3xl sm:text-5xl md:text-6xl lg:text-[70px]">
                <span className="text-[#c90202]">Thapar</span>
                <span className="text-white">Kart Marketplace</span>
              </h1>

              <p className="mt-4 text-neutral-200 max-w-[720px] text-sm sm:text-base md:text-lg px-2">
                Discover, buy, and sell items across the Thapar campus — quick,
                safe, and zero fee.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                <button
                  type="button"
                  onClick={handleBrowseListings}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-black/75 backdrop-blur-xs text-white border border-white/20 hover:bg-black/90 hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-base shadow-button-shadow cursor-pointer"
                >
                  Browse Listings
                </button>

                <button
                  type="button"
                  onClick={goToCreateListing}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-white/90 text-black hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-base shadow-button-shadow cursor-pointer"
                >
                  Create a Listing
                </button>
              </div>
            </div>
            <div />
          </div>
        </section>

        {/* FEATURED DEALS + JUST LISTED */}
        <section className="w-[92%] max-w-[1300px] mx-auto pt-10 pb-12 md:pb-16">
          <div className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2">
            {/* Featured Deals */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="w-full h-[200px] sm:h-[240px] md:h-[260px] overflow-hidden">
                <img
                  src={image8}
                  alt="Featured Deals"
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>

              <div className="p-6 flex flex-col gap-2">
                <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
                  Featured Deals
                </h2>
                <p className="text-sm md:text-base text-[#828282] dark:text-neutral-400">
                  Handpicked popular items from verified students.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={goToAllListings}
                    className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium shadow-button-shadow cursor-pointer hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
                  >
                    View All
                  </button>
                  <button
                    type="button"
                    onClick={goToCreateListing}
                    className="px-5 py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-sm font-medium shadow-button-shadow cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                  >
                    Post Your Listing
                  </button>
                </div>
              </div>
            </div>

            {/* Just Listed */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="w-full h-[200px] sm:h-[240px] md:h-[260px] overflow-hidden">
                <img
                  src={image10}
                  alt="Just Listed"
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>

              <div className="p-6 flex flex-col gap-2">
                <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
                  Just Listed
                </h2>
                <p className="text-sm md:text-base text-[#828282] dark:text-neutral-400">
                  Freshly posted items — act fast before they’re gone.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={goToAllListings}
                    className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium shadow-button-shadow cursor-pointer hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEW ARRIVALS – DYNAMIC FROM BACKEND */}
        <section
          id="new-arrivals"
          className="w-[92%] max-w-[1300px] mx-auto pt-4 md:pt-6 pb-16 md:pb-20"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black dark:text-white">
            New Arrivals
          </h2>

          {newArrivals.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
              No new listings yet. Check back soon!
            </p>
          ) : (
            <div className="mt-6 grid gap-8 lg:grid-cols-3 items-start">
              {/* Big left card for newest listing */}
              <div className="lg:col-span-2">
                {newArrivals[0] && (
                  <div
                    className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer"
                    onClick={() => goToProduct(newArrivals[0].id || newArrivals[0]._id)}
                  >
                    <div className="w-full h-[240px] sm:h-[320px] lg:h-[400px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={
                          Array.isArray(newArrivals[0].imageUrls) &&
                          newArrivals[0].imageUrls[0]
                            ? newArrivals[0].imageUrls[0]
                            : "/background.png"
                        }
                        alt={newArrivals[0].title || "New arrival"}
                        className="w-full h-full object-cover transition-transform hover:scale-102 duration-300"
                      />
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col gap-1.5">
                      <p className="text-lg sm:text-xl font-semibold text-black dark:text-white line-clamp-1">
                        {newArrivals[0].title || "Untitled item"}
                      </p>
                      <p className="text-sm sm:text-base text-[#828282] dark:text-neutral-400 line-clamp-2">
                        {newArrivals[0].description || ""}
                      </p>
                      <p className="mt-2 text-lg sm:text-xl text-[#c90202] font-bold">
                        ₹{newArrivals[0].price}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column – next 2 listings */}
              <div className="flex flex-col gap-6">
                {newArrivals.slice(1, 3).map((item) => (
                  <div
                    key={item._id || item.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer"
                    onClick={() => goToProduct(item.id || item._id)}
                  >
                    <div className="w-full h-[160px] sm:h-[180px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={
                          Array.isArray(item.imageUrls) && item.imageUrls[0]
                            ? item.imageUrls[0]
                            : "/background.png"
                        }
                        alt={item.title || "New arrival"}
                        className="w-full h-full object-cover transition-transform hover:scale-102 duration-300"
                      />
                    </div>

                    <div className="p-4 flex flex-col gap-1">
                      <p className="text-base font-semibold text-black dark:text-white line-clamp-1">
                        {item.title || "Untitled item"}
                      </p>
                      <p className="text-xs sm:text-sm text-[#828282] dark:text-neutral-400 line-clamp-2">
                        {item.description || ""}
                      </p>
                      <p className="mt-1 text-base text-[#c90202] font-bold">
                        ₹{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* EXPLORE CATEGORIES */}
        <section className="w-[92%] max-w-[1300px] mx-auto pb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black dark:text-white mb-8">
            Explore Categories
          </h2>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {/* Electronics */}
            <div
              onClick={() => handleCategoryClick("Electronics & Gadgets")}
              className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#c90202] dark:hover:border-[#c90202] transition-all cursor-pointer shadow-xs hover:shadow-md hover:translate-y-[-2px]"
            >
              <p className="text-xl sm:text-2xl mb-2 font-medium">📱 Electronics</p>
              <p className="text-[#828282] dark:text-neutral-400 text-xs sm:text-sm">
                Find laptops, earphones, and gadgets.
              </p>
            </div>

            {/* Books */}
            <div
              onClick={() => handleCategoryClick("Books & Notes")}
              className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#c90202] dark:hover:border-[#c90202] transition-all cursor-pointer shadow-xs hover:shadow-md hover:translate-y-[-2px]"
            >
              <p className="text-xl sm:text-2xl mb-2 font-medium">📚 Books &amp; Notes</p>
              <p className="text-[#828282] dark:text-neutral-400 text-xs sm:text-sm">
                Buy or sell used course materials.
              </p>
            </div>

            {/* Cycles */}
            <div
              onClick={() => handleCategoryClick("Cycles")}
              className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#c90202] dark:hover:border-[#c90202] transition-all cursor-pointer shadow-xs hover:shadow-md hover:translate-y-[-2px]"
            >
              <p className="text-xl sm:text-2xl mb-2 font-medium">🚲 Cycles</p>
              <p className="text-[#828282] dark:text-neutral-400 text-xs sm:text-sm">
                Pre-loved bikes for easy campus commute.
              </p>
            </div>

            {/* Essentials */}
            <div
              onClick={() => handleCategoryClick("Hostel Essentials")}
              className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#c90202] dark:hover:border-[#c90202] transition-all cursor-pointer shadow-xs hover:shadow-md hover:translate-y-[-2px]"
            >
              <p className="text-xl sm:text-2xl mb-2 font-medium">🏠 Essentials</p>
              <p className="text-[#828282] dark:text-neutral-400 text-xs sm:text-sm">
                All of your hostel essentials in one place.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export const ShopLogin = (props) => <Shop loggedIn={true} {...props} />;

export default Shop;