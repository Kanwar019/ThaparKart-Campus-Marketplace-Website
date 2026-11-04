// src/pages/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import image1 from "../assets/image-1.png";
import BackButton from "../assets/icons/BackButton.svg";

import { API_BASE_URL, saveAuthToken } from "../config/api.js";
import "../styles/Login.css";
import GoogleSignIn from "../components/GoogleSignIn.jsx";

// emails that should have admin access
const ADMIN_EMAILS = [
  "ksingh2_be23@thapar.edu",
  "ybhansali_be23@thapar.edu",
];

export const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  const handleLogin = async () => {
    if (!email.endsWith("@thapar.edu")) {
      alert("Please use your @thapar.edu email.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // so the httpOnly cookie gets set
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      const lowerEmail = email.toLowerCase();
      const isAdmin =
        data.isAdmin ||
        data.user?.isAdmin ||
        data.user?.role === "admin" ||
        ADMIN_EMAILS.includes(lowerEmail);

      if (data.token) saveAuthToken(data.token);
      try {
        localStorage.setItem("userEmail", lowerEmail);
        localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }

      // Always navigate to the landing page after login, not admin panel
      navigate("/landing-login", { replace: true });
    } catch (err) {
      console.error("Login network/server error:", err);
      alert("Could not connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between">
      {/* Background image with dimmer */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${image1})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Top Bar: Back button + ThaparKart logo */}
      <div className="w-[92%] max-w-[1300px] mx-auto pt-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate("/landing")}
            className="cursor-pointer transition-transform hover:scale-110 p-1"
            aria-label="Back"
          >
            <img src={BackButton} alt="Back" className="w-5 h-5 sm:w-6 sm:h-6 invert" />
          </button>

          <p className="font-subheading font-bold text-2xl sm:text-4xl md:text-5xl leading-none">
            <span className="text-[#ca0303]">Thapar</span>
            <span className="text-white">Kart</span>
          </p>
        </div>
      </div>

      {/* Centered login card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 z-10">
        <div className="w-full max-w-[560px] bg-[#141414e6] backdrop-blur-md rounded-3xl sm:rounded-[40px] border border-white/10 px-6 py-8 sm:px-10 sm:py-10 text-white shadow-2xl">
          <>
              <h1 className="font-subheading font-bold text-3xl sm:text-4xl text-center tracking-wide mb-6">
                Login
              </h1>

              <GoogleSignIn />
              <p className="text-center text-sm text-gray-400 my-6">Or use your existing ThaparKart password</p>
              <div className="space-y-4 sm:space-y-5">
                <input
                  type="email"
                  placeholder="Enter your @thapar.edu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 rounded-full bg-white/10 border border-gray-400/50 px-4 text-white placeholder:text-gray-400 outline-none focus:border-white text-sm"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 rounded-full bg-white/10 border border-gray-400/50 px-4 text-white placeholder:text-gray-400 outline-none focus:border-white text-sm"
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs sm:text-sm">
                  <span className="text-white/80">Forgot your password? Use Google above.</span>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#e73b3b]"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="mt-3 w-full h-11 flex justify-center items-center bg-[#e73b3b] rounded-full shadow-button-shadow cursor-pointer hover:bg-[#c90202] hover:scale-[1.01] active:scale-[0.99] transition font-medium text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-6 mx-auto block text-center text-xs sm:text-sm text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                New here? Get started.
              </button>
            </>

        </div>
      </div>

      {/* Copyright */}
      <p className="py-4 text-white/80 text-xs text-center z-10">
        © 2025 ThaparKart | Campus Marketplace
      </p>
    </div>
  );
};

export default Login;