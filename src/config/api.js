// src/config/api.js
const isLocalhost =
  typeof window !== "undefined" &&
  Boolean(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const DEFAULT_API_BASE_URL = isLocalhost
  ? "http://localhost:5000"
  : "https://thaparkart-backend.onrender.com";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE_URL) ||
  (typeof globalThis !== "undefined" && globalThis.process?.env?.VITE_API_BASE_URL) ||
  DEFAULT_API_BASE_URL;

export default API_BASE_URL;

