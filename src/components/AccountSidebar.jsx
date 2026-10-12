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
  className = "w-[35%] bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6",
}) => {
  return (
    <aside className={className}>
      {/* Profile info */}
      <div className="flex flex-col gap-3">
        <img
          src={avatarImg}
          className="w-20 h-20 rounded-full object-cover"
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
            type="button"
            onClick={onLogout}
            className="px-4 py-2 border border-[#0000001a] rounded-lg hover:bg-gray-100 transition cursor-pointer"
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
            type="button"
            onClick={onAdminDashboard}
            className="px-4 py-2 border border-[#0000001a] rounded-lg hover:bg-gray-100 transition cursor-pointer"
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
            type="button"
            onClick={onReservations}
            className="px-4 py-2 border border-[#0000001a] rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Check
          </button>
        </div>

        {/* My Listings Page */}
        <div className="border border-[#0000001a] rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">My Listings</p>
            <p className="text-xs text-gray-500">Manage your listings</p>
          </div>
          <button
            type="button"
            onClick={onMyListings}
            className="px-4 py-2 border border-[#0000001a] rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Open
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AccountSidebar;
