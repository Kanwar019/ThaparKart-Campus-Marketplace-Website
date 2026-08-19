// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import image1 from "../assets/image-1.png";
import BackButton from "../assets/icons/BackButton.svg";

import "../styles/Register.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpCooldown, setIsOtpCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // send OTP to backend
  const handleSendOtp = async () => {
    if (isOtpCooldown) return;

    if (!email.endsWith("@thapar.edu")) {
      alert("Please use a valid @thapar.edu email to get OTP.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to send OTP.");
        return;
      }

      alert("OTP sent to your @thapar.edu email.");
      setIsOtpCooldown(true);
      setCooldownSeconds(30); // 30-second cooldown (UI)
    } catch (err) {
      console.error("send-otp error:", err);
      alert("Could not send OTP. Try again.");
    }
  };

  // Cooldown timer: 30 seconds
  useEffect(() => {
    if (!isOtpCooldown) return;

    setCooldownSeconds((s) => (s > 0 ? s : 30));
    const interval = setInterval(() => {
      setCooldownSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setIsOtpCooldown(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOtpCooldown]);

  // register with otp verification
  const handleRegister = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!email.endsWith("@thapar.edu")) {
      alert("Please use a valid @thapar.edu email to register.");
      return;
    }

    if (!password || !verifyPassword) {
      alert("Please enter and verify your password.");
      return;
    }

    if (password !== verifyPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!otp.trim()) {
      alert("Please enter the OTP.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed.");
        return;
      }

      alert(data.message || "Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Error during register:", err);
      alert("Could not connect to server. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image with dimmer */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${image1})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Back button + ThaparKart logo */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer transition-transform hover:scale-[1.10]"
        >
          <img src={BackButton} alt="Back" className="w-6 h-6 invert" />
        </button>

        <p className="font-subheading font-bold text-[40px] md:text-[56px] lg:text-[60px] leading-none">
          <span className="text-[#ca0303]">Thapar</span>
          <span className="text-white">Kart</span>
        </p>
      </div>

      {/* Centered register card (smaller) */}
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[600px] bg-[#141414cc] rounded-[30px] md:rounded-[40px] px-6 py-8 md:px-10 md:py-8 text-white">
          <h1 className="font-subheading font-bold text-[34px] md:text-[42px] text-center tracking-[1px] mb-6">
            Register
          </h1>

          {/* Inputs */}
          <div className="space-y-4 md:space-y-5">
            {/* Name */}
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[46px] rounded-[24px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Enter your @thapar.edu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[46px] rounded-[24px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[46px] rounded-[24px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
            />

            {/* Verify Password */}
            <input
              type="password"
              placeholder="Verify Password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              className="w-full h-[46px] rounded-[24px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
            />

            {/* OTP row */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="flex-1 h-[46px] rounded-[24px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isOtpCooldown}
                className={`md:w-auto w-full px-5 h-[46px] flex items-center justify-center rounded-[24px] shadow-button-shadow cursor-pointer transition-transform ${
                  isOtpCooldown
                    ? "bg-[#e73b3b80] opacity-60 cursor-not-allowed"
                    : "bg-[#e73b3b80] hover:bg-[#e73b3bcc] hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                <span className="text-sm md:text-base font-medium">
                  {isOtpCooldown ? `Sent (${cooldownSeconds}s)` : "Send OTP"}
                </span>
              </button>
            </div>

            {/* Register Button */}
            <button
              type="button"
              onClick={handleRegister}
              className="mt-2 w-full h-[46px] flex justify-center items-center bg-[#e73b3b] rounded-[24px] shadow-button-shadow cursor-pointer hover:bg-[#c90202] hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span className="text-base font-medium">Register</span>
            </button>
          </div>

          {/* Already have account */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-5 mx-auto block text-center text-sm md:text-base text-white/80 hover:text-white transition-colors"
          >
            Already have an account? Login instead.
          </button>
        </div>
      </div>

      {/* Copyright */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs md:text-sm text-center">
        © 2025 ThaparKart | Campus Marketplace
      </p>
    </div>
  );
};

export default Register;
