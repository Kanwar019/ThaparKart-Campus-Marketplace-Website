// src/pages/create_listing.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import divider from "../assets/divider.svg";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

import "../styles/Create_a_Listing.css";

const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const CreateListing = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
    // later you can navigate(`/shop?query=${encodeURIComponent(searchValue)}`)
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* ---------- HEADER ---------- */}
      <header className="w-full h-[164px] bg-white flex items-center">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-baseline gap-0 cursor-pointer hover:opacity-80 transition-all duration-200"
          >
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </button>

          {/* Nav */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => navigate("/")}
              className="hover:text-[#c90202] font-body-text transition-colors"
            >
              Home
            </button>

            {/* Search bar (same as LandingPage) */}
            <div className="hidden sm:flex w-[260px] md:w-[320px] lg:w-[360px] items-center justify-between px-4 py-2 rounded-[999px] border border-[#0000001a] bg-white focus-within:border-black transition">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
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

            <button
              onClick={() => navigate("/login")}
              className="hover:text-[#c90202] font-body-text transition-colors"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/about")}
              className="px-6 py-3 bg-black text-white rounded-[999px] hover:bg-[#1a1a1a] hover:scale-[1.03] transition-transform transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* ---------- BLOCKED MESSAGE ---------- */}
      <main className="flex-1 flex items-center justify-center p-10">
        <div className="bg-[#f7f7f7] w-full max-w-[750px] rounded-[28px] p-10 shadow-md text-center">
          <h1 className="text-[32px] font-bold mb-4">Create a Listing</h1>

          <p className="text-[#666] mb-6 text-lg">
            You must be logged in with your <strong>@thapar.edu</strong> account
            before creating a listing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-black text-white rounded-[20px] hover:bg-[#1a1a1a] hover:scale-[1.03] transition-transform transition-colors"
            >
              Login to Continue
            </button>

            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-[#e6e6e6] rounded-[20px] hover:bg-[#d0d0d0] hover:scale-[1.03] transition-transform transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="py-10 bg-white relative">
        <img
          src={divider}
          className="absolute top-0 left-0 right-0 w-[calc(100%-160px)] mx-auto"
          alt="divider"
        />

        <div className="w-[90%] mx-auto flex justify-between pt-6">
          <p className="font-subheading">
            <span className="text-[#c90202]">Thapar</span> <span>Kart</span>
          </p>

          <div className="flex gap-3">
            {[facebookIcon, instagramIcon, linkedinIcon, youtubeIcon].map(
              (icon, idx) => (
                <img
                  key={idx}
                  src={icon}
                  className="w-6 cursor-pointer hover:opacity-70 transition-all duration-200"
                  alt="social"
                />
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateListing;
