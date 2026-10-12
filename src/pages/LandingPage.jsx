// src/pages/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";

import "../styles/Landing_Page.css";
import { listingSearchUrl } from "../utils/listingSearch.js";
import image1 from "../assets/image-1.png";
import image2 from "../assets/image-2.png";
import image3 from "../assets/image-3.png";
import image4 from "../assets/image-4.png";
import image6 from "../assets/image-6.png";

export const LandingPage = ({ loggedIn }) => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isLogged = loggedIn ?? (location?.pathname.includes("-login") || false);

  const handleSearch = () => {
    navigate(listingSearchUrl(isLogged, { search: searchValue }));
  };

  return (
    <div className="bg-white dark:bg-[#0f0f11] text-black dark:text-white min-h-screen flex flex-col transition-colors">
      {/* Top navigation */}
      <Header
        loggedIn={isLogged}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      {/* Main content */}
      <main className="flex-1">
        {/* Hero section */}
        <section className="w-[92%] max-w-[1300px] mx-auto pt-4 sm:pt-6 md:pt-8 pb-12 md:pb-16">
          <div className="flex flex-col gap-8">
            {/* Headline + subheading */}
            <div className="flex flex-col gap-5 sm:gap-6 max-w-3xl">
              <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-[64px] leading-tight">
                <span className="text-black dark:text-white">Welcome to </span>
                <span className="text-[#c90202]">Thapar</span>
                <span className="text-black dark:text-white">Kart</span>
              </h1>

              <p className="text-[#000000bf] dark:text-neutral-300 font-subheading max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed">
                Buy, sell, or exchange anything within Thapar campus — from
                books and electronics to cycles and hostel essentials. A
                student-run marketplace, made just for you.
              </p>

              {/* Start Exploring CTA */}
              <button
                type="button"
                onClick={() => navigate(isLogged ? "/shop-login" : "/shop")}
                className="mt-2 w-full sm:w-[235px] py-4 sm:py-5 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
              >
                <span className="font-medium text-xl sm:text-2xl">
                  Start Exploring
                </span>
              </button>
            </div>

            {/* Hero image */}
            <div
              className="mt-4 sm:mt-6 w-full h-[220px] sm:h-[360px] md:h-[480px] lg:h-[640px] rounded-2xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center overflow-hidden border border-neutral-200/40 dark:border-neutral-800"
              style={{ backgroundImage: `url(${image1})` }}
            />
          </div>
        </section>

        {/* Shop Smart, Sell Easy + 3 feature cards */}
        <section className="w-[92%] max-w-[1300px] mx-auto pb-16 md:pb-20">
          <h2 className="font-semibold text-black dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[-0.03em] mb-8">
            Shop Smart, Sell Easy
          </h2>

          <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {/* Card 1 */}
            <div className="flex flex-col items-start gap-4">
              <div
                className="w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[405px] rounded-xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center border border-neutral-200/50 dark:border-neutral-800"
                style={{ backgroundImage: `url(${image4})` }}
              />
              <div>
                <h3 className="font-semibold text-[18px] md:text-[20px] leading-[28px] text-black dark:text-white">
                  Buy What You Need
                </h3>
                <p className="mt-1 text-[14px] md:text-[16px] leading-[24px] text-[#828282] dark:text-neutral-400">
                  Find affordable second-hand items from students — books,
                  gadgets, cycles, and more.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-start gap-4">
              <div
                className="w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[405px] rounded-xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center border border-neutral-200/50 dark:border-neutral-800"
                style={{ backgroundImage: `url(${image2})` }}
              />
              <div>
                <h3 className="font-semibold text-[18px] md:text-[20px] leading-[28px] text-black dark:text-white">
                  Sell What You Don’t Use
                </h3>
                <p className="mt-1 text-[14px] md:text-[16px] leading-[24px] text-[#828282] dark:text-neutral-400">
                  Post your pre-loved items in seconds and earn quick cash right
                  on campus.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-start gap-4 sm:col-span-2 md:col-span-1">
              <div
                className="w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[405px] rounded-xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center border border-neutral-200/50 dark:border-neutral-800"
                style={{ backgroundImage: `url(${image3})` }}
              />
              <div>
                <h3 className="font-semibold text-[18px] md:text-[20px] leading-[28px] text-black dark:text-white">
                  Trade Within Campus
                </h3>
                <p className="mt-1 text-[14px] md:text-[16px] leading-[24px] text-[#828282] dark:text-neutral-400">
                  No shipping, no delays — meet up inside campus and close deals
                  easily.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE ThaparKart */}
        <section className="w-[92%] max-w-[1300px] mx-auto pt-8 pb-10 sm:pt-12 sm:pb-12 lg:pt-16 lg:pb-14">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-center lg:items-start justify-between">
            {/* Text side */}
            <div className="w-full lg:w-[52%] flex flex-col gap-6 sm:gap-8 md:gap-10">
              <h2 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                <span className="text-black dark:text-white">Why Choose </span>
                <span className="text-[#c90202]">Thapar</span>
                <span className="text-black dark:text-white">Kart?</span>
              </h2>

              <div className="flex flex-col gap-5 sm:gap-6 md:gap-8">
                <div>
                  <h3 className="font-medium text-black dark:text-white text-lg sm:text-xl md:text-2xl mb-1.5 sm:mb-2">
                    By Students, For Students
                  </h3>
                  <p className="text-[#828282] dark:text-neutral-400 text-sm sm:text-base md:text-lg lg:text-xl">
                    Built to make buying and selling safer, faster, and easier
                    for Thaparians.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black dark:text-white text-lg sm:text-xl md:text-2xl mb-1.5 sm:mb-2">
                    Eco-Friendly &amp; Affordable
                  </h3>
                  <p className="text-[#828282] dark:text-neutral-400 text-sm sm:text-base md:text-lg lg:text-xl">
                    Encouraging reuse and reducing waste, while helping you save
                    money.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black dark:text-white text-lg sm:text-xl md:text-2xl mb-1.5 sm:mb-2">
                    Community Driven
                  </h3>
                  <p className="text-[#828282] dark:text-neutral-400 text-sm sm:text-base md:text-lg lg:text-xl">
                    Verified users, secure listings, and a trustworthy
                    marketplace experience.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(isLogged ? "/shop-login" : "/shop")}
                  className="inline-flex px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black items-center justify-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors font-medium text-lg sm:text-xl"
                >
                  Start Shopping
                </button>

                <button
                  type="button"
                  onClick={() => navigate(isLogged ? "/create-listing-login" : "/login")}
                  className="inline-flex px-6 py-3.5 bg-[#e6e6e6] dark:bg-neutral-800 text-black dark:text-white items-center justify-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#d0d0d0] dark:hover:bg-neutral-700 hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors font-medium text-lg sm:text-xl"
                >
                  Sell an Item
                </button>
              </div>
            </div>

            {/* Image side */}
            <div className="w-full lg:w-[44%] flex items-center justify-center">
              <img
                src={image6}
                alt="Why Choose ThaparKart"
                className="w-full max-w-[500px] h-auto object-contain rounded-2xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] border border-neutral-200/50 dark:border-neutral-800"
              />
            </div>
          </div>
        </section>

        {/* Light footer CTA area */}
        <section className="w-full bg-[#f7f7f7] dark:bg-[#161619] py-10 md:py-14 transition-colors">
          <div className="w-[92%] max-w-[1300px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <p className="font-semibold text-black dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              Join the Campus Marketplace Today!
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <button
                type="button"
                onClick={() => navigate(isLogged ? "/article-login" : "/article")}
                className="inline-flex px-6 sm:px-8 py-3.5 sm:py-4 bg-black dark:bg-white text-white dark:text-black items-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors font-medium text-lg sm:text-xl"
              >
                Articles
              </button>

              <button
                type="button"
                onClick={() => navigate(isLogged ? "/create-listing-login" : "/login")}
                className="inline-flex px-6 sm:px-8 py-3.5 sm:py-4 bg-[#e6e6e6] dark:bg-neutral-800 text-black dark:text-white items-center gap-2 rounded-[20px] shadow-button-shadow cursor-pointer hover:bg-[#d0d0d0] dark:hover:bg-neutral-700 hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors font-medium text-lg sm:text-xl"
              >
                List an Item
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const LandingPageWithLogin = (props) => <LandingPage loggedIn={true} {...props} />;

export default LandingPage;
