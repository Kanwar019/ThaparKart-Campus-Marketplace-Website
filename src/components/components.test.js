import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

// Setup Vite SSR instance to load and render JSX components deterministically in Node:test
let viteServer;
async function getViteServer() {
  if (!viteServer) {
    viteServer = await createServer({
      appType: "custom",
      server: { middlewareMode: true },
    });
  }
  return viteServer;
}

test("API_BASE_URL resolves safely across environments", async () => {
  const { API_BASE_URL, default: defaultExport } = await import("../config/api.js");
  assert.equal(typeof API_BASE_URL, "string");
  assert.equal(defaultExport, API_BASE_URL);
});

test("Footer component renders branding, divider, and all social links", async () => {
  const vite = await getViteServer();
  const { Footer } = await vite.ssrLoadModule("./src/components/Footer.jsx");
  assert.equal(typeof Footer, "function");

  const markup = renderToStaticMarkup(React.createElement(Footer));

  // Semantic elements and styling
  assert.match(markup, /<footer class="bg-white py-10 relative">/);
  assert.match(markup, /alt="Divider"/);
  assert.match(markup, /<span class="text-\[#c90202\] font-subheading">Thapar<\/span>/);
  assert.match(markup, /<span class="text-black font-subheading">Kart<\/span>/);

  // Social media presence
  assert.match(markup, /alt="facebook"/);
  assert.match(markup, /alt="instagram"/);
  assert.match(markup, /alt="linkedin"/);
  assert.match(markup, /alt="youtube"/);
});

test("AccountSidebar displays user profile data and standard action options", async () => {
  const vite = await getViteServer();
  const { AccountSidebar } = await vite.ssrLoadModule("./src/components/AccountSidebar.jsx");
  assert.equal(typeof AccountSidebar, "function");

  // Render with loaded profile
  const markupLoaded = renderToStaticMarkup(
    React.createElement(AccountSidebar, {
      profile: { name: "Aarav Sharma", email: "aarav@thapar.edu" },
      loading: false,
    })
  );

  assert.match(markupLoaded, /Aarav Sharma/);
  assert.match(markupLoaded, /aarav@thapar\.edu/);
  assert.match(markupLoaded, /w-\[35%\] bg-white rounded-2xl shadow-md p-6/);
  assert.match(markupLoaded, /Logout/);
  assert.match(markupLoaded, /Admin Dashboard/);
  assert.match(markupLoaded, /My Reservations/);
  assert.match(markupLoaded, /My Listings/);

  // Render with loading state
  const markupLoading = renderToStaticMarkup(
    React.createElement(AccountSidebar, { loading: true })
  );
  assert.match(markupLoading, /Loading\.\.\./);
});

test("AccountTabs highlights the selected active tab with strict design styling", async () => {
  const vite = await getViteServer();
  const { AccountTabs } = await vite.ssrLoadModule("./src/components/AccountTabs.jsx");
  assert.equal(typeof AccountTabs, "function");

  // Mock react-router-dom context using React Router or minimal provider if needed
  // Note: AccountTabs uses useNavigate, which throws if rendered without Router context
  const { MemoryRouter } = await vite.ssrLoadModule("react-router-dom");

  // 1. Orders tab active
  const markupOrders = renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(AccountTabs, { activeTab: "orders" }))
  );
  assert.match(markupOrders, /border-b-2 border-\[#c90202\] text-\[#c90202\][^>]*>Orders<\/div>/);
  assert.match(markupOrders, /My Listings<\/button>/);
  assert.match(markupOrders, /Security<\/button>/);

  // 2. Listings tab active
  const markupListings = renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(AccountTabs, { activeTab: "listings" }))
  );
  assert.match(markupListings, /Orders<\/button>/);
  assert.match(markupListings, /border-b-2 border-\[#c90202\] text-\[#c90202\][^>]*>My Listings<\/div>/);
  assert.match(markupListings, /Security<\/button>/);

  // 3. Security tab active
  const markupSecurity = renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(AccountTabs, { activeTab: "security" }))
  );
  assert.match(markupSecurity, /Orders<\/button>/);
  assert.match(markupSecurity, /My Listings<\/button>/);
  assert.match(markupSecurity, /border-b-2 border-\[#c90202\] text-\[#c90202\][^>]*>Security<\/div>/);
});

test("Header renders brand, search, and switches Login/Account based on session", async () => {
  const vite = await getViteServer();
  const { Header } = await vite.ssrLoadModule("./src/components/Header.jsx");
  const { MemoryRouter } = await vite.ssrLoadModule("react-router-dom");

  // Logged-out guest header
  const markupGuest = renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(Header, { loggedIn: false, showBack: false }))
  );
  assert.match(markupGuest, />Login<\/button>/);
  assert.doesNotMatch(markupGuest, />Account<\/button>/);
  assert.match(markupGuest, /placeholder="Search"/);
  assert.match(markupGuest, /Contact Us<\/button>/);
  assert.doesNotMatch(markupGuest, /alt="Back"/);

  // Logged-in header with back button
  const markupLoggedIn = renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(Header, { loggedIn: true, showBack: true }))
  );
  assert.match(markupLoggedIn, />Account<\/button>/);
  assert.doesNotMatch(markupLoggedIn, />Login<\/button>/);
  assert.match(markupLoggedIn, /alt="Back"/);
});

test("ErrorBoundary renders children when no error occurs", async () => {
  const vite = await getViteServer();
  const { ErrorBoundary } = await vite.ssrLoadModule("./src/components/ErrorBoundary.jsx");
  const markup = renderToStaticMarkup(
    React.createElement(ErrorBoundary, null, React.createElement("div", { className: "safe-child" }, "Safe Content"))
  );
  assert.match(markup, /Safe Content/);
  assert.match(markup, /class="safe-child"/);
  assert.doesNotMatch(markup, /Something went wrong/);
});

test("ErrorBoundary renders fallback UI when an error is caught in state", async () => {
  const vite = await getViteServer();
  const { ErrorBoundary } = await vite.ssrLoadModule("./src/components/ErrorBoundary.jsx");
  
  const errorState = ErrorBoundary.getDerivedStateFromError(new Error("Test crash"));
  assert.equal(errorState.hasError, true);

  const instance = new ErrorBoundary({});
  instance.state = { hasError: true, error: new Error("Test crash") };
  const fallbackNode = instance.render();
  const markup = renderToStaticMarkup(fallbackNode);
  assert.match(markup, /Something went wrong/);
  assert.match(markup, /An unexpected error occurred while loading this page/);
  assert.match(markup, /Back to Home/);
});

test.after(async () => {
  if (viteServer) {
    await viteServer.close();
  }
});
