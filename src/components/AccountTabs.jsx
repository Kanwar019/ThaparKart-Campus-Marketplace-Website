// src/components/AccountTabs.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export const AccountTabs = ({ activeTab = "orders" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4 border-b border-[#0000001a] py-3 mt-6 text-sm font-medium">
      {/* Tab: Orders */}
      {activeTab === "orders" ? (
        <div className="px-4 py-2 border-b-2 border-[#c90202] text-[#c90202] cursor-default">
          Orders
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/my-account/orders")}
          className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer"
        >
          Orders
        </button>
      )}

      {/* Tab: My Listings */}
      {activeTab === "listings" ? (
        <div className="px-4 py-2 border-b-2 border-[#c90202] text-[#c90202] cursor-default">
          My Listings
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/my-account/listings")}
          className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer"
        >
          My Listings
        </button>
      )}

      {/* Tab: Security */}
      {activeTab === "security" ? (
        <div className="px-4 py-2 border-b-2 border-[#c90202] text-[#c90202] cursor-default">
          Security
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/my-account/security")}
          className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer"
        >
          Security
        </button>
      )}
    </div>
  );
};

export default AccountTabs;
