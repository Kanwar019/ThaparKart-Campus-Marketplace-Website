import { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import MagnifyingGlassIcon from "../assets/icons/MagnifyingGlass.svg";

export default function ListingSearchBox({ value, onChange, onSearch, loggedIn,
  className = "", inputClassName = "", iconClassName = "dark:invert", placeholder = "Search",
  autoFocus = false, onSelected }) {
  const navigate = useNavigate();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState({ query: "", items: [], status: "loading" });
  const query = value.trim();
  const visible = open && query.length >= 2;
  const current = result.query === query;
  const items = current ? result.items : [];
  const status = current ? result.status : "loading";

  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const { API_BASE_URL } = await import("../config/api.js");
        const response = await fetch(`${API_BASE_URL}/api/listings/suggestions?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Suggestions unavailable");
        const data = await response.json();
        if (!controller.signal.aborted) setResult({ query, items: Array.isArray(data) ? data.slice(0, 5) : [], status: "ready" });
      } catch {
        if (!controller.signal.aborted) setResult({ query, items: [], status: "error" });
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, visible]);

  const search = () => { setOpen(false); setActive(-1); onSearch(); };
  const choose = (item) => {
    setOpen(false); setActive(-1); onSelected?.();
    navigate(loggedIn ? "/product-login" : "/product", { state: { listingId: item._id } });
  };
  const keyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") { setOpen(false); setActive(-1); }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault(); setOpen(true);
      if (items.length) setActive(index => event.key === "ArrowDown"
        ? (index + 1) % items.length : (index <= 0 ? items.length - 1 : index - 1));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (visible && items[active]) choose(items[active]); else search();
    }
  };

  return <div className={`relative ${className}`} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); }
  }}>
    <input type="text" role="combobox" aria-label="Search listings" aria-autocomplete="list"
      aria-expanded={visible} aria-controls={visible ? listId : undefined}
      aria-activedescendant={visible && items[active] ? `${listId}-${active}` : undefined}
      autoComplete="off" maxLength={100} value={value} placeholder={placeholder} autoFocus={autoFocus}
      onFocus={() => setOpen(true)} onChange={event => { onChange(event.target.value); setActive(-1); setOpen(true); }}
      onKeyDown={keyDown} className={`flex-1 min-w-0 bg-transparent outline-none text-sm ${inputClassName}`} />
    <button type="button" onClick={search} aria-label="Search" className="shrink-0 p-0.5 hover:opacity-70 transition-opacity">
      <img src={MagnifyingGlassIcon} alt="" className={`w-5 h-5 ${iconClassName}`} />
    </button>
    {visible && <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#18181b] text-black dark:text-white shadow-xl">
      <p className="px-4 pt-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">Available items</p>
      <ul id={listId} role="listbox" aria-label="Suggested listings" className="m-0 list-none p-0">
        {items.map((item, index) => <li key={item._id} id={`${listId}-${index}`} role="option" aria-selected={active === index}
          onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(item)}
          className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${active === index ? "bg-red-50 dark:bg-red-950/30" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
          <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-[#c90202]">↗</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.title}</span>
            <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{item.category || "Miscellaneous"}</span></span>
          {typeof item.price === "number" && <span className="shrink-0 text-xs font-semibold">₹{item.price.toLocaleString("en-IN")}</span>}
        </li>)}
      </ul>
      {!items.length && <p role="status" className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
        {status === "loading" ? "Finding items..." : status === "error" ? "Suggestions unavailable. You can still search." : "No matching items yet."}
      </p>}
      <button type="button" onClick={search} className="w-full border-t border-neutral-100 dark:border-neutral-700 px-4 py-3 text-left text-xs font-medium text-[#c90202] hover:bg-neutral-50 dark:hover:bg-neutral-800">View all results</button>
    </div>}
  </div>;
}
