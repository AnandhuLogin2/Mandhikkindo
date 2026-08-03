import { useEffect, useMemo, useState } from "react";
import { useShops, haversineKm } from "../hooks/useShops";
import { useCommunity } from "../hooks/useCommunity";
import { useApp } from "../context/AppContext";
import "./SearchModal.css";

const GALLERY_ITEMS = [
  { id: "g1", title: "Traditional Underground Clay Pit (Kuzhi)", category: "Pit Cooking" },
  { id: "g2", title: "Smoky Alfaham Roast Mandhi", category: "Alfaham" },
  { id: "g3", title: "Slow-Cooked Tender Beef Mandhi", category: "Beef" },
  { id: "g4", title: "Saffron Spiced Basmati & Hot Sahawiq Chutney", category: "Sides" },
  { id: "g5", title: "Royal Mutton Mandhi Platter", category: "Mutton" },
];

const REVIEWS_ITEMS = [
  { id: "r1", name: "Anoop", shop: "Mandi Manzil", text: "The rice alone is worth the drive. Meat fell right off the bone." },
  { id: "r2", name: "Fathima", shop: "Zauq Mandi", text: "Portion sizes are unreal — came for lunch, left with dinner too." },
  { id: "r3", name: "Rahul", shop: "Spicy Pit", text: "Best mandhi I've had outside of a Gulf trip, honestly." },
  { id: "r4", name: "Meera", shop: "Nahdi Kuzhimandhi", text: "Service was quick even on a packed Sunday afternoon." },
];

export default function SearchModal() {
  const { searchOpen, setSearchOpen, openShopDetail, openCommunity } = useApp();
  const { shops } = useShops();
  const { groups } = useCommunity(shops);
  const [query, setQuery] = useState("");
  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    if (!searchOpen) setQuery("");
    const onKey = (e) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { shops: [], community: [], reviews: [], gallery: [] };
    const q = query.trim().toLowerCase();

    // 1. Search Shops
    let shopList = shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        (s.types || []).some((t) => t.toLowerCase().includes(q))
    );
    if (userLoc) shopList = [...shopList].sort((a, b) => haversineKm(userLoc, a) - haversineKm(userLoc, b));

    // 2. Search Community Meetups
    const communityList = groups.filter(
      (g) =>
        g.restaurant.toLowerCase().includes(q) ||
        g.district.toLowerCase().includes(q) ||
        (g.message && g.message.toLowerCase().includes(q))
    );

    // 3. Search Reviews
    const reviewList = REVIEWS_ITEMS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.shop.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q)
    );

    // 4. Search Gallery
    const galleryList = GALLERY_ITEMS.filter(
      (g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );

    return {
      shops: shopList.slice(0, 5),
      community: communityList.slice(0, 3),
      reviews: reviewList.slice(0, 3),
      gallery: galleryList.slice(0, 3),
    };
  }, [query, shops, groups, userLoc]);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  };

  const totalHits =
    searchResults.shops.length +
    searchResults.community.length +
    searchResults.reviews.length +
    searchResults.gallery.length;

  if (!searchOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={() => setSearchOpen(false)}>
      <div className="search-modal-box glass" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="sm-input-row">
          <span className="sm-icon">🔍</span>
          <input
            type="text"
            autoFocus
            placeholder="Search across Community, Reviews, Gallery, Mandhi Shops & Quiz..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="icon-btn sm-locate-btn" title="Use my location" onClick={locate}>📍</button>
          <button className="icon-btn sm-close-btn" aria-label="Close search" onClick={() => setSearchOpen(false)}>✕</button>
        </div>

        {/* Results Container */}
        <div className="sm-results-body">
          {!query.trim() && (
            <div className="sm-quick-hints">
              <p className="sm-hint-title">Suggested Searches:</p>
              <div className="sm-hint-chips">
                <button onClick={() => setQuery("Alfaham")}>🔥 Alfaham Mandhi</button>
                <button onClick={() => setQuery("Kozhikode")}>📍 Kozhikode</button>
                <button onClick={() => setQuery("Beef")}>🥩 Beef Mandhi</button>
                <button onClick={() => setQuery("Community")}>👥 Active Meetups</button>
              </div>
            </div>
          )}

          {query.trim() && totalHits === 0 && (
            <p className="sm-empty">No results found for "{query}". Try searching "Chicken", "Calicut", or "Community".</p>
          )}

          {/* 1. Mandhi Shops */}
          {searchResults.shops.length > 0 && (
            <div className="sm-section">
              <h4 className="sm-section-label">🍗 Mandhi Shops ({searchResults.shops.length})</h4>
              <div className="sm-items-grid">
                {searchResults.shops.map((s) => (
                  <div
                    key={s.id}
                    className="sm-item-card glass glass-tight"
                    onClick={() => {
                      setSearchOpen(false);
                      openShopDetail(s);
                    }}
                  >
                    <div>
                      <strong className="sm-title">{s.name}</strong>
                      <span className="sm-sub">📍 {s.location}</span>
                    </div>
                    <span className="sm-rating">★ {s.rating.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Community Meetups */}
          {searchResults.community.length > 0 && (
            <div className="sm-section">
              <h4 className="sm-section-label">👥 Community Meetups ({searchResults.community.length})</h4>
              <div className="sm-items-grid">
                {searchResults.community.map((g) => (
                  <div
                    key={g.id}
                    className="sm-item-card glass glass-tight"
                    onClick={() => {
                      setSearchOpen(false);
                      openCommunity("browse");
                    }}
                  >
                    <div>
                      <strong className="sm-title">{g.restaurant}</strong>
                      <span className="sm-sub">{g.district} · Host: {g.host}</span>
                    </div>
                    <span className="sm-badge">{g.members}/{g.max} Joined</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Reviews */}
          {searchResults.reviews.length > 0 && (
            <div className="sm-section">
              <h4 className="sm-section-label">⭐ Customer Reviews ({searchResults.reviews.length})</h4>
              <div className="sm-items-grid">
                {searchResults.reviews.map((r) => (
                  <div key={r.id} className="sm-item-card glass glass-tight">
                    <div>
                      <strong className="sm-title">{r.name} on {r.shop}</strong>
                      <p className="sm-quote">"{r.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Gallery */}
          {searchResults.gallery.length > 0 && (
            <div className="sm-section">
              <h4 className="sm-section-label">🖼️ Gallery Highlights ({searchResults.gallery.length})</h4>
              <div className="sm-items-grid">
                {searchResults.gallery.map((g) => (
                  <a key={g.id} href="#gallery" className="sm-item-card glass glass-tight" onClick={() => setSearchOpen(false)}>
                    <div>
                      <strong className="sm-title">{g.title}</strong>
                      <span className="sm-sub">{g.category}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
