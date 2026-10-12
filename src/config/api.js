// src/config/api.js
export const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || (typeof globalThis !== "undefined" && globalThis.process?.env?.VITE_API_BASE_URL) || "";
export default API_BASE_URL;
