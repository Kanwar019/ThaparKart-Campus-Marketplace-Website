// src/pages/my account security.jsx
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

import "../styles/My_Account_Security.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const MyAccountSecurity = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

  // profile from backend
  const [displayName, setDisplayName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // password handling (now real backend, no mock)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordDirty, setPasswordDirty] = useState(false);

  // nav
  const handleBack = () => navigate("/landing-login");
  const handleGoHome = () => navigate("/landing-login");
  const handleContact = () => navigate("/about-login");

  // sidebar actions
  const handleLogout = () => navigate("/login");
  const handleAdminDashboard = () => navigate("/admin");
  const handleReservations = () => navigate("/reservation");
  const handleMyListings = () => navigate("/my-listing");

  // tabs
  const goOrders = () => navigate("/my-account/orders");
  const goListings = () => navigate("/my-account/listings");

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

  // -------- FETCH PROFILE FROM BACKEND --------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: "include",
        });

        if (res.status === 401) {
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        setDisplayName(data.name || "");
        setNameInput(data.name || "");
        setEmail(data.email || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!profileDirty) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: nameInput }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      setDisplayName(nameInput);
      setIsSaved(true);
      setProfileDirty(false);
      setIsEditingName(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  // -------- CHANGE PASSWORD VIA BACKEND --------
  const handleSavePassword = async () => {
    setPasswordError("");
    setPasswordSaved(false);

    if (!oldPassword || !newPassword || !verifyPassword) {
      setPasswordError("Please fill all password fields.");
      return;
    }

    if (newPassword !== verifyPassword) {
      setPasswordError("New password and verify password do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (res.status === 401) {
        // session expired
        navigate("/login");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPasswordError(
          data.message || "Failed to change password. Please try again."
        );
        return;
      }

      setPasswordSaved(true);
      setPasswordDirty(false);
      setOldPassword("");
      setNewPassword("");
      setVerifyPassword("");
      setPasswordError("");
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError("Could not connect to server. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* -------- HEADER -------- */}
      <header className="w-full h-[140px] bg-white flex items-center">
        <div className="w-[90%] mx-auto flex items-center justify-between">
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

          <div className="flex items-center gap-6">
            <button
              onClick={handleGoHome}
              className="font-body-text text-black hover:text-[#c90202] transition"
            >
              Home
            </button>

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

      {/* -------- BODY -------- */}
      <main className="w-[90%] mx-auto flex gap-8 py-10">
        {/* LEFT SIDEBAR */}
        <aside className="w-[35%] bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <img
              src={avatarImg}
              className="w-20 h-20 rounded-full"
              alt="avatar"
            />
            <h2 className="font-bold text-lg">
              {profileLoading ? "Loading..." : displayName || "—"}
            </h2>
            <p className="text-sm text-gray-500">
              {profileLoading ? "Loading..." : email || "—"}
            </p>
          </div>

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

            {/* My Listings */}
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-bold text-lg">My Profile</h1>
              <p className="text-xs text-gray-500">
                Manage your security and account settings
              </p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={!profileDirty}
              className={`px-6 py-3.5 rounded-[999px] shadow-button-shadow text-sm transition-transform transition-colors ${
                profileDirty
                  ? "bg-[#d21b1b] text-white hover:bg-[#b61616] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-[#f6d0d0] text-[#7a1b1b] opacity-90"
              }`}
            >
              {isSaved && !profileDirty ? "Saved" : "Save"}
            </button>
          </div>

          {/* PERSONAL DETAILS */}
          <div className="mt-6">
            <h2 className="font-semibold mb-3">Personal Details</h2>

            <div className="flex flex-col gap-4 max-w-md w-full">
              {/* Name */}
              <div className="flex items-center gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setProfileDirty(true);
                    setIsSaved(false);
                  }}
                  disabled={!isEditingName}
                  className={`w-full h-[42px] border border-[#0000001a] rounded-lg px-4 py-2 text-sm ${
                    !isEditingName ? "bg-[#f7f7f7]" : "bg-white"
                  }`}
                />
                <button
                  onClick={() => {
                    setIsEditingName(true);
                    setIsSaved(false);
                    setNameInput(displayName);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <img src={editIcon} className="w-4 h-4" alt="edit" />
                </button>
              </div>

              {/* Email */}
              <input
                value={email}
                readOnly
                className="w-full h-[42px] border border-[#0000001a] rounded-lg px-4 py-2 text-sm bg-[#f7f7f7]"
              />
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-4 border-b border-[#0000001a] py-3 mt-6 text-sm font-medium">
            <button
              onClick={goOrders}
              className="px-4 py-2 hover:bg-gray-100 transition"
            >
              Orders
            </button>

            <button
              onClick={goListings}
              className="px-4 py-2 hover:bg-gray-100 transition"
            >
              My Listings
            </button>

            <div className="px-4 py-2 border-b-2 border-[#c90202] text-[#c90202]">
              Security
            </div>
          </div>

          {/* SECURITY SECTION */}
          <div className="mt-6 flex flex-col gap-4 max-w-md">
            <h2 className="font-semibold text-sm">Change Password</h2>

            <input
              type="password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setPasswordDirty(true);
                setPasswordSaved(false);
              }}
              placeholder="Enter Old Password"
              className="border border-[#0000001a] rounded-lg px-4 py-2 text-sm"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordDirty(true);
                setPasswordSaved(false);
              }}
              placeholder="Enter New Password"
              className="border border-[#0000001a] rounded-lg px-4 py-2 text-sm"
            />

            <input
              type="password"
              value={verifyPassword}
              onChange={(e) => {
                setVerifyPassword(e.target.value);
                setPasswordDirty(true);
                setPasswordSaved(false);
              }}
              placeholder="Verify New Password"
              className="border border-[#0000001a] rounded-lg px-4 py-2 text-sm"
            />

            {passwordError && (
              <p className="text-xs text-red-600">{passwordError}</p>
            )}

            <button
              onClick={handleSavePassword}
              disabled={!passwordDirty}
              className={`self-start px-6 py-3.5 rounded-[999px] shadow-button-shadow text-sm transition-transform transition-colors ${
                passwordDirty
                  ? "bg-[#d21b1b] text-white hover:bg-[#b61616] hover:scale-[1.02]"
                  : "bg-[#f6d0d0] text-[#7a1b1b] opacity-90"
              }`}
            >
              {passwordSaved && !passwordDirty ? "Saved" : "Save Changes"}
            </button>
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
              className="w-6 hover:scale-110 transition"
              alt="fb"
            />
            <img
              src={instagramIcon}
              className="w-6 hover:scale-110 transition"
              alt="ig"
            />
            <img
              src={linkedinIcon}
              className="w-6 hover:scale-110 transition"
              alt="li"
            />
            <img
              src={youtubeIcon}
              className="w-6 hover:scale-110 transition"
              alt="yt"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MyAccountSecurity;
