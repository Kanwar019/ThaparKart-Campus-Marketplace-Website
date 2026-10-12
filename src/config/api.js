// src/config/api.js
const isLoopback =
  typeof window !== "undefined" &&
  Boolean(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const isLanIp =
  typeof window !== "undefined" &&
  Boolean(
    /^(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(
      window.location.hostname
    ) || window.location.hostname.endsWith(".local")
  );

const DEFAULT_API_BASE_URL = isLoopback
  ? "http://localhost:5000"
  : isLanIp
  ? `http://${window.location.hostname}:5000`
  : "https://thaparkart-backend.onrender.com";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE_URL) ||
  (typeof globalThis !== "undefined" && globalThis.process?.env?.VITE_API_BASE_URL) ||
  DEFAULT_API_BASE_URL;


export const getAuthHeaders = () => {
  try {
    if (typeof localStorage !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
        return { Authorization: `Bearer ${token}` };
      }
    }
  } catch {}
  return {};
};

export default API_BASE_URL;

