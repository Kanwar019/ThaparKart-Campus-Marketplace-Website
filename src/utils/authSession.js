let temporaryToken = null;

export const saveAuthToken = (token) => {
  temporaryToken = token;
  try {
    localStorage.setItem("authToken", token);
    temporaryToken = null;
  } catch { /* Keep this tab signed in if browser storage is unavailable. */ }
};

export const clearTemporaryAuthToken = () => { temporaryToken = null; };

export const getAuthHeaders = () => {
  if (temporaryToken) return { Authorization: `Bearer ${temporaryToken}` };
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




export const readStoredValue = (key) => {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
};
