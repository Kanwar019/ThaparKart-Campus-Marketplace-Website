// src/pages/my account security.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/logout.js";
import { API_BASE_URL } from "../config/api.js";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { AccountSidebar } from "../components/AccountSidebar.jsx";
import { AccountTabs } from "../components/AccountTabs.jsx";

import editIcon from "../assets/icons/edit.svg";

import "../styles/My_Account_Security.css";

export const MyAccountSecurity = () => {
  const navigate = useNavigate();

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

  // sidebar actions
  const handleLogout = () => logout(API_BASE_URL, navigate);
  const handleAdminDashboard = () => navigate("/admin");
  const handleReservations = () => navigate("/reservation");
  const handleMyListings = () => navigate("/my-listing");

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
    <div className="bg-white dark:bg-[#121212] text-gray-900 dark:text-neutral-100 min-h-screen flex flex-col transition-colors">
      {/* -------- HEADER -------- */}
      <Header loggedIn={true} showBack={true} />

      {/* -------- BODY -------- */}
      <main className="w-[92%] sm:w-[90%] max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 py-6 sm:py-10 flex-1">
        {/* LEFT SIDEBAR */}
        <AccountSidebar
          className="w-full lg:w-[35%] lg:max-w-[340px] shrink-0 bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-6 border border-transparent dark:border-neutral-800"
          loading={profileLoading}
          profile={{ name: displayName, email }}
          onLogout={handleLogout}
          onAdminDashboard={handleAdminDashboard}
          onReservations={handleReservations}
          onMyListings={handleMyListings}
        />

        {/* RIGHT CONTENT AREA */}
        <section className="flex-1 bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-2xl shadow-md p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">My Profile</h1>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Manage your security and account settings
              </p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={!profileDirty}
              className={`px-6 py-3 rounded-[999px] shadow-button-shadow text-sm font-medium transition-transform transition-colors self-start sm:self-auto ${
                profileDirty
                  ? "bg-[#d21b1b] text-white hover:bg-[#b61616] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "bg-[#f6d0d0] dark:bg-neutral-800 text-[#7a1b1b] dark:text-neutral-500 opacity-90 cursor-default"
              }`}
            >
              {isSaved && !profileDirty ? "Saved" : "Save"}
            </button>
          </div>

          {/* PERSONAL DETAILS */}
          <div className="mt-6">
            <h2 className="font-semibold mb-3 text-gray-900 dark:text-white">Personal Details</h2>

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
                  className={`w-full h-[42px] border border-[#0000001a] dark:border-neutral-700 rounded-lg px-4 py-2 text-sm outline-none transition ${
                    !isEditingName
                      ? "bg-[#f7f7f7] dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 cursor-not-allowed"
                      : "bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:border-[#c90202]"
                  }`}
                />
                <button
                  onClick={() => {
                    setIsEditingName(true);
                    setIsSaved(false);
                    setNameInput(displayName);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition shrink-0"
                >
                  <img src={editIcon} className="w-4 h-4 dark:invert" alt="edit" />
                </button>
              </div>

              {/* Email */}
              <input
                value={email}
                readOnly
                className="w-full h-[42px] border border-[#0000001a] dark:border-neutral-700 rounded-lg px-4 py-2 text-sm bg-[#f7f7f7] dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* TABS */}
          <AccountTabs activeTab="security" />

          {/* SECURITY SECTION */}
          <div className="mt-6 flex flex-col gap-4 max-w-md">
            <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Change Password</h2>

            <input
              type="password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setPasswordDirty(true);
                setPasswordSaved(false);
              }}
              placeholder="Enter Old Password"
              className="w-full border border-[#0000001a] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-[#c90202] transition placeholder:text-gray-400 dark:placeholder:text-neutral-500"
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
              className="w-full border border-[#0000001a] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-[#c90202] transition placeholder:text-gray-400 dark:placeholder:text-neutral-500"
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
              className="w-full border border-[#0000001a] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-[#c90202] transition placeholder:text-gray-400 dark:placeholder:text-neutral-500"
            />

            {passwordError && (
              <p className="text-xs text-red-600 dark:text-red-400">{passwordError}</p>
            )}

            <button
              onClick={handleSavePassword}
              disabled={!passwordDirty}
              className={`self-start px-6 py-3 rounded-[999px] shadow-button-shadow text-sm font-medium transition-transform transition-colors ${
                passwordDirty
                  ? "bg-[#d21b1b] text-white hover:bg-[#b61616] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "bg-[#f6d0d0] dark:bg-neutral-800 text-[#7a1b1b] dark:text-neutral-500 opacity-90 cursor-default"
              }`}
            >
              {passwordSaved && !passwordDirty ? "Saved" : "Save Changes"}
            </button>
          </div>
        </section>
      </main>

      {/* -------- FOOTER -------- */}
      <Footer />
    </div>
  );
};

export default MyAccountSecurity;
