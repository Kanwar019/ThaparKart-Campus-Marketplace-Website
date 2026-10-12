// src/pages/About.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Images / icons
import line1 from "../assets/line-1.svg";
import image9 from "../assets/image-9.png";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL } from "../config/api.js";

import "../styles/About.css";
import { listingSearchUrl } from "../utils/listingSearch.js";

export const About = ({ loggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogged = loggedIn ?? (location?.pathname.includes("-login") || false);

  const [searchValue, setSearchValue] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [message, setMessage]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = () => {
    navigate(listingSearchUrl(isLogged, { search: searchValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send feedback.");
        return;
      }

      alert("Thank you! Your feedback has been submitted.");

      setFirstName("");
      setLastName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Network error:", err);
      alert("Server error. Check backend logs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f0f11] text-black dark:text-white min-h-screen flex flex-col transition-colors">
      {/* Responsive Header */}
      <Header
        loggedIn={isLogged}
        showBack={true}
        onBack={() => navigate(-1)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
        contactScrollId="contact-section"
      />

      {/* Main Content */}
      <main className="flex-1 w-[92%] max-w-[1300px] mx-auto py-8 sm:py-10 md:py-12">
        {/* Title Row */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
          <div className="w-full lg:flex-1 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              About <span className="text-[#c90202]">Thapar</span> Kart
            </h1>

            <p className="mt-4 sm:mt-6 text-[#828282] dark:text-neutral-400 text-base sm:text-lg md:text-xl leading-relaxed">
              A campus-first, zero-fee marketplace built by students, for students.
            </p>

            <div className="mt-6 w-full">
              <img src={line1} alt="line" className="w-full h-px object-cover dark:opacity-20" />
            </div>

            <div className="mt-6 sm:mt-8 text-sm sm:text-base text-[#444] dark:text-neutral-300 space-y-4 leading-relaxed">
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

          {/* Right-side Card */}
          <aside className="w-full lg:w-[45%] rounded-2xl shadow-[0px_6px_20px_rgba(0,0,0,0.05)] p-5 sm:p-6 bg-[#f7f7f7] dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
            <div className="h-[260px] sm:h-[320px] rounded-xl bg-white dark:bg-neutral-800 shadow-xs flex items-center justify-center overflow-hidden">
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
          className="mt-14 sm:mt-20 max-w-3xl scroll-mt-24 border-t border-neutral-200 dark:border-neutral-800 pt-10"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white">
            Contact the Team
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#828282] dark:text-neutral-400">
            Have feedback, issues, or ideas for ThaparKart? Let us know.
          </p>

          <form className="mt-6 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#dfdfdf] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white shadow-button-shadow outline-none focus:border-black dark:focus:border-white transition"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Smitherton"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#dfdfdf] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white shadow-button-shadow outline-none focus:border-black dark:focus:border-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="yourname@thapar.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#dfdfdf] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white shadow-button-shadow outline-none focus:border-black dark:focus:border-white transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
                Your message
              </label>
              <textarea
                required
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#dfdfdf] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white shadow-button-shadow h-36 sm:h-40 resize-none outline-none focus:border-black dark:focus:border-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full shadow-button-shadow hover:bg-[#1a1a1a] dark:hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const AboutWithLogin = (props) => <About loggedIn={true} {...props} />;

export default About;
