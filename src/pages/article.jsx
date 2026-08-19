// src/pages/article.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import divider from "../assets/divider.svg";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg"; // ⬅ back icon
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";
import image11 from "../assets/image-11.png";
import image12 from "../assets/image-12.png";
import image13 from "../assets/image-13.png";
import image14 from "../assets/image-14.png";
import image15 from "../assets/image-15.png";
import image16 from "../assets/image-16.png";

import "../styles/article.css";

// Simple local search icon (image)
const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const Article = () => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* TOP NAV (similar to LandingPage, with back button) */}
      <header className="w-full h-[164px] bg-white flex items-center">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Left: back button + logo */}
          <div className="flex items-center gap-4">
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img src={BackButton} alt="Back" className="w-6 h-6" />
            </button>

            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-baseline gap-0 cursor-pointer"
            >
              <span className="text-[#c90202] font-subheading">Thapar</span>
              <span className="text-black font-subheading">Kart</span>
            </button>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              type="button"
              onClick={() => navigate("/")}
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

            {/* Login */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
            >
              Login
            </button>

            {/* Contact Us */}
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

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {/* Article hero + heading */}
        <section className="w-[90%] mx-auto pt-8 md:pt-10 pb-12 md:pb-16">
          <div className="flex flex-col gap-8">
            {/* Heading + intro */}
            <div className="flex flex-col gap-6 max-w-4xl">
              {/* HEADING – now bold */}
              <h1 className="font-title font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-snug">
                <span className="text-black">
                  Making Sustainability a Habit: How{" "}
                </span>
                <span className="text-[#c90202]">Thapar</span>
                <span className="text-black">
                  {" "}
                  Kart Helps Students Go Green
                </span>
              </h1>

              <p className="font-subheading text-[#000000bf]">
                Small steps towards sustainability can create a big impact — see
                how ThaparKart encourages Thapar students to reduce waste
                through reuse.
              </p>
            </div>

            {/* Hero image – shadow same as LandingPage */}
            <div
              className="w-full h-[260px] sm:h-[360px] md:h-[480px] lg:h-[650px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
              style={{ backgroundImage: `url(${image15})` }}
            />
          </div>
        </section>

        {/* Article body – first text block */}
        <section className="w-[90%] mx-auto pb-12 md:pb-16">
          <div className="text-[18px] md:text-[20px] leading-[1.8] text-black font-small text-justify">
            <p className="mb-6">
              At ThaparKart, we believe that one student’s unused item can be another’s perfect find. 
              By promoting buying and selling within campus, we reduce unnecessary waste and 
              encourage a circular economy.
            </p>

            <p className="mb-6">
              From cycle resales to book exchanges, every transaction on ThaparKart saves resources 
              that would otherwise go unused. It’s not just about saving money — it’s about being 
              mindful of what we own and how we share it.
            </p>

            <p className="mb-6">
              Every product listed tells a story — a laptop that found a new home, a set of notes 
              passed on to help someone score better, or a hostel chair reused instead of being 
              discarded. Each small action contributes to a greener Thapar campus.
            </p>

            <p>
              As a student-run initiative, ThaparKart aims to empower students to make sustainable 
              choices effortlessly while keeping convenience and affordability at the forefront.
            </p>
          </div>
        </section>

        {/* Two side images – shadow same as LandingPage */}
        <section className="w-[90%] mx-auto pb-12 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="w-full h-[260px] md:h-[360px] lg:h-[436px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
              style={{ backgroundImage: `url(${image14})` }}
            />
            <div
              className="w-full h-[260px] md:h-[360px] lg:h-[436px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] bg-cover bg-center"
              style={{ backgroundImage: `url(${image16})` }}
            />
          </div>
        </section>

        {/* Second text block */}
        <section className="w-[90%] mx-auto pb-12 md:pb-16">
          <div className="text-[18px] md:text-[20px] leading-[1.8] text-black font-small text-justify">
            <p className="mb-6">
              ThaparKart is more than just a campus marketplace — it’s a community built by students, 
              for students. Whether you’re looking for affordable textbooks, a cycle to commute, or 
              decor for your hostel room.
            </p>

            <p>
              ThaparKart connects buyers and sellers across the Thapar campus safely and easily. Every 
              listing you browse or post contributes to a more sustainable and connected student 
              community.
            </p>
          </div>
        </section>

        {/* You May Also Like */}
        <section className="w-[90%] mx-auto pb-16 md:pb-20">
          <h2 className="font-heading text-[24px] md:text-[28px] lg:text-[32px] text-black mb-6">
            You May Also Like
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="flex flex-col items-start gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-full h-[220px] md:h-[260px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] overflow-hidden bg-[#f7f7f7]">
                <img
                  src={image11}
                  alt="5 Smart Ways to Reuse and Save on Campus"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-body-text text-black">
                  5 Smart Ways to Reuse and Save on Campus
                </p>
                <p className="font-body-text text-[#828282]">
                  ThaparKart Editorial Team
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col items-start gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-full h-[220px] md:h-[260px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] overflow-hidden bg-[#f7f7f7]">
                <img
                  src={image12}
                  alt="Student Success Stories"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-body-text text-black">
                  Student Success Stories: How I Earned ₹2000 from My Old Books
                </p>
                <p className="font-body-text text-[#828282]">Rohan Gupta</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col items-start gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="w-full h-[220px] md:h-[260px] rounded-lg shadow-[0px_6px_20px_rgba(0,0,0,0.05)] overflow-hidden bg-[#f7f7f7]">
                <img
                  src={image13}
                  alt="Inside ThaparKart"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-body-text text-black">
                  Inside ThaparKart: Building the Campus Marketplace Together
                </p>
                <p className="font-body-text text-[#828282]">
                  ThaparKart Team
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER (same structure as LandingPage) */}
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

export default Article;
