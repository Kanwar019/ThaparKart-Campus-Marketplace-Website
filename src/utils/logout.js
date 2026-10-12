import { getAuthHeaders } from "../config/api.js";

export async function logout(apiBaseUrl, navigate) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error("Logout failed");
  } catch {
    alert("Could not log out. Please try again.");
    return;
  }

  try {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
  } catch {
    // Storage may be disabled; the server has already cleared the session cookie.
  }
  navigate("/login", { replace: true });
}
