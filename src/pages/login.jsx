// src/pages/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import image1 from "../assets/image-1.png";
import BackButton from "../assets/icons/BackButton.svg";

import "../styles/Login.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP+Pass
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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
        localStorage.setItem("isAdmin", "false");
        alert(data.message || "Login failed. Please try again.");
        return;
      }

      // -------- DETERMINE IF USER IS ADMIN --------
      let isAdmin = false;

      if (typeof data.isAdmin === "boolean") {
        isAdmin = data.isAdmin;
      } else if (data.user && typeof data.user.isAdmin === "boolean") {
        isAdmin = data.user.isAdmin;
      } else {
        const lower = email.toLowerCase();
        isAdmin = ADMIN_EMAILS.includes(lower);
      }

      try {
        localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
      } catch (err) {
        console.error("Could not write isAdmin to localStorage:", err);
      }

      alert("Login successful.");
      navigate("/landing-login");
    } catch (err) {
      console.error("Error during login:", err);
      alert("Could not connect to server. Please try again.");
      try {
        localStorage.setItem("isAdmin", "false");
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD LOGIC ---

  const handleSendResetOtp = async () => {
    if (!forgotEmail.endsWith("@thapar.edu")) {
      alert("Please enter a valid @thapar.edu email.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("OTP sent to your email!");
        setForgotStep(2);
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      alert("Server error sending OTP.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp || !forgotNewPass) {
      alert("Please fill in all fields.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          newPassword: forgotNewPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password reset successfully! Please login with your new password.");
        setShowForgot(false);
        setForgotStep(1);
        setForgotEmail("");
        setForgotOtp("");
        setForgotNewPass("");
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (err) {
      alert("Server error resetting password.");
    } finally {
      setForgotLoading(false);
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
          onClick={() => navigate("/landing")}
          className="cursor-pointer transition-transform hover:scale-[1.10]"
        >
          {/* Only arrow, white via invert */}
          <img src={BackButton} alt="Back" className="w-6 h-6 invert" />
        </button>

        {/* Logo */}
        <p className="font-subheading font-bold text-[40px] md:text-[56px] lg:text-[60px] leading-none">
          <span className="text-[#ca0303]">Thapar</span>
          <span className="text-white">Kart</span>
        </p>
      </div>

      {/* Centered login card */}
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[780px] bg-[#141414cc] rounded-[40px] md:rounded-[50px] px-6 py-8 md:px-12 md:py-10 text-white relative">
          
          {/* --- FORGOT PASSWORD OVERLAY --- */}
          {showForgot ? (
            <div className="flex flex-col items-center animate-fadeIn">
              <h2 className="font-subheading font-bold text-[32px] mb-2 text-center">
                Reset Password
              </h2>
              <p className="text-sm text-gray-300 mb-6 text-center">
                {forgotStep === 1
                  ? "Enter your email to receive a verification code."
                  : "Enter the OTP sent to your email and your new password."}
              </p>

              <div className="w-full space-y-5">
                {forgotStep === 1 ? (
                  /* Step 1: Email */
                  <input
                    type="email"
                    placeholder="Enter your @thapar.edu email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full h-[50px] rounded-[30px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
                  />
                ) : (
                  /* Step 2: OTP + New Pass */
                  <>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      className="w-full h-[50px] rounded-[30px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      className="w-full h-[50px] rounded-[30px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
                    />
                  </>
                )}

                <button
                  onClick={forgotStep === 1 ? handleSendResetOtp : handleResetPassword}
                  disabled={forgotLoading}
                  className="w-full h-10 flex justify-center items-center bg-[#e73b3b] rounded-[50px] shadow-button-shadow cursor-pointer hover:bg-[#c90202] transition-transform disabled:opacity-70"
                >
                  {forgotLoading
                    ? "Processing..."
                    : forgotStep === 1
                    ? "Send OTP"
                    : "Reset Password"}
                </button>

                <button
                  onClick={() => {
                    setShowForgot(false);
                    setForgotStep(1);
                  }}
                  className="block mx-auto text-sm text-white/80 hover:text-white mt-4 underline"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            /* --- NORMAL LOGIN FORM --- */
            <>
              <h1 className="font-subheading font-bold text-[40px] md:text-[55px] text-center tracking-[1px] mb-8">
                Login
              </h1>

              <div className="space-y-5 md:space-y-6">
                <input
                  type="email"
                  placeholder="Enter your @thapar.edu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[50px] rounded-[30px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[50px] rounded-[30px] bg-[#ffffff1a] border border-gray-300 px-4 text-white placeholder:text-[#b2b2b2] outline-none focus:border-white"
                />

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm md:text-base">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#e73b3b]"
                    />
                    <span className="leading-none">Remember me</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="mt-4 w-full h-10 flex justify-center items-center bg-[#e73b3b] rounded-[50px] shadow-button-shadow cursor-pointer hover:bg-[#c90202] hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="text-base font-medium">
                    {loading ? "Logging in..." : "Login"}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-6 mx-auto block text-center text-sm md:text-base text-white/80 hover:text-white transition-colors"
              >
                New here? Get started.
              </button>
            </>
          )}
        </div>
      </div>

      {/* Copyright */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs md:text-sm text-center">
        © 2025 ThaparKart | Campus Marketplace
      </p>
    </div>
  );
};

export default Login;