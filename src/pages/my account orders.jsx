// src/pages/my account orders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import divider from "../assets/divider.svg";
import magnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";
import avatarImg from "../assets/icons/avatar.svg";
import editIcon from "../assets/icons/edit.svg";

import "../styles/My_Account_Orders.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const MyAccountOrders = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

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
  const handleBack = () => navigate("/landing-login");
  const handleGoHome = () => navigate("/landing-login");
  const handleContact = () => navigate("/about-login");
  const handleLogout = () => navigate("/login");
  const handleAdminDashboard = () => navigate("/admin");
  const handleReservations = () => navigate("/reservation");
  const handleMyListings = () => navigate("/my-listing");

  // tabs
  const goListings = () => navigate("/my-account/listings");
  const goSecurity = () => navigate("/my-account/security");

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

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
            order.listing && typeof order.listing.price === "number"
              ? order.listing.price
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
    <div className="bg-white min-h-screen flex flex-col">
      {/* -------- HEADER -------- */}
      <header className="w-full h-[140px] bg-white flex items-center">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Left: Back + Logo (like ArticleWithLogin) */}
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
              className="px-6 py-3 bg-black text-white rounded-full hover:bg-[#1a1a1a] transition shadow-button-shadow"
            >
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* -------- BODY LAYOUT -------- */}
      <main className="w-[90%] mx-auto flex gap-8 py-10">
        {/* LEFT SIDEBAR */}
        <aside className="w-[35%] bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">
          {/* Profile */}
          <div className="flex flex-col gap-3">
            <img
              src={avatarImg}
              className="w-20 h-20 rounded-full"
              alt="avatar"
            />
            <h2 className="font-bold text-lg">
              {loading ? "Loading..." : profile.name || "—"}
            </h2>
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : profile.email || "—"}
            </p>
          </div>

          {/* Account Actions */}
          <div className="flex flex-col gap-4 text-sm">
            {/* Logout */}
            <div className="border border-[#0000001a] rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">Logout</p>
                <p className="text-xs text-gray-500">Sign out of this device</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[#0000001a] rounded-lg hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </div>

            {/* Admin */}
            <div className="border border-[#0000001a] rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">Admin Dashboard</p>
                <p className="text-xs text-gray-500">Check recent reports</p>
              </div>
              <button
                onClick={handleAdminDashboard}
                className="px-4 py-2 border border-[#0000001a] rounded-lg hover:bg-gray-100 transition"
              >
                Admin
              </button>
            </div>

            {/* Reservation */}
            <div className="border border-[#0000001a] rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">My Reservations</p>
                <p className="text-xs text-gray-500">Check your reservations</p>
              </div>
              <button
                onClick={handleReservations}
                className="px-4 py-2 border border-[#0000001a] rounded-lg hover:bg-gray-100 transition"
              >
                Check
              </button>
            </div>

            {/* My Listings – same style as others */}
            <div className="border border-[#0000001a] rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">My Listings</p>
                <p className="text-xs text-gray-500">Manage your listings</p>
              </div>
              <button
                onClick={handleMyListings}
                className="px-4 py-2 border border-[#0000001a] rounded-lg hover:bg-gray-100 transition"
              >
                Open
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <section className="flex-1 bg-white rounded-2xl shadow-md p-8">
          {/* Header */}
          <div className="flex justify-between">
            <div>
              <h1 className="font-bold text-lg">My Profile</h1>
              <p className="text-xs text-gray-500">
                Update personal information and view activity
              </p>
            </div>

            {/* Save – pill button, only active when name changed */}
            <button
              onClick={handleSave}
              disabled={!profileDirty || saving}
              className={`px-6 py-3.5 rounded-[999px] shadow-button-shadow flex items-center justify-center text-sm transition-transform transition-colors ${
                profileDirty && !saving
                  ? "bg-[#d21b1b] text-white cursor-pointer hover:bg-[#b61616] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-[#f6d0d0] text-[#7a1b1b] cursor-default opacity-90"
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
            <h2 className="font-semibold mb-3">Personal Details</h2>

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
                  className={`w-full h-[42px] border border-[#0000001a] rounded-lg px-4 py-2 text-sm ${
                    !isEditingName
                      ? "bg-[#f7f7f7] cursor-not-allowed"
                      : "bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(true);
                    setIsSaved(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition shrink-0"
                >
                  <img src={editIcon} className="w-4 h-4" alt="edit name" />
                </button>
              </div>

              {/* Email (non-editable, same height as name) */}
              <input
                value={profile.email}
                readOnly
                className="w-full h-[42px] border border-[#0000001a] rounded-lg px-4 py-2 text-sm bg-[#f7f7f7] cursor-not-allowed"
              />
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-4 border-b border-[#0000001a] py-3 mt-6 text-sm font-medium">
            {/* ACTIVE TAB - Orders */}
            <div className="px-4 py-2 border-b-2 border-[#c90202] text-[#c90202] cursor-default">
              Orders
            </div>

            <button
              onClick={goListings}
              className="px-4 py-2 hover:bg-gray-100 transition"
            >
              My Listings
            </button>

            <button
              onClick={goSecurity}
              className="px-4 py-2 hover:bg-gray-100 transition"
            >
              Security
            </button>
          </div>

          {/* ORDERS LIST */}
          <div className="mt-6 flex flex-col gap-3 text-sm">
            {loading ? (
              <p className="text-xs text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs text-gray-500">No orders yet.</p>
            ) : (
              orders.map((order, i) => (
                <div
                  key={order.id || i}
                  className="border border-[#0000001a] rounded-xl p-4 flex items-center gap-4 hover:bg-[#fff9ef] transition"
                >
                  <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                    📦
                  </div>
                  <div>
                    {/* 🔹 Listing name as the main line */}
                    <p className="font-semibold">
                      {order.title || "Listing"}
                    </p>
                    {/* Order id + status below */}
                    <p className="text-xs text-gray-500">
                      #{order.id || "—"} · {order.status || ""}
                    </p>
                    {order.price != null && (
                      <p className="text-xs text-gray-500 mt-1">
                        ₹{Number(order.price).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
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

export default MyAccountOrders;
