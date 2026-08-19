// src/pages/admin page.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin_Page.css";

export const AdminPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  // Stats state (matches backend: users, listings, feedback)
  const [stats, setStats] = useState({ users: 0, listings: 0, feedback: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  // 🔹 NEW: recent listings for "Recent activity"
  const [recentListings, setRecentListings] = useState([]);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Load dark mode & admin flag
  useEffect(() => {
    try {
      const storedDark = localStorage.getItem("adminDarkMode");
      if (storedDark === "true") setDarkMode(true);

      const storedAdmin = localStorage.getItem("isAdmin");
      setIsAdmin(storedAdmin === "true");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Fetch feedback only if admin
  useEffect(() => {
    if (!isAdmin) return;

    const fetchFeedbacks = async () => {
      try {
        setLoadingFeedback(true);
        setFeedbackError("");

        const res = await fetch(`${API_BASE_URL}/api/feedback`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load feedback");
        }

        const data = await res.json();
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading feedback:", err);
        setFeedbackError("Could not load feedback. Please try again later.");
        setFeedbacks([]);
      } finally {
        setLoadingFeedback(false);
      }
    };

    fetchFeedbacks();
  }, [isAdmin, API_BASE_URL]);

  // Fetch stats only if admin
  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setStatsError("");

        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load stats");
        }

        const data = await res.json();

        setStats({
          users: data.users ?? 0,
          listings: data.listings ?? 0,
          feedback: data.feedback ?? 0,
        });
      } catch (err) {
        console.error("Error loading stats:", err);
        setStatsError("Could not load stats");
        setStats({ users: 0, listings: 0, feedback: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [isAdmin, API_BASE_URL]);

  // 🔹 NEW: fetch recent listings for "Recent activity"
  useEffect(() => {
    if (!isAdmin) return;

    const fetchRecentListings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listings`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load listings");
        }

        const data = await res.json();
        // Take latest 2 (backend usually returns newest first)
        setRecentListings(Array.isArray(data) ? data.slice(0, 2) : []);
      } catch (err) {
        console.error("Error loading recent listings:", err);
        setRecentListings([]);
      }
    };

    fetchRecentListings();
  }, [isAdmin, API_BASE_URL]);

  const handleBack = () => navigate(-1);
  const handleHome = () => navigate("/landing-login");

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("adminDarkMode", next ? "true" : "false");
      } catch {}
      return next;
    });
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewFeedback = (fb) => {
    alert(
      `From: ${fb.firstName || ""} ${fb.lastName || ""} <${fb.email || ""}>\nDate: ${
        formatDate(fb.createdAt) || "N/A"
      }\n\nMessage:\n${fb.message || ""}`
    );
  };

  const handleReplyEmail = (fb) => {
    if (!fb.email) return;
    window.location.href = `mailto:${fb.email}?subject=ThaparKart%20Feedback`;
  };

  // Export CSV handler (uses /api/admin/export)
  const handleExportCsv = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/export`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to export CSV");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thaparkart-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Could not export CSV. Please try again.");
    }
  };

  // Filter by search term (name, email, message)
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const haystack = `${fb.firstName || ""} ${fb.lastName || ""} ${fb.email || ""} ${
      fb.message || ""
    }`.toLowerCase();
    return haystack.includes(term);
  });

  // Non-admin "back page"
  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-black px-4">
        <p className="text-2xl font-semibold mb-3 text-center">
          This page is only for admins.
        </p>
        <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
          You’re logged in as a regular user. If you think this is a mistake, log in
          with your admin account (e.g. <span className="font-mono">admin@thapar.edu</span>).
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-sm"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate("/landing-login")}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-[#1a1a1a] transition text-sm"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Admin view

  const pageBg = darkMode ? "bg-[#050505] text-white" : "bg-white text-black";
  const cardBg = darkMode ? "bg-[#111111] border border-[#333333]" : "bg-white";
  const subtleText = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-[#333333]" : "border-gray-200";

  // 🔹 Latest feedback (for recent activity)
  const latestFeedback = feedbacks.length > 0 ? feedbacks[0] : null;

  const latestFeedbackShortName =
    latestFeedback &&
    ((latestFeedback.firstName && latestFeedback.lastName
      ? `${latestFeedback.firstName} ${latestFeedback.lastName}`
      : latestFeedback.firstName ||
        latestFeedback.lastName ||
        latestFeedback.email));

  return (
    <div
      className={`${pageBg} overflow-hidden w-full min-h-screen relative p-6 transition-colors`}
    >
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between w-full">
        {/* BACK + BRAND */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-2xl cursor-pointer hover:text-[#c90202] transition"
          >
            ←
          </button>

          <div>
            <p className="text-lg font-bold">
              <span className="text-[#c90202]">Thapar</span>
              <span className={darkMode ? "text-white" : "text-black"}>Kart</span>
            </p>
            <p className={`text-sm ${subtleText} -mt-1`}>Moderation &amp; Reports</p>
          </div>
        </div>

        {/* RIGHT: HOME + SEARCH + EXPORT + THEME */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`px-3 py-2 rounded-lg text-sm border ${borderColor} hover:bg-[#262626] transition ${
              darkMode ? "bg-[#121212]" : "bg-[#f5f5f5] hover:bg-[#e5e5e5]"
            }`}
          >
            {darkMode ? "Light mode" : "Dark mode"}
          </button>

          {/* Home */}
          <button
            onClick={handleHome}
            className={`px-4 py-2 rounded-lg border ${borderColor} hover:bg-[#f2f2f2] transition text-sm ${
              darkMode ? "bg-[#111111] hover:bg-[#1f1f1f]" : "bg-white"
            }`}
          >
            Home
          </button>

          {/* Search input */}
          <div
            className={`flex items-center rounded-lg px-3 py-2 border ${borderColor} ${
              darkMode ? "bg-[#111111]" : "bg-white"
            }`}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback"
              className={`outline-none text-sm w-full ${
                darkMode
                  ? "bg-transparent text-gray-200 placeholder:text-gray-500"
                  : "text-gray-700"
              }`}
            />
          </div>

          {/* Search button (client-side only) */}
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm transition ${
              darkMode
                ? "bg-[#333333] hover:bg-[#444444] text-white"
                : "bg-gray-300 hover:bg-gray-400 text-black"
            }`}
          >
            Search
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className={`px-4 py-2 rounded-lg border ${borderColor} text-sm font-medium transition ${
              darkMode ? "bg-[#111111] hover:bg-[#1f1f1f]" : "bg-white hover:bg-gray-100"
            }`}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* ---------- STATS CARDS ---------- */}
      <div className="grid grid-cols-3 gap-6 mt-10">
        <div className={`p-5 rounded-xl shadow ${cardBg}`}>
          <p className={`text-sm ${subtleText}`}>Active users</p>
          <h2 className="text-3xl font-bold mt-2">
            {loadingStats ? "…" : statsError ? "-" : stats.users}
          </h2>
          <p className={`text-sm mt-1 ${subtleText}`}>Total registered users</p>
        </div>

        <div className={`p-5 rounded-xl shadow ${cardBg}`}>
          <p className={`text-sm ${subtleText}`}>Active listings</p>
          <h2 className="text-3xl font-bold mt-2">
            {loadingStats ? "…" : statsError ? "-" : stats.listings}
          </h2>
          <p className={`text-sm mt-1 ${subtleText}`}>Overall listings</p>
        </div>

        <div className={`p-5 rounded-xl shadow ${cardBg}`}>
          <p className={`text-sm ${subtleText}`}>Feedback received</p>
          <h2 className="text-3xl font-bold mt-2">
            {loadingStats ? "…" : statsError ? "-" : stats.feedback}
          </h2>
          <p className={`text-sm mt-1 ${subtleText}`}>From contact form</p>
        </div>
      </div>

      {/* ---------- CONTENT AREA ---------- */}
      <div className="flex gap-6 w-full mt-10">
        {/* LEFT: FEEDBACK TABLE */}
        <div className={`flex-1 rounded-xl shadow p-5 ${cardBg}`}>
          <h3 className="font-semibold text-lg mb-4">User Feedback</h3>

          <div
            className={`border-b pb-2 flex justify-between text-sm font-semibold ${subtleText}`}
          >
            <span>Message</span>
            <span>From</span>
            <span>Actions</span>
          </div>

          {loadingFeedback ? (
            <div className="py-6 text-sm">Loading feedback…</div>
          ) : feedbackError ? (
            <div className="py-6 text-sm text-red-500">{feedbackError}</div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="py-6 text-sm">No feedback found.</div>
          ) : (
            filteredFeedbacks.map((fb, idx) => (
              <div
                key={fb._id || idx}
                className={`flex justify-between items-start py-4 border-b ${borderColor}`}
              >
                <div className="max-w-[55%]">
                  <p className="font-semibold">
                    {(fb.message || "").length > 70
                      ? `${fb.message.slice(0, 70)}…`
                      : fb.message || "No message"}
                  </p>
                  <p className={`text-sm ${subtleText}`}>
                    {formatDate(fb.createdAt) || "No date"}
                  </p>
                </div>

                <div className="text-sm text-right mr-4 min-w-[160px]">
                  <p>
                    {fb.firstName || fb.lastName
                      ? `${fb.firstName || ""} ${fb.lastName || ""}`
                      : "Anonymous"}
                  </p>
                  <p className={subtleText}>{fb.email || "No email"}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewFeedback(fb)}
                    className={`px-3 py-2 rounded-lg text-sm border ${borderColor} hover:bg-[#262626] transition ${
                      darkMode ? "bg-[#111111]" : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReplyEmail(fb)}
                    className={`px-3 py-2 rounded-lg text-sm border ${borderColor} hover:bg-[#262626] transition ${
                      darkMode ? "bg-[#111111]" : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: Quick Actions + Recent Activity */}
        <div className="w-[30%] flex flex-col gap-6">
          <div className={`rounded-xl shadow p-5 ${cardBg}`}>
            <h3 className="font-semibold mb-3">Quick actions</h3>

            <div
              className={`border rounded-lg p-3 mb-3 cursor-pointer transition ${borderColor} ${
                darkMode ? "hover:bg-[#1f1f1f]" : "hover:bg-gray-100"
              }`}
            >
              Generate weekly report
              <p className={`text-xs mt-1 ${subtleText}`}>
                CSV of listings &amp; feedback
              </p>
            </div>

            <div
              className={`border rounded-lg p-3 mb-3 cursor-pointer transition ${borderColor} ${
                darkMode ? "hover:bg-[#1f1f1f]" : "hover:bg-gray-100"
              }`}
            >
              Moderators
              <p className={`text-xs mt-1 ${subtleText}`}>
                Manage moderator accounts
              </p>
            </div>

            <div
              className={`border rounded-lg p-3 cursor-pointer transition ${borderColor} ${
                darkMode ? "hover:bg-[#1f1f1f]" : "hover:bg-gray-100"
              }`}
            >
              Site settings
              <p className={`text-xs mt-1 ${subtleText}`}>
                Categories, rules, policies
              </p>
            </div>
          </div>

          {/* 🔹 UPDATED: Recent activity now dynamic */}
          <div className={`rounded-xl shadow p-5 ${cardBg}`}>
            <h3 className="font-semibold mb-2">Recent activity</h3>

            <p className={`text-sm border-b pb-2 mb-2 ${borderColor}`}>
              {recentListings[0]
                ? `New listing: ${recentListings[0].title || "Untitled item"}`
                : "No recent listings yet."}
            </p>

            <p className={`text-sm border-b pb-2 mb-2 ${borderColor}`}>
              {recentListings[1]
                ? `New listing: ${recentListings[1].title || "Untitled item"}`
                : latestFeedbackShortName
                ? `New feedback from ${latestFeedbackShortName}`
                : "No feedback yet."}
            </p>

            <p className="text-sm">
              {latestFeedback
                ? `Latest feedback on ${
                    formatDate(latestFeedback.createdAt) || "N/A"
                  }`
                : "Platform is quiet right now."}
            </p>
          </div>
        </div>
      </div>

      <p className={`mt-8 text-xs ${subtleText}`}>
        Admin tools and moderation flows follow the SRS and admin use-cases
        defined in the project.
      </p>
    </div>
  );
};

export default AdminPage;
