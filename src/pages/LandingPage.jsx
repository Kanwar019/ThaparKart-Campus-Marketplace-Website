// src/pages/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import divider from "../assets/divider.svg";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

import "../styles/Landing_Page.css";
import image1 from "../assets/image-1.png";
import image2 from "../assets/image-2.png";
import image3 from "../assets/image-3.png";
import image4 from "../assets/image-4.png";
import image5 from "../assets/image-5.png";
import image6 from "../assets/image-6.png";
import image7 from "../assets/image-7.png";

const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const LandingPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Top navigation */}
      <header className="w-full h-[164px] bg-white flex items-center">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Left: logo */}
          <button
            type="button"
            className="flex items-baseline gap-0 cursor-pointer"
          >
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </button>

          {/* Right nav */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              type="button"
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
              type="button"
              onClick={() => navigate("/login")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/about")}
              className="px-6 py-3.5 bg-black rounded-[999px] shadow-button-shadow cursor-pointer flex items-center justify-center hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
            >
              <span className="font-small-text text-white">Contact Us</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {/* Hero section */}
        <section className="w-[90%] mx-auto pt-6 md:pt-8 pb-12 md:pb-16">
          <div className="flex flex-col gap-8">
            {/* Headline + subheading */}
            <div className="flex flex-col gap-6 max-w-3xl">
              <p className="font-bold text-[40px] md:text-[56px] lg:text-[64px] leading-tight">
                <span className="text-black">Welcome to </span>
                <span className="text-[#c90202]">Thapar</span>
                <span className="text-black">Kart</span>
              </p>

              <p className="text-[#000000bf] font-subheading max-w-2xl">
                Buy, sell, or exchange anything within Thapar campus — from
                books and electronics to cycles and hostel essentials. A
                student-run marketplace, made just for you.
              </p>

              {/* Start Exploring CTA – fixed original size */}
              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="mt-2 w-[235px] px-8 py-5 bg-black flex items-center justify-center text-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
              >
                <span className="font-medium text-white text-2xl">
                  Start Exploring
                </span>
              </button>
            </div>

            {/* Hero image */}
            <div
              className="mt-6 w-full h-[260px] sm:h-[360px] md:h-[480px] lg:h-[640px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
              style={{ backgroundImage: `url(${image1})` }}
            />
          </div>
        </section>

        {/* Shop Smart, Sell Easy + 3 feature cards */}
        <section className="w-[90%] mx-auto pb-16 md:pb-20">
          <h2 className="font-semibold text-black text-3xl md:text-4xl lg:text-5xl tracking-[-0.03em] mb-8">
            Shop Smart, Sell Easy
          </h2>

          <div className="grid gap-8 md:gap-10 md:grid-cols-3">
            {/* Card 1 */}
            <div className="flex flex-col items-start gap-4">
              <div
                className="w-full h-[260px] md:h-[320px] lg:h-[405px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
                style={{ backgroundImage: `url(${image4})` }}
              />
              <div>
                <h3 className="font-semibold text-[18px] md:text-[20px] leading-[28px] text-black">
                  Buy What You Need
                </h3>
                <p className="mt-1 text-[14px] md:text-[16px] leading-[24px] text-[#828282]">
                  Find affordable second-hand items from students — books,
                  gadgets, cycles, and more.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-start gap-4">
              <div
                className="w-full h-[260px] md:h-[320px] lg:h-[405px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
                style={{ backgroundImage: `url(${image2})` }}
              />
              <div>
                <h3 className="font-semibold text-[18px] md:text-[20px] leading-[28px] text-black">
                  Sell What You Don’t Use
                </h3>
                <p className="mt-1 text-[14px] md:text-[16px] leading-[24px] text-[#828282]">
                  Post your pre-loved items in seconds and earn quick cash right
                  on campus.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-start gap-4">
              <div
                className="w-full h-[260px] md:h-[320px] lg:h-[405px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
                style={{ backgroundImage: `url(${image3})` }}
              />
              <div>
                <h3 className="font-semibold text-[18px] md:text-[20px] leading-[28px] text-black">
                  Trade Within Campus
                </h3>
                <p className="mt-1 text-[14px] md:text-[16px] leading-[24px] text-[#828282]">
                  No shipping, no delays — meet up inside campus and close deals
                  easily.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE ThaparKart */}
        <section className="w-[90%] mx-auto pt-12 pb-8 md:pt-14 md:pb-10 lg:pt-16 lg:pb-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
            {/* Text side */}
            <div className="w-full lg:w-1/2 flex flex-col gap-10">
              <p className="font-semibold text-3xl md:text-4xl lg:text-5xl">
                <span className="text-black">Why Choose </span>
                <span className="text-[#c90202]">Thapar</span>
                <span className="text-black">Kart?</span>
              </p>

              <div className="flex flex-col gap-8">
                <div>
                  <div className="font-medium text-black text-xl md:text-2xl mb-2">
                    By Students, For Students
                  </div>
                  <p className="text-[#828282] text-base md:text-2xl">
                    Built to make buying and selling safer, faster, and easier
                    for Thaparians.
                  </p>
                </div>

                <div>
                  <div className="font-medium text-black text-xl md:text-2xl mb-2">
                    Eco-Friendly &amp; Affordable
                  </div>
                  <p className="text-[#828282] text-base md:text-2xl">
                    Encouraging reuse and reducing waste, while helping you save
                    money.
                  </p>
                </div>

                <div>
                  <div className="font-medium text-black text-xl md:text-2xl mb-2">
                    Community Driven
                  </div>
                  <p className="text-[#828282] text-base md:text-2xl">
                    Verified users, secure listings, and a trustworthy
                    marketplace experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Image side */}
            <div
              className="w-full lg:w-[41.3%] min-h-[320px] lg:min-h-[500px] rounded-[20px] shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
              style={{ backgroundImage: `url(${image6})` }}
            />
          </div>
        </section>

        {/* CTA Row: Start Shopping / Sell an Item */}
        <section className="w-[90%] mx-auto pb-10 md:pb-12">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="flex w-full sm:w-auto px-6 py-3 bg-black items-center justify-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
            >
              <span className="font-medium text-white text-xl md:text-2xl">
                Start Shopping
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex w-full sm:w-auto px-6 py-3 bg-[#e6e6e6] items-center justify-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#d0d0d0] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
            >
              <span className="font-medium text-black text-xl md:text-2xl">
                Sell an Item
              </span>
            </button>
          </div>
        </section>

        {/* Light footer CTA area */}
        <section className="w-full bg-[#f7f7f7] py-10 md:py-12">
          <div className="w-[90%] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Single-line text like your screenshot */}
            <p className="font-semibold text-black text-3xl md:text-4xl lg:text-5xl whitespace-nowrap">
              Join the Campus Marketplace Today!
            </p>

            <div className="flex items-center gap-4 md:gap-6 self-end md:self-auto">
              <button
                type="button"
                onClick={() => navigate("/article")}
                className="inline-flex px-8 py-5 bg-black items-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
              >
                <span className="font-medium text-white text-xl md:text-2xl">
                  Articles
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex px-8 py-5 bg-[#e6e6e6] items-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#d0d0d0] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
              >
                <span className="font-medium text-[#000000e6] text-xl md:text-2xl">
                  List an Item
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* How ThaparKart Works */}
        <section className="w-[90%] mx-auto py-12 md:py-16 lg:py-20">
          <h2 className="font-semibold text-3xl md:text-4xl lg:text-5xl mb-8">
            <span className="text-black">How </span>
            <span className="text-[#c90202]">Thapar</span>
            <span className="text-black">Kart Works</span>
          </h2>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-[31px] items-stretch">
            <div className="flex flex-col gap-6 flex-1">
              <div
                className="w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[341px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
                style={{ backgroundImage: `url(${image5})` }}
              />
              <div className="flex flex-col gap-2">
                <p className="font-medium text-black text-xl md:text-2xl">
                  Browse or Search Anything You Need
                </p>
                <p className="font-normal text-[#828282] text-base md:text-2xl">
                  Find products listed by fellow Thapar students — from notes
                  and gadgets to hostel essentials.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 flex-1">
              <div
                className="w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[341px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
                style={{ backgroundImage: `url(${image7})` }}
              />
              <div className="flex flex-col gap-2">
                <p className="font-medium text-black text-xl md:text-2xl">
                  Post What You Don’t Need
                </p>
                <p className="font-normal text-[#828282] text-base md:text-2xl">
                  List your items in seconds with photos, details, and price —
                  no fees, just campus convenience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 relative">
        {/* Divider */}
        <img
          className="w-[calc(100%_-_160px)] max-w-[1200px] mx-auto top-0 left-0 right-0 h-px object-cover absolute inset-x-0"
          alt="Divider"
          src={divider}
        />

        <div className="w-[90%] mx-auto flex items-center justify-between pt-4">
          {/* Footer logo */}
          <p className="h-9 flex items-center justify-center font-subheading text-[length:var(--subheading-font-size)]">
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <img
              src={facebookIcon}
              alt="facebook"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={instagramIcon}
              alt="instagram"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={linkedinIcon}
              alt="linkedin"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={youtubeIcon}
              alt="youtube"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
