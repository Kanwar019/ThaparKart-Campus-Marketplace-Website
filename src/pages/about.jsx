// src/pages/About.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Images / icons
import divider from "../assets/divider.svg";
import line1 from "../assets/line-1.svg";
import BackButton from "../assets/icons/BackButton.svg";

import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";
import image9 from "../assets/image-9.png";

import "../styles/About.css";

// Local fallback magnifying icon
const HealthiconsMagnifyingGlassOutline = ({ className = "", src }) =>
  src ? (
    <img src={src} className={className} alt="search icon" />
  ) : (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="11"
        cy="11"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

export const About = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [message, setMessage]     = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ firstName, lastName, email, message });
    setFirstName("");
    setLastName("");
    setEmail("");
    setMessage("");
    alert("Thanks — message submitted (check console).");
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      {/* 🔙 Back button (same style as Login) */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-20 cursor-pointer transition-transform hover:scale-[1.10]"
      >
        <img src={BackButton} alt="Back" className="w-7 h-7" />
      </button>

      {/* Header */}
      <header className="w-full h-[164px] bg-white flex items-center">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-baseline gap-0 cursor-pointer"
            aria-label="Go to homepage"
          >
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </button>

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
            <div className="hidden sm:flex w-[260px] md:w-[320px] lg:w-[360px] items-center justify-between px-4 py-2 rounded-[999px] border border-[#0000001a] bg-white">
              <input
                type="text"
                className="flex-1 bg-transparent outline-none font-body-text text-[#000000] placeholder:text-[#00000080]"
                placeholder="Search"
              />
              <button
                type="button"
                className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
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

            {/* 🔽 Updated Contact Us: scrolls to contact-section */}
            <button
              type="button"
              onClick={() => {
                const section = document.getElementById("contact-section");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-6 py-3.5 bg-black rounded-[999px] shadow-button-shadow text-white hover:bg-[#1a1a1a] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Us
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-[90%] mx-auto py-10 md:py-12">
        {/* Title Row */}
        <div className="flex items-start gap-8 md:gap-12">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              About <span className="text-[#c90202]">Thapar</span> Kart
            </h1>

            <p className="mt-6 text-[#828282] text-lg md:text-xl leading-relaxed">
              A campus-first, zero-fee marketplace built by students, for students.
            </p>

            <div className="mt-6 w-full">
              <img src={line1} alt="line" className="w-full h-px object-cover" />
            </div>

            <div className="mt-8 text-base text-[#444] space-y-4">
              <p>
                Designed and developed by a student team under faculty mentorship,
                ThaparKart enables verified students to list, discover, buy, sell,
                and exchange used goods — from books and gadgets to cycles and furniture.
              </p>

              <p>
                No shipping, no fees — just campus convenience, sustainability,
                and community trust.
              </p>
            </div>
          </div>

          {/* Right-side Card - replaced placeholder with image9 */}
<aside className="w-[50%] min-w-0 rounded-[20px] shadow-[0px_6px_20px_rgba(0,0,0,0.05)] p-6 bg-[#f7f7f7]">
  <div className="h-[300px] rounded-lg bg-white shadow-[0px_6px_20px_rgba(0,0,0,0.05)] flex items-center justify-center overflow-hidden">
    <img
      src={image9}
      alt="ThaparKart illustration"
      loading="lazy"
      className="h-full w-full max-w-full object-cover"
    />
  </div>
</aside>

        </div>

        {/* Contact Form */}
        <section
          id="contact-section"
          className="mt-12 max-w-3xl scroll-mt-24"
        >
          <h2 className="text-2xl md:text-3xl font-semibold">Contact the Team</h2>
          <p className="mt-2 text-[#828282]">
            Have feedback, issues, or ideas for ThaparKart? Let us know.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-4 flex-wrap">
              <div className="w-full md:w-[295px]">
                <label className="block text-sm mb-2">First name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#dfdfdf] shadow-button-shadow"
                />
              </div>

              <div className="w-full md:w-[297px]">
                <label className="block text-sm mb-2">Last name</label>
                <input
                  type="text"
                  placeholder="Smitherton"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#dfdfdf] shadow-button-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Email address</label>
              <input
                type="email"
                required
                placeholder="yourname@thapar.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#dfdfdf] shadow-button-shadow"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Your message</label>
              <textarea
                required
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#dfdfdf] shadow-button-shadow h-40 resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-4 bg-black text-white rounded-[20px] shadow-button-shadow hover:bg-[#1a1a1a] transition-colors"
            >
              Submit
            </button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 relative">
        <img
          src={divider}
          alt="Divider"
          className="w-[calc(100%_-_160px)] max-w-[1200px] mx-auto h-px object-cover absolute top-0 left-0 right-0"
        />

        <div className="w-[90%] mx-auto flex items-center justify-between pt-4">
          <p className="font-subheading text-[length:var(--subheading-font-size)]">
            <span className="text-[#c90202]">Thapar</span>
            <span className="text-black">Kart</span>
          </p>

          <div className="flex items-center gap-3">
            <img
              src={facebookIcon}
              alt="facebook"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02]"
            />
            <img
              src={instagramIcon}
              alt="instagram"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02]"
            />
            <img
              src={linkedinIcon}
              alt="linkedin"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02]"
            />
            <img
              src={youtubeIcon}
              alt="youtube"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02]"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
