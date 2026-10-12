export async function logout(apiBaseUrl, navigate) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Logout failed");
  } catch {
    alert("Could not log out. Please try again.");
    return;
  }

  try {
    localStorage.removeItem("isAdmin");
  } catch {
    // Storage may be disabled; the server has already cleared the session cookie.
  }
  navigate("/login", { replace: true });
}
