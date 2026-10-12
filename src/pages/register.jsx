// src/pages/register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import image1 from "../assets/image-1.png";
import BackButton from "../assets/icons/BackButton.svg";

import { API_BASE_URL } from "../config/api.js";
import "../styles/Register.css";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [otp, setOtp] = useState("");

  // OTP cooldown states
  const [isOtpCooldown, setIsOtpCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const navigate = useNavigate();


  // Handle countdown timer
  useEffect(() => {
    if (!isOtpCooldown || cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          setIsOtpCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOtpCooldown, cooldownSeconds]);

  // Send OTP
  const handleSendOtp = async () => {
    if (!email.endsWith("@thapar.edu")) {
      alert("Please use your @thapar.edu email.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Failed to send OTP");
        return;
      }

      alert("OTP sent to your email!");
      setIsOtpCooldown(true);
      setCooldownSeconds(60);
    } catch (err) {
      console.error("Send OTP error:", err);
      alert("Network error. Please try again.");
    }
  };

  // Register
  const handleRegister = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!email.endsWith("@thapar.edu")) {
      alert("Please use your @thapar.edu email.");
      return;
    }

    if (!password) {
      alert("Please enter a password.");
      return;
    }

    if (password !== verifyPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!otp.trim()) {
      alert("Please enter the OTP sent to your email.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          otp,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      alert("Network error. Please try again.");
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
            onClick={() => navigate("/login")}
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

      {/* Centered register card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 z-10">
        <div className="w-full max-w-[540px] bg-[#141414e6] backdrop-blur-md rounded-3xl sm:rounded-[40px] border border-white/10 px-6 py-8 sm:px-10 sm:py-10 text-white shadow-2xl">
          <h1 className="font-subheading font-bold text-3xl sm:text-4xl text-center tracking-wide mb-6">
            Register
          </h1>

          {/* Inputs */}
          <div className="space-y-3.5 sm:space-y-4">
            {/* Name */}
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-full bg-white/10 border border-gray-400/50 px-4 text-white placeholder:text-gray-400 outline-none focus:border-white text-sm"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Enter your @thapar.edu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-full bg-white/10 border border-gray-400/50 px-4 text-white placeholder:text-gray-400 outline-none focus:border-white text-sm"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 rounded-full bg-white/10 border border-gray-400/50 px-4 text-white placeholder:text-gray-400 outline-none focus:border-white text-sm"
            />

            {/* Verify Password */}
            <input
              type="password"
              placeholder="Verify Password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              className="w-full h-12 rounded-full bg-white/10 border border-gray-400/50 px-4 text-white placeholder:text-gray-400 outline-none focus:border-white text-sm"
            />

            {/* OTP row */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="flex-1 h-12 rounded-full bg-white/10 border border-gray-400/50 px-4 text-white placeholder:text-gray-400 outline-none focus:border-white text-sm"
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isOtpCooldown}
                className={`sm:w-auto w-full px-5 h-12 flex items-center justify-center rounded-full shadow-button-shadow cursor-pointer transition text-sm font-medium ${
                  isOtpCooldown
                    ? "bg-[#e73b3b80] opacity-60 cursor-not-allowed"
                    : "bg-[#e73b3b] hover:bg-[#c90202] hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {isOtpCooldown ? `Sent (${cooldownSeconds}s)` : "Send OTP"}
              </button>
            </div>

            {/* Register Button */}
            <button
              type="button"
              onClick={handleRegister}
              className="mt-2 w-full h-12 flex justify-center items-center bg-[#e73b3b] rounded-full shadow-button-shadow cursor-pointer hover:bg-[#c90202] hover:scale-[1.01] active:scale-[0.99] transition font-medium text-base"
            >
              Register
            </button>
          </div>

          {/* Already have account */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-5 mx-auto block text-center text-xs sm:text-sm text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            Already have an account? Login instead.
          </button>
        </div>
      </div>

      {/* Copyright */}
      <p className="py-4 text-white/80 text-xs text-center z-10">
        © 2025 ThaparKart | Campus Marketplace
      </p>
    </div>
  );
};

export default Register;
