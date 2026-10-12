// src/components/AccountTabs.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export const AccountTabs = ({ activeTab = "orders" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 sm:gap-4 border-b border-[#0000001a] dark:border-neutral-800 py-3 mt-6 text-sm font-medium overflow-x-auto">
      {/* Tab: Orders */}
      {activeTab === "orders" ? (
        <div className="px-4 py-2 border-b-2 border-[#c90202] text-[#c90202] cursor-default whitespace-nowrap">
          Orders
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/my-account/orders")}
          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-lg transition cursor-pointer whitespace-nowrap"
        >
          Orders
        </button>
      )}

      {/* Tab: My Listings */}
      {activeTab === "listings" ? (
        <div className="px-4 py-2 border-b-2 border-[#c90202] text-[#c90202] cursor-default whitespace-nowrap">
          My Listings
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/my-account/listings")}
          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-lg transition cursor-pointer whitespace-nowrap"
        >
          My Listings
        </button>
      )}

      {/* Tab: Security */}
      {activeTab === "security" ? (
        <div className="px-4 py-2 border-b-2 border-[#c90202] text-[#c90202] cursor-default whitespace-nowrap">
          Security
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/my-account/security")}
          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-lg transition cursor-pointer whitespace-nowrap"
        >
          Security
        </button>
      )}
    </div>
  );
};

export default AccountTabs;
