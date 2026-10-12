// src/pages/my account orders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/logout.js";
import { API_BASE_URL } from "../config/api.js";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { AccountSidebar } from "../components/AccountSidebar.jsx";
import { AccountTabs } from "../components/AccountTabs.jsx";

import editIcon from "../assets/icons/edit.svg";

import "../styles/My_Account_Orders.css";

export const MyAccountOrders = () => {
  const navigate = useNavigate();

  // Profile
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  // Editable name buffer
  const [nameDraft, setNameDraft] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  // Save button state
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);

  // Orders
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // navigation
  const handleLogout = () => logout(API_BASE_URL, navigate);
  const handleAdminDashboard = () => navigate("/admin");
  const handleReservations = () => navigate("/reservation");
  const handleMyListings = () => navigate("/my-listing");

  // -------- FETCH PROFILE + ORDERS FROM BACKEND --------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profile`, {
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/orders`, {
            credentials: "include",
          }),
        ]);

        if (profileRes.status === 401 || ordersRes.status === 401) {
          navigate("/login");
          return;
        }

        if (!profileRes.ok) {
          throw new Error("Failed to fetch profile");
        }

        const profileData = await profileRes.json();
        const rawOrders = ordersRes.ok ? await ordersRes.json() : [];

        const list = Array.isArray(rawOrders)
          ? rawOrders
          : Array.isArray(rawOrders.orders)
          ? rawOrders.orders
          : [];

        // 🔹 Map orders so we have listing title as order name
        const mappedOrders = list.map((order) => ({
          id: order._id,
          status: order.status || "Reserved",
          title:
            (order.listing && order.listing.title) || "Listing",
          price:
            typeof order.priceAtReservation === "number" && Number.isFinite(order.priceAtReservation)
              ? order.priceAtReservation
              : null,
        }));

        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
        });
        setNameDraft(profileData.name || "");
        setOrders(mappedOrders);
      } catch (err) {
        console.error("Error fetching profile/orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // -------- SAVE NAME TO BACKEND --------
  const handleSave = async () => {
    if (!profileDirty) return;

    try {
      setSaving(true);
      setIsSaved(false);

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: nameDraft }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      setProfile((prev) => ({
        ...prev,
        name: nameDraft,
      }));

      setIsEditingName(false);
      setIsSaved(true);
      setProfileDirty(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] text-gray-900 dark:text-neutral-100 min-h-screen flex flex-col transition-colors">
      {/* -------- HEADER -------- */}
      <Header loggedIn={true} showBack={true} />

      {/* -------- BODY LAYOUT -------- */}
      <main className="w-[92%] sm:w-[90%] max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 py-6 sm:py-10 flex-1">
        {/* LEFT SIDEBAR */}
        <AccountSidebar
          className="w-full lg:w-[35%] lg:max-w-[340px] shrink-0 bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-6 border border-transparent dark:border-neutral-800"
          loading={loading}
          profile={profile}
          onLogout={handleLogout}
          onAdminDashboard={handleAdminDashboard}
          onReservations={handleReservations}
          onMyListings={handleMyListings}
        />

        {/* RIGHT CONTENT AREA */}
        <section className="flex-1 bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-2xl shadow-md p-5 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">My Profile</h1>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Update personal information and view activity
              </p>
            </div>

            {/* Save – pill button, only active when name changed */}
            <button
              onClick={handleSave}
              disabled={!profileDirty || saving}
              className={`px-6 py-3 rounded-[999px] shadow-button-shadow flex items-center justify-center text-sm font-medium transition-transform transition-colors self-start sm:self-auto ${
                profileDirty && !saving
                  ? "bg-[#d21b1b] text-white cursor-pointer hover:bg-[#b61616] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-[#f6d0d0] dark:bg-neutral-800 text-[#7a1b1b] dark:text-neutral-500 cursor-default opacity-90"
              }`}
            >
              {saving
                ? "Saving..."
                : isSaved && !profileDirty
                ? "Saved"
                : "Save"}
            </button>
          </div>

          {/* Personal details */}
          <div className="mt-6">
            <h2 className="font-semibold mb-3 text-gray-900 dark:text-white">Personal Details</h2>

            {/* Both inputs same width and height */}
            <div className="flex flex-col gap-4 max-w-md w-full">
              {/* Name input (only editable after clicking pencil) */}
              <div className="flex items-center gap-2 w-full">
                <input
                  value={nameDraft}
                  onChange={(e) => {
                    setNameDraft(e.target.value);
                    setIsSaved(false);
                    setProfileDirty(true);
                  }}
                  disabled={!isEditingName}
                  className={`w-full h-[42px] border border-[#0000001a] dark:border-neutral-700 rounded-lg px-4 py-2 text-sm outline-none transition ${
                    !isEditingName
                      ? "bg-[#f7f7f7] dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 cursor-not-allowed"
                      : "bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:border-[#c90202]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(true);
                    setIsSaved(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition shrink-0"
                >
                  <img src={editIcon} className="w-4 h-4 dark:invert" alt="edit name" />
                </button>
              </div>

              {/* Email (non-editable, same height as name) */}
              <input
                value={profile.email}
                readOnly
                className="w-full h-[42px] border border-[#0000001a] dark:border-neutral-700 rounded-lg px-4 py-2 text-sm bg-[#f7f7f7] dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* TABS */}
          <AccountTabs activeTab="orders" />

          {/* ORDERS LIST */}
          <div className="mt-6 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">Your Orders & Reservations</h2>
              <button
                type="button"
                onClick={handleReservations}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-black dark:border-neutral-400 text-black dark:text-neutral-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                Manage Reservations
              </button>
            </div>
            {loading ? (
              <p className="text-xs text-gray-500 dark:text-neutral-400">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-neutral-400">No orders yet.</p>
            ) : (
              orders.map((order, i) => (
                <div
                  key={order.id || i}
                  className="border border-[#0000001a] dark:border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fff9ef] dark:hover:bg-neutral-800/60 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center shrink-0 text-2xl">
                      📦
                    </div>
                    <div className="min-w-0">
                      {/* 🔹 Listing name as the main line */}
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {order.title || "Listing"}
                      </p>
                      {/* Order id + status below */}
                      <p className="text-xs text-gray-500 dark:text-neutral-400">
                        #{order.id || "—"} · {order.status || ""}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                        {order.price != null ? `₹${order.price.toLocaleString("en-IN")}` : "Original price unavailable"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReservations}
                    className="self-start sm:self-auto shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-black dark:border-neutral-400 text-black dark:text-neutral-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  >
                    View Status
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* -------- FOOTER -------- */}
      <Footer />
    </div>
  );
};

export default MyAccountOrders;
