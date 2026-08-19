// src/App.jsx
import React, { Suspense, lazy, useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Lazy imports (each one is now a normal static import) ---
const About = lazy(() => import("./pages/about.jsx"));
const AboutWithLogin = lazy(() => import("./pages/aboutwithlogin.jsx"));
const AdminPage = lazy(() => import("./pages/admin page.jsx"));
const AllListing = lazy(() => import("./pages/all_listing.jsx"));
const AllListingLogin = lazy(() => import("./pages/all_listings_login.jsx"));
const Article = lazy(() => import("./pages/article.jsx"));
const ArticleWithLogin = lazy(() => import("./pages/article with login.jsx"));
const Chat = lazy(() => import("./pages/chat.jsx"));
const CreateListing = lazy(() => import("./pages/create_listing.jsx"));
const CreateListingWithLogin = lazy(() =>
  import("./pages/create a listing with login.jsx")
);
const EditListings = lazy(() => import("./pages/edit_listings.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const LandingPageWithLogin = lazy(() =>
  import("./pages/LandingPagewithLogin.jsx")
);
const Login = lazy(() => import("./pages/login.jsx"));
const MyAccountListings = lazy(() =>
  import("./pages/my account listings.jsx")
);
const MyAccountOrders = lazy(() =>
  import("./pages/my account orders.jsx")
);
const MyAccountSecurity = lazy(() =>
  import("./pages/my account security.jsx")
);
const MyListing = lazy(() => import("./pages/my_listing.jsx"));
const ProductDetail = lazy(() => import("./pages/product_detail.jsx"));
const ProductDetailWithLogin = lazy(() =>
  import("./pages/productdetailpagewithlogin.jsx")
);
const Register = lazy(() => import("./pages/register.jsx"));
const Reservation = lazy(() => import("./pages/reservation.jsx"));
const Shop = lazy(() => import("./pages/shop.jsx"));
const ShopLogin = lazy(() => import("./pages/shop_login.jsx"));

// Fallback loader while lazy components load
function Loader() {
  return (
    <div className="w-full h-screen flex items-center justify-center text-xl">
      Loading...
    </div>
  );
}

// ✅ Only these emails can access /admin
const ADMIN_EMAILS = [
  "ksingh2_be23@thapar.edu",
  "ybhansali_be23@thapar.edu",
];

// ✅ Wrapper that checks login + email before rendering AdminPage
function ProtectedAdminPage() {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: "include",
        });

        if (res.status === 401) {
          alert("Please log in to access the admin panel.");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        const email = data.email || "";

        if (ADMIN_EMAILS.includes(email)) {
          setAllowed(true);
        } else {
          alert("You are not authorised to view the admin page.");
          navigate("/landing-login");
        }
      } catch (err) {
        console.error("Error checking admin access:", err);
        alert("Could not verify access. Please try again later.");
        navigate("/landing-login");
      } finally {
        setChecking(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (checking) return <Loader />;
  if (!allowed) return null;

  return <AdminPage />;
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/landing-login" element={<LandingPageWithLogin />} />

        {/* About */}
        <Route path="/about" element={<About />} />
        <Route path="/about-login" element={<AboutWithLogin />} />

        {/* Admin – protected */}
        <Route path="/admin" element={<ProtectedAdminPage />} />

        {/* Listings / Shop */}
        <Route path="/listings" element={<AllListing />} />
        <Route path="/listings-login" element={<AllListingLogin />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route
          path="/create-listing-login"
          element={<CreateListingWithLogin />}
        />
        <Route path="/edit-listings/:id" element={<EditListings />} />

        <Route path="/shop" element={<Shop />} />
        <Route path="/shop-login" element={<ShopLogin />} />

        {/* Product detail */}
        <Route path="/product" element={<ProductDetail />} />
        <Route path="/product-login" element={<ProductDetailWithLogin />} />

        {/* Account */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/my-account/listings"
          element={<MyAccountListings />}
        />
        <Route path="/my-account/orders" element={<MyAccountOrders />} />
        <Route
          path="/my-account/security"
          element={<MyAccountSecurity />}
        />
        <Route path="/my-listing" element={<MyListing />} />

        {/* Misc */}
        <Route path="/article" element={<Article />} />
        <Route path="/article-login" element={<ArticleWithLogin />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/reservation" element={<Reservation />} />

        {/* 404 */}
        <Route
          path="*"
          element={<div className="p-10 text-center">404 Page Not Found</div>}
        />
      </Routes>
    </Suspense>
  );
}
