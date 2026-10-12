// src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../assets/icons/BackButton.svg";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import { listingSearchUrl } from "../utils/listingSearch.js";
import { useTheme } from "../contexts/ThemeContext.jsx";

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
  heightClass = "h-20 sm:h-24 lg:h-[110px]",
  shadowClass = "",
  contactScrollId,
}) => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [internalSearch, setInternalSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchValue = controlledSearch !== undefined ? controlledSearch : internalSearch;
  const setSearchValue = onSearchChange || setInternalSearch;

  const handleSearch = () => {
    setMobileMenuOpen(false);
    setShowMobileSearch(false);
    if (onSearch) {
      onSearch(searchValue);
    } else {
      navigate(listingSearchUrl(loggedIn, { search: searchValue }));
    }
  };

  const handleHome = () => {
    setMobileMenuOpen(false);
    navigate(loggedIn ? "/landing-login" : "/landing");
  };

  const handleAccount = () => {
    setMobileMenuOpen(false);
    navigate(loggedIn ? "/my-account/orders" : "/login");
  };

  const handleContact = () => {
    setMobileMenuOpen(false);
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
    <header
      className={`w-full ${heightClass} bg-white dark:bg-[#121212] border-b border-transparent dark:border-neutral-800 flex items-center transition-colors ${shadowClass}`}
    >
      <div className="w-[92%] max-w-[1300px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Back (optional) + Logo */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {showBack && (
            <button
              type="button"
              onClick={onBack || (() => navigate(-1))}
              className="cursor-pointer hover:opacity-70 transition-opacity p-1"
              aria-label="Go back"
            >
              <img src={BackButton} alt="Back" className="w-5 h-5 sm:w-6 sm:h-6 dark:invert" />
            </button>
          )}

          <button
            type="button"
            onClick={handleHome}
            className="flex items-baseline gap-0 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <span className="text-[#c90202] font-subheading text-2xl sm:text-3xl">Thapar</span>
            <span className="text-black dark:text-white font-subheading text-2xl sm:text-3xl transition-colors">
              Kart
            </span>
          </button>
        </div>

        {/* Center / Desktop Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-[380px] mx-4 items-center justify-between px-4 py-2 rounded-full border border-[#0000001a] dark:border-neutral-700 bg-white dark:bg-neutral-900 focus-within:border-black dark:focus-within:border-neutral-400 transition-colors">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none font-body-text text-black dark:text-white placeholder:text-[#00000080] dark:placeholder:text-neutral-400 text-sm"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            aria-label="Search"
          >
            <HealthiconsMagnifyingGlassOutline className="w-5 h-5 dark:invert" />
          </button>
        </div>

        {/* Right Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6 shrink-0">
          <button
            type="button"
            onClick={handleHome}
            className="font-body-text text-black dark:text-neutral-200 cursor-pointer hover:text-[#c90202] dark:hover:text-[#c90202] transition-colors"
          >
            Home
          </button>

          {/* Account / Login */}
          {loggedIn ? (
            <button
              type="button"
              onClick={handleAccount}
              className="font-body-text text-black dark:text-neutral-200 cursor-pointer hover:text-[#c90202] dark:hover:text-[#c90202] transition-colors"
            >
              Account
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAccount}
              className="font-body-text text-black dark:text-neutral-200 cursor-pointer hover:text-[#c90202] dark:hover:text-[#c90202] transition-colors"
            >
              Login
            </button>
          )}

          {/* Contact Us */}
          <button
            type="button"
            onClick={handleContact}
            className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 transition-all shadow-button-shadow font-medium text-sm"
          >
            Contact Us
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              /* Sun icon */
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              /* Moon icon */
              <svg className="w-4 h-4 text-neutral-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile controls (Search button, Theme toggle, Hamburger) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setShowMobileSearch((prev) => !prev)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            aria-label="Toggle search"
          >
            <HealthiconsMagnifyingGlassOutline className="w-5 h-5 dark:invert" />
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-neutral-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Search Field */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 p-4 shadow-md z-40">
          <div className="flex items-center px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search listings..."
              className="flex-1 bg-transparent outline-none text-black dark:text-white placeholder:text-neutral-400 text-sm"
              autoFocus
            />
            <button type="button" onClick={handleSearch} className="p-1">
              <HealthiconsMagnifyingGlassOutline className="w-5 h-5 dark:invert" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[70px] sm:top-[80px] z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-start">
          <div className="bg-white dark:bg-[#161618] border-b border-neutral-200 dark:border-neutral-800 p-6 flex flex-col gap-4 shadow-xl animate-fadeIn">
            <button
              type="button"
              onClick={handleHome}
              className="text-left py-2 font-medium text-lg text-black dark:text-white hover:text-[#c90202] transition"
            >
              Home
            </button>

            {loggedIn ? (
              <button
                type="button"
                onClick={handleAccount}
                className="text-left py-2 font-medium text-lg text-black dark:text-white hover:text-[#c90202] transition"
              >
                Account
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAccount}
                className="text-left py-2 font-medium text-lg text-black dark:text-white hover:text-[#c90202] transition"
              >
                Login
              </button>
            )}

            <button
              type="button"
              onClick={handleContact}
              className="w-full py-3 mt-2 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full shadow-button-shadow hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 transition text-center"
            >
              Contact Us
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
