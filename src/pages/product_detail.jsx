// src/pages/product_detail.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL } from "../config/api.js";

import "../styles/Product_Detail_Page.css";
import { listingSearchUrl } from "../utils/listingSearch.js";

const initialProduct = {
  title: "Casio Scientific Calculator FX-991ES",
  description: "Fully functional, no scratches.",
  price: "₹500",
  mainImage: "/image.png",
  category: "",
  condition: "",
  imageUrls: ["/image.png", "/image-2.png", "/image-3.png", "/image-4.png"],
  sellerId: null,
};

export const ProductDetail = ({ loggedIn }) => {
  const [searchValue, setSearchValue] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const isLogged = loggedIn ?? (location?.pathname.includes("-login") || false);

  const productFromState = location.state?.product || null;
  const listingId = location.state?.listingId || null;

  const [selectedProduct, setSelectedProduct] = useState(
    productFromState || initialProduct
  );
  const [selectedImage, setSelectedImage] = useState(
    (productFromState && productFromState.mainImage) || initialProduct.mainImage
  );
  const [thumbSources, setThumbSources] = useState(
    productFromState &&
      Array.isArray(productFromState.imageUrls) &&
      productFromState.imageUrls.length > 0
      ? productFromState.imageUrls
      : initialProduct.imageUrls
  );
  const [isReserved, setIsReserved] = useState(false);
  const [isReserving, setIsReserving] = useState(false);

  const [loadingListing, setLoadingListing] = useState(false);
  const [relatedListings, setRelatedListings] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (!productFromState || listingId) return;

    setSelectedProduct(productFromState);
    setSelectedImage(productFromState.mainImage || "/image.png");

    if (
      Array.isArray(productFromState.imageUrls) &&
      productFromState.imageUrls.length > 0
    ) {
      setThumbSources(productFromState.imageUrls);
    } else {
      setThumbSources(initialProduct.imageUrls);
    }
  }, [productFromState, listingId]);

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      try {
        setLoadingListing(true);

        const res = await fetch(
          `${API_BASE_URL}/api/listings/${listingId}`
        );
        if (!res.ok) {
          throw new Error("Failed to load listing");
        }

        const data = await res.json();

        const imageUrls =
          Array.isArray(data.imageUrls) && data.imageUrls.length > 0
            ? data.imageUrls
            : initialProduct.imageUrls;

        const mapped = {
          title: data.title || initialProduct.title,
          description: data.description || initialProduct.description,
          price: `₹${Number(data.price || 0).toLocaleString("en-IN")}`,
          mainImage: imageUrls[0],
          imageUrls,
          category: data.category || "",
          condition: data.condition || "",
          sellerId: data.user?._id || data.user || data.sellerId,
        };

        setSelectedProduct(mapped);
        setSelectedImage(mapped.mainImage);
        setThumbSources(mapped.imageUrls);
        setIsReserved(false);
      } catch (err) {
        console.error("Error fetching listing by id:", err);
      } finally {
        setLoadingListing(false);
      }
    };

    fetchListing();
  }, [listingId]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoadingRelated(true);
        const res = await fetch(`${API_BASE_URL}/api/listings?limit=7`);
        if (!res.ok) {
          throw new Error("Failed to load related listings");
        }
        const data = await res.json();

        const filtered = listingId
          ? data.filter((item) => item._id !== listingId)
          : data;

        setRelatedListings(filtered.slice(0, 6));
      } catch (err) {
        console.error("Error loading related listings:", err);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [listingId]);

  useEffect(() => {
    const el = document.getElementById("product-top");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedProduct]);

  const handleSearch = () => {
    navigate(listingSearchUrl(isLogged, { search: searchValue }));
  };

  const handleClickListingCard = (listing) => {
    navigate(isLogged ? "/product-login" : "/product", {
      state: { listingId: listing._id },
    });
  };

  const effectiveListingId =
    listingId || (productFromState && productFromState._id) || null;
  const canReserve = Boolean(effectiveListingId);

  const handleReserve = async () => {
    if (!isLogged) {
      navigate("/login");
      return;
    }
    if (!canReserve || isReserved || isReserving) return;

    try {
      setIsReserving(true);

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingId: effectiveListingId }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Failed to reserve item. Please try again.");
        if (data.message && data.message.includes("already reserved")) {
          setIsReserved(true);
        }
        return;
      }

      setIsReserved(true);
      alert("Item reserved successfully! You can see it in My Reserved Items.");
    } catch (err) {
      console.error("Error creating reservation:", err);
      alert("Could not connect to server. Please try again.");
    } finally {
      setIsReserving(false);
    }
  };

  const handleChatWithSeller = async () => {
    if (!isLogged) {
      navigate("/login");
      return;
    }
    const sellerId = selectedProduct.sellerId;

    if (!sellerId) {
      alert("Seller information is missing for this item.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId: sellerId }),
      });

      if (res.status === 401) {
        alert("Please log in to chat.");
        navigate("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        navigate("/chat", { state: { conversationId: data.conversationId } });
      } else {
        const err = await res.json();
        alert(err.message || "Could not start chat.");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-[#fbfbfb] dark:bg-[#0f0f11] text-black dark:text-white min-h-screen flex flex-col transition-colors">
      {/* ---------- RESPONSIVE HEADER ---------- */}
      <Header
        loggedIn={isLogged}
        showBack={true}
        onBack={() => navigate(-1)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
      />

      {/* ---------- MAIN PRODUCT CONTENT ---------- */}
      <main id="product-top" className="flex-1 w-[92%] max-w-[1240px] mx-auto py-6 sm:py-10">
        {/* Showcase: Image + Info side-by-side on desktop, stacked on mobile */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Images Gallery Column */}
          <div className="w-full lg:w-[48%] flex flex-col gap-4">
            {/* Main Image */}
            <div className="w-full h-[300px] sm:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-800 shadow-sm flex items-center justify-center">
              <img
                src={selectedImage}
                alt={selectedProduct.title}
                className="w-full h-full object-cover transition-transform hover:scale-[1.02] duration-300"
              />
            </div>

            {/* Thumbnail Carousel */}
            {thumbSources && thumbSources.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {thumbSources.map((src) => {
                  const active = selectedImage === src;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setSelectedImage(src)}
                      className={`w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer border-2 transition-all ${
                        active
                          ? "border-[#c90202] scale-102"
                          : "border-transparent opacity-75 hover:opacity-100 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <img src={src} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex-1 w-full flex flex-col gap-6">
            <h1 className="font-semibold text-2xl sm:text-3xl lg:text-4xl leading-tight text-black dark:text-white">
              {selectedProduct.title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3">
              {selectedProduct.category && (
                <span className="px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs sm:text-sm font-medium shadow-xs">
                  {selectedProduct.category}
                </span>
              )}
              {selectedProduct.condition && (
                <span className="px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs sm:text-sm font-medium shadow-xs">
                  {selectedProduct.condition}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-3xl sm:text-4xl font-bold text-[#c90202]">
              {selectedProduct.price}
            </div>

            {/* Description Box */}
            <div className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400 mb-2">
                Description
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {loadingListing ? "Loading product details..." : selectedProduct.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                disabled={isLogged && (!canReserve || isReserved || isReserving)}
                onClick={handleReserve}
                className={`w-full py-4 rounded-full font-semibold text-base transition-all duration-200 shadow-button-shadow ${
                  isLogged && (!canReserve || isReserved || isReserving)
                    ? "bg-neutral-400 text-neutral-200 cursor-not-allowed opacity-60"
                    : "bg-black text-white dark:bg-white dark:text-black cursor-pointer hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {!isLogged
                  ? "Reserve Item"
                  : !canReserve
                  ? "Reservation not available"
                  : isReserving
                  ? "Reserving..."
                  : isReserved
                  ? "Reserved"
                  : "Reserve Item"}
              </button>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center px-4">
                Once reserved, the seller will be notified to confirm your meetup location. Payment happens in person — no fees or commissions.
              </p>

              <button
                type="button"
                onClick={handleChatWithSeller}
                className="w-full py-4 rounded-full font-semibold text-base bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                Chat With Seller
              </button>
            </div>
          </div>
        </div>

        {/* ---------- STUDENTS ALSO VIEWED ---------- */}
        <section className="mt-16 sm:mt-24 border-t border-neutral-200 dark:border-neutral-800 pt-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              Students Also Viewed
            </h2>
            <button
              type="button"
              onClick={() => navigate(isLogged ? "/listings-login" : "/listings")}
              className="text-sm font-semibold text-[#c90202] hover:underline"
            >
              View More →
            </button>
          </div>

          {loadingRelated ? (
            <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Loading recommendations...
            </div>
          ) : relatedListings.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No other listings yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleClickListingCard(item)}
                  className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/60 dark:border-neutral-800 shadow-xs hover:shadow-md overflow-hidden flex flex-col transition hover:translate-y-[-2px] cursor-pointer"
                >
                  <div
                    className="relative h-44 bg-cover bg-center bg-neutral-100 dark:bg-neutral-800"
                    style={{
                      backgroundImage: `url(${
                        item.imageUrls && item.imageUrls[0] ? item.imageUrls[0] : ""
                      })`,
                    }}
                  />
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="font-semibold text-base text-black dark:text-white line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="font-bold text-base text-[#c90202]">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {item.category || "General"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <Footer />
    </div>
  );
};

export const ProductDetailWithLogin = (props) => <ProductDetail loggedIn={true} {...props} />;

export default ProductDetail;
