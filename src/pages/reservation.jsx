import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL, getAuthHeaders } from "../config/api.js";

import "../styles/Reservation.css";

export const Reservation = () => {
  const navigate = useNavigate();

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
        headers: { ...getAuthHeaders() },
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
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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

  const handleChat = async (item) => {
    if (busyRef.current || !item.person?._id) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/start`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
    <div className="bg-white dark:bg-[#121212] text-gray-900 dark:text-neutral-100 min-h-screen flex flex-col transition-colors">
      {/* -------- HEADER -------- */}
      <Header loggedIn={true} showBack={true} />

      {/* -------- MAIN CONTENT -------- */}
      <main className="w-[92%] sm:w-[90%] max-w-7xl mx-auto flex-1 py-6 sm:py-10">
        {/* Heading section */}
        <section className="mb-8">
          <h1 className="font-semibold text-2xl md:text-3xl mb-2 text-[#0d1b2a] dark:text-white">
            {view === "selling" ? "Requests for My Listings" : "My Reserved Items"}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-neutral-400 max-w-xl">
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
                className={`px-4 py-2 rounded-full border text-sm font-medium transition disabled:opacity-50 ${
                  view === value
                    ? "bg-black dark:bg-[#c90202] text-white border-black dark:border-[#c90202]"
                    : "bg-white dark:bg-neutral-800 text-black dark:text-neutral-200 border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700"
                }`}>
                {label}
              </button>
            ))}
            <button type="button" disabled={busy || loading} onClick={() => fetchOrders()}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-neutral-200 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 transition disabled:opacity-50">
              Refresh
            </button>
          </div>
          {error && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>}
        </section>

        {/* Reservations grid */}
        <section className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Loading your reservations...
            </p>
          ) : error && currentReservations.length === 0 ? null : currentReservations.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-neutral-400 col-span-full">
              {view === "selling" ? "You have no reservation requests yet." : "You have no reservations yet."}
            </p>
          ) : (
            currentReservations.map((item) => (
              <article
                key={item.id}
                className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-2xl shadow-md overflow-hidden flex flex-col hover:scale-[1.01] transition-transform"
              >
                {/* Listing image area */}
                <div className="w-full h-44 sm:h-48 bg-[#f2f2f2] dark:bg-neutral-800 overflow-hidden">
                  <img
                    src={item.image || "/background.png"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Text + button */}
                <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 gap-3">
                  {/* Status pill */}
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium self-start ${
                      item.status === "Awaiting Seller Confirmation"
                        ? "bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200"
                        : item.status === "Pending Pickup"
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200"
                        : item.status === "Cancelled"
                        ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                        : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300"
                    }`}
                  >
                    {item.status}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm md:text-base line-clamp-1 text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      {item.price != null && (
                        <span className="font-semibold text-sm shrink-0 text-gray-900 dark:text-white">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {view === "selling" ? "Reserved by" : "Sold by"} {item.person?.name || item.person?.email || "User unavailable"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleChat(item)}
                      disabled={busy || !item.person?._id}
                      className="inline-flex w-full justify-center items-center px-4 py-2.5 rounded-[999px] bg-black dark:bg-[#c90202] text-white text-sm font-medium shadow-button-shadow hover:bg-[#1a1a1a] dark:hover:bg-[#b00202] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors disabled:opacity-50"
                    >
                      Chat with {view === "selling" ? "Buyer" : "Seller"}
                    </button>
                    {view === "selling" && item.orderStatus === "Reserved" && (
                      <button type="button" disabled={busy} onClick={() => changeStatus(item, "confirm")}
                        className="w-full px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium disabled:opacity-50 hover:opacity-90 transition">Confirm reservation</button>
                    )}
                    {view === "selling" && item.orderStatus === "Pending Pickup" && (
                      <button type="button" disabled={busy} onClick={() => changeStatus(item, "complete")}
                        className="w-full px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium disabled:opacity-50 hover:opacity-90 transition">Mark pickup complete</button>
                    )}
                    {["Reserved", "Pending Pickup"].includes(item.orderStatus) && (
                      <button type="button" disabled={busy} onClick={() => changeStatus(item, "cancel")}
                        className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 transition disabled:opacity-50">Cancel reservation</button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <section className="mt-10 flex justify-center">
            <div className="flex items-center gap-2 sm:gap-3 text-sm md:text-base">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 sm:px-5 py-2 rounded-full border border-[#d1d5db] dark:border-neutral-700 ${
                  currentPage === 1
                    ? "text-gray-400 dark:text-neutral-600 cursor-default"
                    : "text-gray-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
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
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#d1d5db] dark:border-neutral-700 flex items-center justify-center font-medium ${
                      page === currentPage
                        ? "bg-[#111827] dark:bg-[#c90202] text-white"
                        : "text-[#111827] dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
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
                className={`px-3 sm:px-5 py-2 rounded-full border border-[#d1d5db] dark:border-neutral-700 ${
                  currentPage === totalPages
                    ? "text-gray-400 dark:text-neutral-600 cursor-default"
                    : "text-gray-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
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
