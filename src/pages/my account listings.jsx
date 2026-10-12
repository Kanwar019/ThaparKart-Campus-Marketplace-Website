// src/pages/my account listings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/logout.js";
import { API_BASE_URL, getAuthHeaders } from "../config/api.js";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { AccountSidebar } from "../components/AccountSidebar.jsx";
import { AccountTabs } from "../components/AccountTabs.jsx";

import editIcon from "../assets/icons/edit.svg";

import "../styles/My_Account_Listings.css";

export const MyAccountListings = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [nameDraft, setNameDraft] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileDirty, setProfileDirty] = useState(false);

  const [listings, setListings] = useState([]);

  // Sidebar actions
  const handleLogout = () => logout(API_BASE_URL, navigate);
  const handleAdminDashboard = () => navigate("/admin");
  const handleReservations = () => navigate("/reservation");
  const handleMyListingsPage = () => navigate("/my-listing");

  // -------- FETCH PROFILE + LISTINGS FROM BACKEND --------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, listingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profile`, {
            credentials: "include",
            headers: { ...getAuthHeaders() },
          }),
          fetch(`${API_BASE_URL}/api/my-listings`, {
            credentials: "include",
            headers: { ...getAuthHeaders() },
          }),
        ]);

        if (profileRes.status === 401) {
          navigate("/login");
          return;
        }

        if (!profileRes.ok) {
          throw new Error("Failed to fetch profile");
        }

        const profileData = await profileRes.json();
        const listingsData = listingsRes.ok ? await listingsRes.json() : [];

        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
        });
        setNameDraft(profileData.name || "");

        if (Array.isArray(listingsData)) {
          const sorted = [...listingsData].sort((a, b) => {
            const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return db - da;
          });

          const mapped = sorted.map((item) => ({
            id: String(item._id),
            title: item.title || "Untitled item",
            status: item.status || "",
            price: `₹${Number(item.price || 0).toLocaleString("en-IN")}`,
            thumb:
              (Array.isArray(item.imageUrls) && item.imageUrls[0]) ||
              "/background.png",
          }));

          setListings(mapped);
        } else {
          setListings([]);
        }
      } catch (err) {
        console.error("Error fetching profile/listings:", err);
        setListings([]);
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
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
      <Header loggedIn={true} showBack={true} onBack={() => navigate("/landing-login")} />

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
          onMyListings={handleMyListingsPage}
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

            {/* Save button */}
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

            <div className="flex flex-col gap-4 max-w-md w-full">
              {/* Name input */}
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

              {/* Email (non-editable) */}
              <input
                value={profile.email}
                readOnly
                className="w-full h-[42px] border border-[#0000001a] dark:border-neutral-700 rounded-lg px-4 py-2 text-sm bg-[#f7f7f7] dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* TABS */}
          <AccountTabs activeTab="listings" />

          {/* LISTINGS LIST */}
          <div className="mt-6 flex flex-col gap-3 text-sm">
            {loading ? (
              <p className="text-xs text-gray-500 dark:text-neutral-400">Loading listings...</p>
            ) : listings.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-neutral-400">No listings yet.</p>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="border border-[#0000001a] dark:border-neutral-800 rounded-xl p-4 flex items-center gap-4 hover:bg-[#fff9ef] dark:hover:bg-neutral-800/60 transition"
                >
                  <div className="w-14 h-14 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-2xl shrink-0">
                    📦
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{listing.title}</p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {listing.status || ""}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {listing.price || ""}
                    </p>
                  </div>
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

export default MyAccountListings;
