// src/components/AccountSidebar.jsx
import React from "react";
import avatarImg from "../assets/icons/avatar.svg";

export const AccountSidebar = ({
  loading = false,
  profile = {},
  onLogout,
  onAdminDashboard,
  onReservations,
  onMyListings,
  className = "w-[35%] bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6 dark:bg-neutral-900 dark:border dark:border-neutral-800 transition-colors",
}) => {
  const ADMIN_EMAILS = [
    "ksingh2_be23@thapar.edu",
    "ybhansali_be23@thapar.edu",
  ];
  const userEmail = profile.email || (typeof localStorage !== "undefined" ? localStorage.getItem("userEmail") || "" : "");
  const isEmailAdmin = Boolean(userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase()));
  const isStoredAdmin = typeof localStorage !== "undefined" && localStorage.getItem("isAdmin") === "true";
  const userIsAdmin = Boolean(
    profile.isAdmin ||
    profile.role === "admin" ||
    isEmailAdmin ||
    isStoredAdmin
  );

  return (
    <aside className={className}>
      {/* Profile info */}
      <div className="flex flex-col gap-3">
        <img
          src={avatarImg}
          className="w-20 h-20 rounded-full object-cover bg-neutral-200 dark:bg-neutral-700"
          alt="avatar"
        />
        <h2 className="font-bold text-lg text-black dark:text-white">
          {loading ? "Loading..." : profile.name || "—"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {loading ? "Loading..." : profile.email || "—"}
        </p>
      </div>

      {/* Account Actions */}
      <div className="flex flex-col gap-3.5 text-sm">
        {/* Logout */}
        <div className="border border-[#0000001a] dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 rounded-xl p-4 flex justify-between items-center transition">
          <div>
            <p className="font-semibold text-black dark:text-white">Logout</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">Sign out of this device</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 border border-[#0000001a] dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-black dark:text-white transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Admin - ONLY VISIBLE TO VERIFIED ADMINS */}
        {userIsAdmin && (
          <div className="border border-[#0000001a] dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 rounded-xl p-4 flex justify-between items-center transition">
            <div>
              <p className="font-semibold text-black dark:text-white">Admin Dashboard</p>
              <p className="text-xs text-gray-500 dark:text-neutral-400">Check recent reports</p>
            </div>
            <button
              type="button"
              onClick={onAdminDashboard}
              className="px-4 py-2 border border-[#0000001a] dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-black dark:text-white transition cursor-pointer"
            >
              Admin
            </button>
          </div>
        )}

        {/* Reservation */}
        <div className="border border-[#0000001a] dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 rounded-xl p-4 flex justify-between items-center transition">
          <div>
            <p className="font-semibold text-black dark:text-white">My Reservations</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">Check your reservations</p>
          </div>
          <button
            type="button"
            onClick={onReservations}
            className="px-4 py-2 border border-[#0000001a] dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-black dark:text-white transition cursor-pointer"
          >
            Check
          </button>
        </div>

        {/* My Listings Page */}
        <div className="border border-[#0000001a] dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 rounded-xl p-4 flex justify-between items-center transition">
          <div>
            <p className="font-semibold text-black dark:text-white">My Listings</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">Manage your listings</p>
          </div>
          <button
            type="button"
            onClick={onMyListings}
            className="px-4 py-2 border border-[#0000001a] dark:border-neutral-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-black dark:text-white transition cursor-pointer"
          >
            Open
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AccountSidebar;
