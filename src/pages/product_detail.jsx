// src/pages/product_detail.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";
import divider from "../assets/divider.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

import "../styles/Product_Detail_Page.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialProduct = {
  title: "Casio Scientific Calculator FX-991ES",
  description: "Fully functional, no scratches.",
  price: "₹500",
  mainImage: "/image.png",
  category: "",
  condition: "",
  imageUrls: ["/image.png", "/image-2.png", "/image-3.png", "/image-4.png"],
};

export const ProductDetail = () => {
  const [searchValue, setSearchValue] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

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
        };

        setSelectedProduct(mapped);
        setSelectedImage(mapped.mainImage);
        setThumbSources(mapped.imageUrls);
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
        const res = await fetch(`${API_BASE_URL}/api/listings`);
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
    console.log("Searching for:", searchValue);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedImage(product.mainImage || "/image.png");

    const el = document.getElementById("product-top");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleClickListingCard = (listing) => {
    navigate("/product", {
      state: { listingId: listing._id },
    });
  };

  const makeThumb = (src) => {
    const active = selectedImage === src;
    return (
      <button
        key={src}
        type="button"
        onClick={() => setSelectedImage(src)}
        className={`w-1/4 h-full rounded-lg overflow-hidden bg-[#f7f7f7] cursor-pointer transition-transform border ${
          active ? "border-black" : "border-transparent"
        } hover:scale-[1.03] active:scale-[0.98]`}
      >
        <img src={src} alt="Thumb" className="w-full h-full object-cover" />
      </button>
    );
  };

  const col1 = relatedListings.slice(0, 2);
  const col2 = relatedListings.slice(2, 4);
  const col3 = relatedListings.slice(4, 6);

  return (
    <div className="bg-white w-full min-w-[1440px] min-h-[2115px] relative flex flex-col">
      <div className="fixed top-6 left-6 z-30">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer transition-transform hover:scale-[1.10] active:scale-[0.98]"
        >
          <img src={BackButton} alt="Back" className="w-6 h-6" />
        </button>
      </div>

      <header className="w-full h-[164px] bg-white flex items-center">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/landing")}
            className="flex items-baseline gap-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </button>

          <div className="flex items-center gap-4 lg:gap-8">
            <button
              type="button"
              onClick={() => navigate("/landing")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Home
            </button>

            <div className="hidden sm:flex w-[260px] md:w-[320px] lg:w-[360px] items-center justify-between px-4 py-2 rounded-[999px] border border-[#0000001a] bg-white focus-within:border-black transition">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent outline-none font-body-text text-[#000000] placeholder:text-[#00000080]"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="flex items-center justify-center cursor-pointer hover:scale-[1.05] active:scale-[0.95] transition-transform"
              >
                <img src={MagnifyingGlassIcon} alt="search" className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/about")}
              className="px-6 py-3.5 bg-black rounded-[999px] shadow-button-shadow cursor-pointer flex items-center justify-center hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
            >
              <span className="font-small-text text-white">Contact Us</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div id="product-top">
          <div className="absolute w-[40.56%] top-[50px] left-[9.10%] h-[438px] rounded-xl shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] overflow-hidden bg-[#f7f7f7]">
            <img
              src={selectedImage}
              alt="Product main"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col w-[35.90%] items-start gap-[26px] absolute top-[50px] left-[58.68%]">
            <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-black text-[40px] tracking-[0] leading-[48.0px]">
              {selectedProduct.title}
            </div>

            <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
              {/* Category pill - auto width */}
              <div className="flex items-center justify-center gap-2.5 px-[27px] py-[7px] relative rounded-[20px] border border-solid border-[#0000001f] hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-default whitespace-nowrap">
                <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-subheading text-[#828282] whitespace-nowrap">
                  {selectedProduct.category || "Category"}
                </div>
              </div>

              {/* Condition pill - auto width */}
              <div className="flex items-center justify-center gap-2.5 px-[27px] py-[7px] relative rounded-[20px] border border-solid border-[#0000001f] hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-default whitespace-nowrap">
                <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-subheading text-[#828282] whitespace-nowrap">
                  {selectedProduct.condition || "Condition"}
                </div>
              </div>
            </div>

            <div className="relative self-stretch [font-family:'Inter-Medium',Helvetica] font-medium text-black text-2xl tracking-[0] leading-9">
              Price: {selectedProduct.price}
            </div>

            <div className="flex items-center justify-center gap-2.5 px-[40px] py-[24px] relative self-stretch w-full flex-[0_0_auto] ml-[-1.00px] mr-[-1.00px] rounded-[20px] border border-solid border-[#0000001f]">
              <div className="relative flex items-center justify-center w-fit [font-family:'Inter-Regular',Helvetica] font-normal text-[#828282] text-lg tracking-[0] leading-[26px] text-center">
                {loadingListing
                  ? "Loading product details..."
                  : selectedProduct.description}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="all-[unset] box-border flex h-[52px] items-center justify-center gap-2 px-6 py-3.5 relative self-stretch w-full bg-black rounded-[20px] shadow-button-shadow transition-all duration-[0.2s] ease-[ease] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-small-text text-white">
                Reserve Item
              </div>
            </button>

            <p className="relative flex items-center justify-center self-stretch font-small-text text-[#828282] text-center">
              Once reserved, the seller will be notified to confirm your meetup
              location. Payment happens in person — no fees or commissions.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="all-[unset] box-border flex h-[52px] items-center justify-center gap-2 px-6 py-3.5 relative self-stretch w-full bg-black rounded-[20px] shadow-button-shadow transition-all duration-[0.2s] ease-[ease] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-small-text text-white">
                Chat With Seller
              </div>
            </button>
          </div>
        </div>

        <div className="absolute w-[40.56%] top-[504px] left-[9.10%] h-[134px] flex gap-4">
          {thumbSources.map(makeThumb)}
        </div>

        <div className="absolute w-[43.40%] top-[743px] left-[5.56%] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-black text-[32px] tracking-[0] leading-[48px]">
          Students Also Viewed
        </div>

        <div className="flex flex-col w-[89.03%] items-end gap-3.5 absolute top-[823px] left-[5.56%]">
          <div className="relative self-stretch w-full h-[764px]">
            {loadingRelated && (
              <div className="absolute inset-0 flex items-center justify-center text-[#828282] font-body-text">
                Loading recommendations...
              </div>
            )}

            {!loadingRelated && relatedListings.length > 0 && (
              <>
                <div className="flex flex-col w-[31.51%] items-start gap-8 absolute top-0 left-[68.49%]">
                  {col3.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto]"
                    >
                      <button
                        type="button"
                        onClick={() => handleClickListingCard(item)}
                        className="relative self-stretch w-full h-[238px] rounded-lg bg-[linear-gradient(0deg,rgba(247,247,247,1)_0%,rgba(247,247,247,1)_100%)] cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0px_4px_10px_rgba(0,0,0,0.08)] overflow-hidden"
                      >
                        {Array.isArray(item.imageUrls) &&
                          item.imageUrls[0] && (
                            <img
                              src={item.imageUrls[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClickListingCard(item)}
                        className="text-left flex flex-col items-start gap-1 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <div className="[font-family:'Inter-Medium',Helvetica] font-medium text-black text-2xl leading-9">
                          {item.title}
                        </div>
                        <p className="font-body-text text-[#828282] line-clamp-2">
                          {item.description}
                        </p>
                        <div className="font-body-text text-black">
                          ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col w-[31.51%] items-start gap-8 absolute top-0 left-[34.24%]">
                  {col2.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto]"
                    >
                      <button
                        type="button"
                        onClick={() => handleClickListingCard(item)}
                        className="relative self-stretch w-full h-[238px] rounded-lg bg-[linear-gradient(0deg,rgba(247,247,247,1)_0%,rgba(247,247,247,1)_100%)] cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0px_4px_10px_rgba(0,0,0,0.08)] overflow-hidden"
                      >
                        {Array.isArray(item.imageUrls) &&
                          item.imageUrls[0] && (
                            <img
                              src={item.imageUrls[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClickListingCard(item)}
                        className="text-left flex flex-col items-start gap-1 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <div className="[font-family:'Inter-Medium',Helvetica] font-medium text-black text-2xl leading-9">
                          {item.title}
                        </div>
                        <p className="font-body-text text-[#828282] line-clamp-2">
                          {item.description}
                        </p>
                        <div className="font-body-text text-black">
                          ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col w-[31.51%] items-start gap-8 absolute top-0 left-0">
                  {col1.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto]"
                    >
                      <button
                        type="button"
                        onClick={() => handleClickListingCard(item)}
                        className="relative self-stretch w-full h-[238px] rounded-lg bg-[linear-gradient(0deg,rgba(247,247,247,1)_0%,rgba(247,247,247,1)_100%)] cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0px_4px_10px_rgba(0,0,0,0.08)] overflow-hidden"
                      >
                        {Array.isArray(item.imageUrls) &&
                          item.imageUrls[0] && (
                            <img
                              src={item.imageUrls[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClickListingCard(item)}
                        className="text-left flex flex-col items-start gap-1 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <div className="[font-family:'Inter-Medium',Helvetica] font-medium text-black text-2xl leading-9">
                          {item.title}
                        </div>
                        <p className="font-body-text text-[#828282] line-clamp-2">
                          {item.description}
                        </p>
                        <div className="font-body-text text-black">
                          ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!loadingRelated && relatedListings.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[#828282] font-body-text">
                No other listings yet.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/listings")}
            className="all-[unset] box-border gap-2.5 px-6 py-[18px] absolute top-[778px] right-0 inline-flex items-center justify-center bg-black rounded-[20px] shadow-button-shadow cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <div className="relative flex items-center justify-center w-fit mt-[-1.00px] font-small-text text-white">
              View More
            </div>
          </button>
        </div>
      </main>

      <footer className="bg-white py-10 relative">
        <img
          className="w-[calc(100%_-_160px)] max-w-[1200px] mx-auto top-0 left-0 right-0 h-px object-cover absolute inset-x-0"
          alt="Divider"
          src={divider}
        />

        <div className="w-[90%] mx-auto flex items-center justify-between pt-4">
          <p className="h-9 flex items-center justify-center font-subheading text-[length:var(--subheading-font-size)]">
            <span className="text-[#c90202] font-subheading">Thapar</span>
            <span className="text-black font-subheading">Kart</span>
          </p>

          <div className="flex items-center gap-3">
            <img
              src={facebookIcon}
              alt="facebook"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={instagramIcon}
              alt="instagram"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={linkedinIcon}
              alt="linkedin"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
            <img
              src={youtubeIcon}
              alt="youtube"
              className="w-6 h-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
