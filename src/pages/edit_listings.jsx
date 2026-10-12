// src/pages/edit_listings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header.jsx";
import { Footer } from "../components/Footer.jsx";
import { API_BASE_URL } from "../config/api.js";

import "../styles/Edit_Listings.css";

export const EditListings = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // /edit-listings/:id

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

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const remainingSlots = 5 - imagePreviews.length;
    if (remainingSlots <= 0) {
      alert("You can upload up to 5 images only.");
      return;
    }

    const filesToRead = selected.slice(0, remainingSlots);

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const validFiles = [];
    for (const file of filesToRead) {
      if (!file.type || !file.type.startsWith("image/")) {
        alert(`${file.name} is not a supported image file.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds the 2MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }
    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    const readers = validFiles.map(
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
        e.target.value = "";
      })
      .catch((err) => console.error("Error reading files:", err));
  };

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
        imageUrls: imagePreviews,
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
    <div className="bg-white dark:bg-[#121212] min-h-screen flex flex-col text-gray-900 dark:text-neutral-100 transition-colors">
      <Header loggedIn={true} showBack={true} />

      <main className="flex-1 py-6 sm:py-10">
        <section className="w-[92%] sm:w-[90%] max-w-[1100px] mx-auto">
          {loadingListing ? (
            <div className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-[24px] shadow-[0px_6px_20px_rgba(0,0,0,0.08)] px-6 py-10 text-center text-sm text-gray-600 dark:text-neutral-400">
              Loading your listing…
            </div>
          ) : notFound ? (
            <div className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-[24px] shadow-[0px_6px_20px_rgba(0,0,0,0.08)] px-6 py-10 text-center text-sm text-gray-600 dark:text-neutral-400">
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
            <div className="bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-[24px] shadow-[0px_6px_20px_rgba(0,0,0,0.08)] px-5 py-6 md:px-10 md:py-10">
              <div className="mb-6 sm:mb-8">
                <h1 className="font-bold text-[22px] sm:text-[28px] lg:text-[30px] text-black dark:text-white">
                  Edit Your Listing
                </h1>
                <p className="mt-1 text-[13px] md:text-sm text-[#666666] dark:text-neutral-400">
                  Update the details of your existing listing. Changes will be
                  visible to buyers immediately after saving.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSaveChanges}>
                <div className="space-y-3">
                  <p className="text-sm md:text-[15px] font-medium text-[#0d1b2a] dark:text-neutral-200">
                    Photos (Add up to 5)
                  </p>

                  <label className="block w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800/40 py-6 px-4 text-center cursor-pointer hover:border-[#c90202] transition-colors">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.gif,image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-1 text-xs md:text-[13px]">
                      <div className="font-semibold text-[#0d1b2a] dark:text-white">
                        Drag and drop your images here or click to browse.
                      </div>
                      <div className="text-[#777777] dark:text-neutral-400">
                        Add a great photo to sell your item faster!
                      </div>
                    </div>
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {imagePreviews.slice(0, 5).map((src, i) => (
                        <div
                          key={i}
                          className="relative w-24 h-24 bg-[#f2f2f2] dark:bg-neutral-800 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700"
                        >
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 flex items-center justify-center text-xs leading-none hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 shadow"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a] dark:text-neutral-200">
                    Item Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full h-11 rounded-2xl border border-gray-300 dark:border-neutral-700 px-4 text-sm md:text-[15px] outline-none bg-white dark:bg-neutral-800 text-black dark:text-white focus:border-[#c90202] dark:focus:border-[#c90202] transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a] dark:text-neutral-200">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full min-h-[140px] rounded-2xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm md:text-[15px] outline-none resize-none text-black dark:text-white focus:border-[#c90202] dark:focus:border-[#c90202] transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a] dark:text-neutral-200">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setSaved(false);
                        }}
                        className="w-full h-11 rounded-2xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 pr-10 text-sm md:text-[15px] outline-none appearance-none text-black dark:text-white focus:border-[#c90202] dark:focus:border-[#c90202] transition"
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
                    <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a] dark:text-neutral-200">
                      Condition
                    </label>
                    <div className="relative">
                      <select
                        value={condition}
                        onChange={(e) => {
                          setCondition(e.target.value);
                          setSaved(false);
                        }}
                        className="w-full h-11 rounded-2xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 pr-10 text-sm md:text-[15px] outline-none appearance-none text-black dark:text-white focus:border-[#c90202] dark:focus:border-[#c90202] transition"
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
                  <label className="text-[11px] md:text-xs font-medium text-[#0d1b2a] dark:text-neutral-200">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] dark:text-neutral-400 text-sm">
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
                      className="w-full h-11 rounded-2xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-8 pr-4 text-sm md:text-[15px] outline-none text-black dark:text-white focus:border-[#c90202] dark:focus:border-[#c90202] transition"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#0000000f] dark:border-neutral-800 flex items-center justify-between flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-[999px] border border-[#e11d48] text-[#e11d48] dark:text-red-400 dark:border-red-500 text-sm hover:bg-[#fef2f2] dark:hover:bg-red-950/40 transition-colors"
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
                      className="px-6 py-3 rounded-[999px] text-sm border border-[#0000001a] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-800 dark:text-neutral-200 hover:bg-[#f5f5f5] dark:hover:bg-neutral-700 transition-colors"
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

      <Footer />
    </div>
  );
};

export default EditListings;
