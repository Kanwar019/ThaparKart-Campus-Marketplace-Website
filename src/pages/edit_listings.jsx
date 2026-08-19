// src/pages/edit_listings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import divider from "../assets/divider.svg";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";
import BackButton from "../assets/icons/BackButton.svg";
import facebookIcon from "../assets/icons/facebook.svg";
import instagramIcon from "../assets/icons/instagram.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

import "../styles/Edit_Listings.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const HealthiconsMagnifyingGlassOutline = ({ className = "" }) => (
  <img src={MagnifyingGlassIcon} className={className} alt="search" />
);

export const EditListings = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // /edit-listings/:id

  const [searchValue, setSearchValue] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [imagePreviews, setImagePreviews] = useState([]); // what we show
  const [saved, setSaved] = useState(false);
  const [loadingListing, setLoadingListing] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoadingListing(true);
        const res = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
          credentials: "include",
        });

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load listing");
        }

        const data = await res.json();

        setTitle(data.title || "");
        setCategory(data.category || "");
        setCondition(data.condition || "");
        setPrice(
          data.price !== undefined && data.price !== null
            ? String(data.price)
            : ""
        );
        setDescription(data.description || "");
        if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
          setImagePreviews(data.imageUrls);
        } else {
          setImagePreviews([]);
        }
        setSaved(false);
      } catch (err) {
        console.error("Error loading listing:", err);
      } finally {
        setLoadingListing(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleSearch = () => {
    console.log("Searching for:", searchValue);
  };

  const handleFileChange = (e) => {
  const selected = Array.from(e.target.files || []);
  if (!selected.length) return;

  const remainingSlots = 5 - imagePreviews.length;
  if (remainingSlots <= 0) {
    alert("You can upload up to 5 images only.");
    return;
  }

  const filesToRead = selected.slice(0, remainingSlots);

  const readers = filesToRead.map(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
  );

  Promise.all(readers)
    .then((results) => {
      setImagePreviews((prev) => [...prev, ...results]);
      setSaved(false);
      // optional: clear input so same files can be selected again if needed
      e.target.value = "";
    })
    .catch((err) => console.error("Error reading files:", err));
};


  // NEW: remove single image from previews
  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        price: price ? Number(price) : 0,
        category,
        condition,
        imageUrls: imagePreviews, // these will become the listing images
      };

      const res = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(
          errData.message || "Failed to save changes. Please try again later."
        );
        return;
      }

      setSaved(true);
    } catch (err) {
      console.error("Error saving listing:", err);
      alert("Could not connect to server. Please try again.");
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone."
    );
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(
          errData.message || "Failed to delete listing. Please try again later."
        );
        return;
      }

      navigate("/my-listing");
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Could not connect to server. Please try again.");
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen flex flex-col">
      <header className="w-full h-[164px] bg-white flex items-center shadow-sm">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img src={BackButton} alt="Back" className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/landing-login")}
              className="flex items-baseline gap-0 cursor-pointer"
            >
              <span className="text-[#c90202] font-subheading">Thapar</span>
              <span className="text-black font-subheading">Kart</span>
            </button>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <button
              type="button"
              onClick={() => navigate("/landing-login")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
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
                className="flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <HealthiconsMagnifyingGlassOutline className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/my-account/orders")}
              className="font-body-text text-black cursor-pointer hover:text-[#c90202] transition-colors"
            >
              Account
            </button>

            <button
              type="button"
              onClick={() => navigate("/about-login")}
              className="px-6 py-3.5 bg-black rounded-[999px] shadow-button-shadow cursor-pointer flex items-center justify-center hover:bg-[#1a1a1a] hover:scale-[1.02] active:scale-[0.98] transition-transform transition-colors"
            >
              <span className="font-small-text text-white">Contact Us</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <section className="w-[95%] max-w-[1100px] mx-auto">
          {loadingListing ? (
            <div className="bg-white rounded-[24px] shadow-[0px_6px_20px_rgba(0,0,0,0.08)] px-6 py-10 text-center text-sm text-gray-600">
              Loading your listing…
            </div>
          ) : notFound ? (
            <div className="bg-white rounded-[24px] shadow-[0px_6px_20px_rgba(0,0,0,0.08)] px-6 py-10 text-center text-sm text-gray-600">
              Listing not found. Please go back to{" "}
              <button
                type="button"
                onClick={() => navigate("/my-listing")}
                className="text-[#c90202] underline"
              >
                My Listings
              </button>
              .
            </div>
          ) : (
            <div className="bg-white rounded-[24px] shadow-[0px_6px_20px_rgba(0,0,0,0.08)] px-5 py-6 md:px-10 md:py-10">
              <div className="mb-8">
                <h1 className="font-bold text-[24px] md:text-[28px] lg:text-[30px] text-black">
                  Edit Your Listing
                </h1>
                <p className="mt-1 text-[13px] md:text-sm text-[#666666]">
                  Update the details of your existing listing. Changes will be
                  visible to buyers immediately after saving.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSaveChanges}>
                <div className="space-y-3">
                  <p className="text-sm md:text-[15px] font-medium text-[#0d1b2a]">
                    Photos (Add up to 5)
                  </p>

                  <label className="block w-full rounded-2xl border-2 border-dashed border-gray-300 bg-white py-6 px-4 text-center cursor-pointer hover:border-[#c90202] transition-colors">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.gif,image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-1 text-xs md:text-[13px]">
                      <div className="font-semibold text-[#0d1b2a]">
                        Drag and drop your images here or click to browse.
                      </div>
                      <div className="text-[#777777]">
                        Add a great photo to sell your item faster!
                      </div>
                    </div>
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {imagePreviews.slice(0, 5).map((src, i) => (
                        <div
                          key={i}
                          className="relative w-24 h-24 bg-[#f2f2f2] rounded-xl overflow-hidden"
                        >
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] leading-none hover:bg-red-50"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a]">
                    Item Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full h-11 rounded-2xl border border-gray-300 px-4 text-sm md:text-[15px] outline-none bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a]">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full min-h-[140px] rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm md:text-[15px] outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a]">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setSaved(false);
                        }}
                        className="w-full h-11 rounded-2xl border border-gray-300 bg-white px-4 pr-10 text-sm md:text-[15px] outline-none appearance-none"
                      >
                        <option value="">Select a category</option>
                        <option value="Transport">Transport</option>
                        <option value="Books & Notes">Books &amp; Notes</option>
                        <option value="Electronics & Gadgets">
                          Electronics &amp; Gadgets
                        </option>
                        <option value="Cycles">Cycles</option>
                        <option value="Hostel Essentials">
                          Hostel Essentials
                        </option>
                        <option value="Clothes & Accessories">
                          Clothes &amp; Accessories
                        </option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-xs">
                        ▾
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a]">
                      Condition
                    </label>
                    <div className="relative">
                      <select
                        value={condition}
                        onChange={(e) => {
                          setCondition(e.target.value);
                          setSaved(false);
                        }}
                        className="w-full h-11 rounded-2xl border border-gray-300 bg-white px-4 pr-10 text-sm md:text-[15px] outline-none appearance-none"
                      >
                        <option value="">Select condition</option>
                        <option value="New">New</option>
                        <option value="Like New">Like New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Needs Repair">Needs Repair</option>
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-xs">
                        ▾
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a]">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        setSaved(false);
                      }}
                      className="w-full h-11 rounded-2xl border border-gray-300 bg-white pl-8 pr-4 text-sm md:text-[15px] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#0000000f] flex items-center justify-between flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-[999px] border border-[#e11d48] text-[#e11d48] text-sm hover:bg-[#fef2f2] transition-colors"
                  >
                    Delete Listing
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className={`px-6 py-3 rounded-[999px] text-sm font-medium shadow-button-shadow transition-transform transition-colors ${
                        saved
                          ? "bg-[#0f9d58] text-white cursor-default"
                          : "bg-[#c90202] text-white hover:bg-[#a10101] hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      {saved ? "Saved" : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 rounded-[999px] text-sm border border-[#0000001a] bg-white hover:bg-[#f5f5f5] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white py-10 relative mt-6">
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

export default EditListings;
