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
import "../styles/Shop.css";
import { listingSearchUrl } from "../utils/listingSearch.js";

const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const Shop = ({ loggedIn }) => {
  const [searchValue, setSearchValue] = useState("");
  const [newArrivals, setNewArrivals] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isLogged = loggedIn ?? (location?.pathname.includes("-login") || false);

  const handleSearch = () => {
    navigate(listingSearchUrl(isLogged, { search: searchValue }));
  };

  const handleHome = () => {
    navigate(isLogged ? "/landing-login" : "/");
  };

  const handleBrowseListings = () => {
    const el = document.getElementById("new-arrivals");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const goToAllListings = () => navigate(isLogged ? "/listings-login" : "/listings");
  const goToCreateListing = () => navigate(isLogged ? "/create-listing-login" : "/create-listing");

  // Category click → listings page with selected category
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

        // sort newest first by createdAt and take top 3
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
    <div className="shop bg-white min-h-screen flex flex-col">
      {/* Back button */}
      <div className="fixed top-6 left-6 z-30">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer transition-transform hover:scale-[1.10]"
        >
          <img src={BackButton} alt="Back" className="w-6 h-6 invert" />
        </button>
      </div>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative w-full h-[520px] md:h-[600px] lg:h-[640px]">
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${image1})`,
              backgroundPosition: "center bottom",
            }}
          />
          <div className="absolute inset-0 bg-black/55" />

          {/* NAV + HERO */}
          <div className="relative z-10 w-[90%] max-w-[1200px] mx-auto h-full flex flex-col">
            {/* NAV */}
            <div className="pt-6 flex items-center justify-between w-full">
              {/* Logo */}
              <button
                type="button"
                onClick={handleHome}
                className="flex items-baseline gap-0 cursor-pointer"
              >
                <span className="text-[#c90202] font-subheading">Thapar</span>
                <span className="text-white font-subheading">Kart</span>
              </button>

              {/* Right nav */}
              <div className="flex items-center gap-4 lg:gap-8">
                <button
                  type="button"
                  onClick={handleHome}
                  className="font-body-text text-white hover:text-[#ffdddd] transition-colors"
                >
                  Home
                </button>

                {/* Search bar */}
                <div className="hidden sm:flex w-[260px] md:w-[320px] lg:w-[360px] items-center justify-between px-4 py-2 rounded-[999px] border border-white/80 bg-white/5">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search"
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/70"
                  />
                  <button type="button" onClick={handleSearch}>
                    <HealthiconsMagnifyingGlassOutline className="w-5 h-5 invert" />
                  </button>
                </div>

                {isLogged ? (
                  <button
                    type="button"
                    onClick={() => navigate("/my-account/orders")}
                    className="font-body-text text-white hover:text-[#ffdddd]"
                  >
                    Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-body-text text-white hover:text-[#ffdddd]"
                  >
                    Login
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate(isLogged ? "/about-login" : "/about")}
                  className="px-6 py-3.5 bg-white/10 border border-white rounded-[999px] shadow-button-shadow hover:bg-white/20 transition-all"
                >
                  <span className="text-white">Contact Us</span>
                </button>
              </div>
            </div>

            {/* Hero text */}
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
              <h1 className="font-semibold leading-tight text-white max-w-[900px] text-[32px] sm:text-[42px] md:text-[56px] lg:text-[70px]">
                <span className="text-[#c90202]">Thapar</span>
                <span className="text-white">Kart Marketplace</span>
              </h1>

              <p className="mt-4 text-white max-w-[720px]">
                Discover, buy, and sell items across the Thapar campus — quick,
                safe, and zero fee.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBrowseListings}
                  className="px-8 py-4 rounded-[999px] bg-black/70 text-white hover:bg-black/85 hover:scale-[1.03] transition-transform"
                >
                  Browse Listings
                </button>

                <button
                  onClick={goToCreateListing}
                  className="px-8 py-4 rounded-[999px] bg-black/70 text-white hover:bg-black/85 hover:scale-[1.03] transition-transform"
                >
                  Create a Listing
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED DEALS + JUST LISTED */}
        <section className="w-[90%] max-w-[1200px] mx-auto pt-10 pb-12 md:pb-16">
          <div className="grid gap-8 md:gap-10 md:grid-cols-2">
            {/* Featured Deals */}
            <div>
              <div className="rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
                <div className="w-full h-[210px] sm:h-[230px] md:h-[250px] lg:h-[260px]">
                  <img
                    src={image8}
                    alt="Featured Deals"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="px-5 md:px-6 py-5 flex flex-col gap-2">
                <p className="text-xl md:text-[22px] font-semibold text-black">
                  Featured Deals
                </p>
                <p className="text-sm md:text-base text-[#828282]">
                  Handpicked popular items from verified students.
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={goToAllListings}
                    className="px-5 py-2 rounded-[20px] bg-black text-white text-sm md:text-base shadow-button-shadow cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                  >
                    View All
                  </button>
                  <button
                    type="button"
                    onClick={goToCreateListing}
                    className="px-5 py-2 rounded-[20px] bg-[#e6e6e6] text-black text-sm md:text-base shadow-button-shadow cursor-pointer hover:bg-[#d0d0d0] transition-colors"
                  >
                    Post Your Listing
                  </button>
                </div>
              </div>
            </div>

            {/* Just Listed */}
            <div>
              <div className="rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
                <div className="w-full h-[210px] sm:h-[230px] md:h-[250px] lg:h-[260px]">
                  <img
                    src={image10}
                    alt="Just Listed"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="px-5 md:px-6 py-5 flex flex-col gap-2">
                <p className="text-xl md:text-[22px] font-semibold text-black">
                  Just Listed
                </p>
                <p className="text-sm md:text-base text-[#828282]">
                  Freshly posted items — act fast before they’re gone.
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={goToAllListings}
                    className="px-5 py-2 rounded-[20px] bg-black text-white text-sm md:text-base shadow-button-shadow cursor-pointer hover:bg-[#1a1a1a] transition-colors"
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
          className="w-[90%] max-w-[1200px] mx-auto pt-4 md:pt-6 pb-16 md:pb-20"
        >
          <h2 className="text-3xl md:text-[40px] font-semibold text-black">
            New Arrivals
          </h2>

          {newArrivals.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No new listings yet. Check back soon!
            </p>
          ) : (
            <div className="mt-6 grid gap-10 sm:gap-12 lg:grid-cols-3 items-start">
              {/* Big left card for newest listing */}
              <div className="lg:col-span-2">
                {newArrivals[0] && (
                  <>
                    <div
                      className="rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-white overflow-hidden transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                      onClick={() =>
                        goToProduct(newArrivals[0].id || newArrivals[0]._id)
                      }
                    >
                      <div className="w-full h-[260px] sm:h-[320px] lg:h-[420px]">
                        <img
                          src={
                            Array.isArray(newArrivals[0].imageUrls) &&
                            newArrivals[0].imageUrls[0]
                              ? newArrivals[0].imageUrls[0]
                              : "/background.png"
                          }
                          alt={newArrivals[0].title || "New arrival"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        goToProduct(newArrivals[0].id || newArrivals[0]._id)
                      }
                      className="mt-3 px-1 text-left cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <p className="text-base md:text-lg font-medium text-black line-clamp-1">
                        {newArrivals[0].title || "Untitled item"}
                      </p>
                      <p className="mt-1 text-sm md:text-base text-[#828282] line-clamp-2">
                        {newArrivals[0].description || ""}
                      </p>
                      <p className="mt-2 text-sm md:text-base text-black font-medium">
                        ₹{newArrivals[0].price}
                      </p>
                    </button>
                  </>
                )}
              </div>

              {/* Right column – next 2 listings */}
              <div className="flex flex-col gap-6">
                {newArrivals.slice(1, 3).map((item) => (
                  <div key={item._id || item.id}>
                    <div
                      className="rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-white overflow-hidden transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                      onClick={() =>
                        goToProduct(item.id || item._id)
                      }
                    >
                      <div className="w-full h-[150px] md:h-[180px]">
                        <img
                          src={
                            Array.isArray(item.imageUrls) && item.imageUrls[0]
                              ? item.imageUrls[0]
                              : "/background.png"
                          }
                          alt={item.title || "New arrival"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        goToProduct(item.id || item._id)
                      }
                      className="mt-3 px-1 text-left cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <p className="text-base md:text-lg font-medium text-black line-clamp-1">
                        {item.title || "Untitled item"}
                      </p>
                      <p className="mt-1 text-sm md:text-base text-[#828282] line-clamp-2">
                        {item.description || ""}
                      </p>
                      <p className="mt-2 text-sm md:text-base text-black font-medium">
                        ₹{item.price}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* EXPLORE CATEGORIES */}
        <section className="w-[90%] max-w-[1200px] mx-auto pb-20">
          <h2 className="text-3xl md:text-[40px] font-semibold text-black mb-8">
            Explore Categories
          </h2>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              {/* Electronics */}
              <div>
                <p
                  onClick={() => handleCategoryClick("Electronics & Gadgets")}
                  className="text-2xl mb-1 cursor-pointer transition-all duration-200 hover:text-[#c90202] hover:scale-[1.03] inline-block"
                >
                  📱 Electronics
                </p>
                <p className="text-[#828282] text-sm md:text-base">
                  Find laptops, earphones, and gadgets.
                </p>
              </div>

              {/* Books */}
              <div>
                <p
                  onClick={() => handleCategoryClick("Books & Notes")}
                  className="text-2xl mb-1 cursor-pointer transition-all duration-200 hover:text-[#c90202] hover:scale-[1.03] inline-block"
                >
                  📚 Books &amp; Notes
                </p>
                <p className="text-[#828282] text-sm md:text-base">
                  Buy or sell used course materials.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Cycles */}
              <div>
                <p
                  onClick={() => handleCategoryClick("Cycles")}
                  className="text-2xl mb-1 cursor-pointer transition-all duration-200 hover:text-[#c90202] hover:scale-[1.03] inline-block"
                >
                  🚲 Cycles
                </p>
                <p className="text-[#828282] text-sm md:text-base">
                  Pre-loved bikes for easy campus commute.
                </p>
              </div>

              {/* Essentials */}
              <div>
                <p
                  onClick={() => handleCategoryClick("Hostel Essentials")}
                  className="text-2xl mb-1 cursor-pointer transition-all duration-200 hover:text-[#c90202] hover:scale-[1.03] inline-block"
                >
                  📆 Essentials
                </p>
                <p className="text-[#828282] text-sm md:text-base">
                  All of your hostel essentials in one place.
                </p>
              </div>
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