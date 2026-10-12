// src/pages/my account listings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/logout.js";
import { listingSearchUrl } from "../utils/listingSearch.js";
import { API_BASE_URL } from "../config/api.js";
import { Footer } from "../components/Footer.jsx";
import { AccountSidebar } from "../components/AccountSidebar.jsx";
import { AccountTabs } from "../components/AccountTabs.jsx";

import magnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";
import editIcon from "../assets/icons/edit.svg";

import "../styles/My_Account_Listings.css";

export const MyAccountListings = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

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

  // Header nav
  const handleBack = () => navigate("/landing-login");
  const handleGoHome = () => navigate("/landing-login");
  const handleContact = () => navigate("/about-login");

  // Sidebar actions
  const handleLogout = () => logout(API_BASE_URL, navigate);
  const handleAdminDashboard = () => navigate("/admin");
  const handleReservations = () => navigate("/reservation");
  const handleMyListingsPage = () => navigate("/my-listing");


  const handleSearch = () => {
    navigate(listingSearchUrl(true, { search: searchValue }));
  };

  // -------- FETCH PROFILE + LISTINGS FROM BACKEND --------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, listingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/profile`, {
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/my-listings`, {
            credentials: "include",
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
          {/* Left: Back button + Logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img src={BackButton} alt="Back" className="w-6 h-6" />
            </button>

            <div className="cursor-pointer select-none" onClick={handleGoHome}>
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
        <AccountSidebar
          loading={loading}
          profile={profile}
          onLogout={handleLogout}
          onAdminDashboard={handleAdminDashboard}
          onReservations={handleReservations}
          onMyListings={handleMyListingsPage}
        />

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

            {/* Save button */}
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

              {/* Email (non-editable) */}
              <input
                value={profile.email}
                readOnly
                className="w-full h-[42px] border border-[#0000001a] rounded-lg px-4 py-2 text-sm bg-[#f7f7f7] cursor-not-allowed"
              />
            </div>
          </div>

          {/* TABS */}
          <AccountTabs activeTab="listings" />

          {/* LISTINGS LIST */}
          <div className="mt-6 flex flex-col gap-3 text-sm">
            {loading ? (
              <p className="text-xs text-gray-500">Loading listings...</p>
            ) : listings.length === 0 ? (
              <p className="text-xs text-gray-500">No listings yet.</p>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="border border-[#0000001a] rounded-xl p-4 flex items-center gap-4 hover:bg-[#fff9ef] transition"
                >
                  <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
  📦
</div>

                  <div>
                    <p className="font-semibold">{listing.title}</p>
                    <p className="text-xs text-gray-500">
                      {listing.status || ""}
                    </p>
                    <p className="text-xs text-gray-500">
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
