// src/pages/reservation.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

import magnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL } from "../config/api.js";

import "../styles/Reservation.css";
import { listingSearchUrl } from "../utils/listingSearch.js";

export const Reservation = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const RESERVATIONS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const [view, setView] = useState("buying");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const requestId = useRef(0);

  const fetchOrders = useCallback(async ({ signal, clearError = true } = {}) => {
    const request = ++requestId.current;
    setLoading(true);
    if (clearError) setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders${view === "selling" ? "/selling" : ""}`, {
        credentials: "include", signal,
      });
      if (response.status === 401) { navigate("/login"); return; }
      if (!response.ok) throw new Error("Could not load reservations. Please refresh.");
      const orders = await response.json();
      if (!Array.isArray(orders)) throw new Error("Could not load reservations. Please refresh.");
      if (request === requestId.current && !signal?.aborted) {
        setReservations(orders);
        setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil(orders.length / RESERVATIONS_PER_PAGE))));
      }
    } catch (failure) {
      if (request === requestId.current && !signal?.aborted) {
        setError(failure.message);
        setReservations([]);
      }
    } finally {
      if (request === requestId.current && !signal?.aborted) setLoading(false);
    }
  }, [view, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchOrders]);

  const changeStatus = async (item, action) => {
    if (busyRef.current) return;
    if (action === "complete" && !window.confirm("Confirm that this item has been collected?")) return;
    if (action === "cancel" && !window.confirm("Cancel this reservation and make the item available again?")) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${item.id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, expectedStatus: item.orderStatus }),
      });
      if (response.status === 401) { navigate("/login"); return; }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409) await fetchOrders({ clearError: false });
        throw new Error(result.message || "Could not update the reservation. Please refresh before retrying.");
      }
      setReservations((orders) => orders.map((order) =>
        order._id === item.id ? { ...order, status: result.status } : order));
    } catch (failure) {
      setError(failure.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const totalPages = Math.ceil(reservations.length / RESERVATIONS_PER_PAGE);

  const indexOfFirst = (currentPage - 1) * RESERVATIONS_PER_PAGE;
  const currentReservations = reservations.slice(
    indexOfFirst,
    indexOfFirst + RESERVATIONS_PER_PAGE
  ).map((order) => ({
    id: order._id,
    orderStatus: order.status,
    status: order.status === "Reserved" ? "Awaiting Seller Confirmation" : order.status,
    title: order.listing?.title || "Listing",
    image: Array.isArray(order.listing?.imageUrls) && order.listing.imageUrls[0]
      ? order.listing.imageUrls[0]
      : "/background.png",
    price: typeof order.priceAtReservation === "number" ? order.priceAtReservation : order.listing?.price,
    person: view === "selling" ? order.buyer : order.listing?.user,
  }));

  const handleBack = () => navigate(-1);
  const handleGoHome = () => navigate("/landing-login");
  const handleContact = () => navigate("/about-login");
  const handleSearch = () => {
    navigate(listingSearchUrl(true, { search: searchValue }));
  };

  const handleChat = async (item) => {
    if (busyRef.current || !item.person?._id) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/start`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: item.person._id }),
      });
      if (response.status === 401) { navigate("/login"); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not open this conversation.");
      navigate("/chat", { state: { conversationId: result.conversationId } });
    } catch (failure) {
      setError(failure.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
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
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
            {view === "selling" ? "Requests for My Listings" : "My Reserved Items"}
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-xl">
            {view === "selling" ? "Confirm reservations and mark items complete after pickup."
              : "Here are the items you've reserved. Contact the seller to arrange pickup."}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {[["buying", "My reservations"], ["selling", "Requests for my listings"]].map(([value, label]) => (
              <button key={value} type="button" disabled={busy} aria-pressed={view === value}
                onClick={() => {
                  if (view === value) return;
                  setView(value); setCurrentPage(1); setReservations([]); setLoading(true);
                }}
                className={`px-4 py-2 rounded-full border text-sm disabled:opacity-50 ${view === value ? "bg-black text-white" : "bg-white text-black"}`}>
                {label}
              </button>
            ))}
            <button type="button" disabled={busy || loading} onClick={() => fetchOrders()}
              className="px-4 py-2 rounded-full border text-sm disabled:opacity-50">Refresh</button>
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        </section>

        {/* Reservations grid */}
        <section className="grid gap-6 md:gap-8 md:grid-cols-3">
          {loading ? (
            <p className="text-sm text-gray-500">
              Loading your reservations...
            </p>
          ) : error && currentReservations.length === 0 ? null : currentReservations.length === 0 ? (
            <p className="text-sm text-gray-500">
              {view === "selling" ? "You have no reservation requests yet." : "You have no reservations yet."}
            </p>
          ) : (
            currentReservations.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:scale-[1.01] transition-transform"
              >
                {/* Listing image area */}
                <div className="w-full h-40 bg-[#f2f2f2] overflow-hidden">
                  <img
                    src={item.image || "/background.png"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

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
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm md:text-base line-clamp-1">
                        {item.title}
                      </p>
                      {item.price != null && (
                        <span className="font-semibold text-sm shrink-0">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {view === "selling" ? "Reserved by" : "Sold by"} {item.person?.name || item.person?.email || "User unavailable"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChat(item)}
                    disabled={busy || !item.person?._id}
                    className="mt-2 inline-flex w-full justify-center items-center px-4 py-2 rounded-[999px] bg-black text-white text-sm shadow-button-shadow hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
                  >
                    Chat with {view === "selling" ? "Buyer" : "Seller"}
                  </button>
                  {view === "selling" && item.orderStatus === "Reserved" && (
                    <button type="button" disabled={busy} onClick={() => changeStatus(item, "confirm")}
                      className="w-full px-4 py-2 rounded-full bg-black text-white text-sm disabled:opacity-50">Confirm reservation</button>
                  )}
                  {view === "selling" && item.orderStatus === "Pending Pickup" && (
                    <button type="button" disabled={busy} onClick={() => changeStatus(item, "complete")}
                      className="w-full px-4 py-2 rounded-full bg-black text-white text-sm disabled:opacity-50">Mark pickup complete</button>
                  )}
                  {["Reserved", "Pending Pickup"].includes(item.orderStatus) && (
                    <button type="button" disabled={busy} onClick={() => changeStatus(item, "cancel")}
                      className="w-full px-4 py-2 rounded-full border border-gray-300 text-sm disabled:opacity-50">Cancel reservation</button>
                  )}
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
      <Footer />
    </div>
  );
};

export default Reservation;
