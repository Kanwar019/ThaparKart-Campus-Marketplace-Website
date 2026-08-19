// src/pages/reservation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import divider from "../assets/divider.svg";
import magnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

import "../styles/Reservation.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Reservation = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const RESERVATIONS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  // -------- FETCH ORDERS FROM BACKEND --------
  useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        credentials: "include",
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch reservations");
      }

      const raw = await res.json();
      console.log("Orders API response:", raw);

      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.orders)
        ? raw.orders
        : [];

      const mapped = arr.map((order) => {
        const listing = order.listing || {};

        const sellerName =
          listing.sellerName ||
          (listing.user &&
            (listing.user.name || listing.user.email)) ||
          "Seller";

        let statusLabel = "Reserved";
        if (order.status === "Reserved") {
          statusLabel = "Awaiting Seller Confirmation";
        } else if (
          order.status === "Pending Pickup" ||
          order.status === "Confirmed"
        ) {
          statusLabel = "Pending Pickup";
        } else if (order.status === "Cancelled") {
          statusLabel = "Cancelled";
        }

        return {
          id: order._id,
          status: statusLabel,
          title: listing.title || "Listing",
          seller: sellerName,
        };
      });

      setReservations(mapped);
    } catch (err) {
      console.error("Error loading reservations:", err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, [navigate]);


  const totalPages = Math.ceil(reservations.length / RESERVATIONS_PER_PAGE);

  const indexOfFirst = (currentPage - 1) * RESERVATIONS_PER_PAGE;
  const currentReservations = reservations.slice(
    indexOfFirst,
    indexOfFirst + RESERVATIONS_PER_PAGE
  );

  const handleBack = () => navigate(-1);
  const handleGoHome = () => navigate("/landing-login");
  const handleContact = () => navigate("/about-login");
  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

  const handleChat = () => {
    navigate("/chat");
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* -------- HEADER -------- */}
      <header className="w-full h-[140px] bg-white flex items-center">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Left: Back + Logo (like other logged-in pages) */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img src={BackButton} alt="Back" className="w-6 h-6" />
            </button>

            <div
              className="cursor-pointer select-none"
              onClick={handleGoHome}
            >
              <span className="text-[#c90202] font-subheading">Thapar</span>
              <span className="text-black font-subheading">Kart</span>
            </div>
          </div>

          {/* Right: Nav */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleGoHome}
              className="font-body-text text-black hover:text-[#c90202] transition"
            >
              Home
            </button>

            {/* Search */}
            <div className="hidden sm:flex w-[300px] px-4 py-2 rounded-full border border-[#0000001a]">
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 bg-transparent outline-none text-black placeholder:text-[#444]"
              />
              <button type="button" onClick={handleSearch}>
                <img
                  src={magnifyingGlassIcon}
                  className="w-5 cursor-pointer"
                  alt="search"
                />
              </button>
            </div>

            <button
              onClick={handleContact}
              className="px-6 py-3 bg-black text-white rounded-full hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition shadow-button-shadow"
            >
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* -------- MAIN CONTENT -------- */}
      <main className="w-[90%] mx-auto flex-1 py-10">
        {/* Heading section */}
        <section className="mb-8">
          <h1 className="font-semibold text-2xl md:text-3xl mb-2">
            My Reserved Items
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-xl">
            Here are the items you&apos;ve reserved. Contact the seller to
            arrange pickup.
          </p>
        </section>

        {/* Reservations grid */}
        <section className="grid gap-6 md:gap-8 md:grid-cols-3">
          {loading ? (
            <p className="text-sm text-gray-500">
              Loading your reservations...
            </p>
          ) : currentReservations.length === 0 ? (
            <p className="text-sm text-gray-500">
              You have no reservations yet.
            </p>
          ) : (
            currentReservations.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:scale-[1.01] transition-transform"
              >
                {/* Placeholder image area */}
                <div className="w-full h-40 bg-[#f2f2f2]" />

                {/* Text + button */}
                <div className="flex-1 flex flex-col justify-between p-4 gap-3">
                  {/* Status pill */}
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Awaiting Seller Confirmation"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "Pending Pickup"
                        ? "bg-blue-100 text-blue-800"
                        : item.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-sm md:text-base">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sold by {item.seller}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleChat}
                    className="mt-2 inline-flex w-full justify-center items-center px-4 py-2 rounded-[999px] bg-black text-white text-sm shadow-button-shadow hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
                  >
                    Chat with Seller
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <section className="mt-10 flex justify-center">
            <div className="flex items-center gap-3 text-sm md:text-base">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 md:px-5 py-2 rounded-full border border-[#d1d5db] ${
                  currentPage === 1
                    ? "text-gray-400 cursor-default"
                    : "text-gray-800 hover:bg-gray-50 cursor-pointer"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#d1d5db] flex items-center justify-center ${
                      page === currentPage
                        ? "bg-[#111827] text-white"
                        : "text-[#111827] bg-white hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 md:px-5 py-2 rounded-full border border-[#d1d5db] ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-default"
                    : "text-gray-800 hover:bg-gray-50 cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
          </section>
        )}
      </main>

      {/* -------- FOOTER -------- */}
      <footer className="bg-white py-10 relative">
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

export default Reservation;
