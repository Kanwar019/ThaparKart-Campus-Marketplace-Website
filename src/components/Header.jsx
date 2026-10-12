// src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../assets/icons/BackButton.svg";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import { listingSearchUrl } from "../utils/listingSearch.js";

const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const Header = ({
  loggedIn = false,
  showBack = false,
  onBack,
  searchValue: controlledSearch,
  onSearchChange,
  onSearch,
  heightClass = "h-[164px]",
  shadowClass = "",
  contactScrollId,
}) => {
  const navigate = useNavigate();
  const [internalSearch, setInternalSearch] = useState("");

  const searchValue = controlledSearch !== undefined ? controlledSearch : internalSearch;
  const setSearchValue = onSearchChange || setInternalSearch;

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue);
    } else {
      navigate(listingSearchUrl(loggedIn, { search: searchValue }));
    }
  };

  const handleHome = () => {
    navigate(loggedIn ? "/landing-login" : "/landing");
  };

  const handleContact = () => {
    if (contactScrollId) {
      const section = document.getElementById(contactScrollId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(loggedIn ? "/about-login" : "/about");
  };

  return (
    <header className={`w-full ${heightClass} bg-white flex items-center ${shadowClass}`}>
      <div className="w-[90%] mx-auto flex items-center justify-between">
        {/* Left: Back (optional) + Logo */}
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              type="button"
              onClick={onBack || (() => navigate(-1))}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img src={BackButton} alt="Back" className="w-6 h-6" />
            </button>
          )}

          <button
            type="button"
            onClick={handleHome}
            className="flex items-baseline gap-0 cursor-pointer hover:opacity-80 transition-all duration-200"
          >
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </button>
        </div>

        {/* Right nav */}
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            type="button"
            onClick={handleHome}
            className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
          >
            Home
          </button>

          {/* Search bar */}
          <div className="hidden sm:flex w-[260px] md:w-[320px] lg:w-[360px] items-center justify-between px-4 py-2 rounded-[999px] border border-[#0000001a] bg-white focus-within:border-black transition">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search"
              className="flex-1 bg-transparent outline-none font-body-text text-[#000000] placeholder:text-[#00000080]"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <HealthiconsMagnifyingGlassOutline className="w-5 h-5" />
            </button>
          </div>

          {/* Account / Login */}
          {loggedIn ? (
            <button
              type="button"
              onClick={() => navigate("/my-account/orders")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
            >
              Account
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
            >
              Login
            </button>
          )}

          {/* Contact Us */}
          <button
            type="button"
            onClick={handleContact}
            className="px-6 py-3 bg-black text-white rounded-full hover:bg-[#1a1a1a] transition shadow-button-shadow"
          >
            Contact Us
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
