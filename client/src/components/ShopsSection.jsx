import { useMemo, useState } from "react";
import { useShops, haversineKm } from "../hooks/useShops";
import { useReveal } from "../hooks/useReveal";
import { useApp } from "../context/AppContext";
import ShopCard from "./ShopCard";
import "./ShopsSection.css";

const PAGE_SIZE = 9;

export default function ShopsSection() {
  const { shops, categories } = useShops();
  const { openCommunity, favorites } = useApp();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [userLoc, setUserLoc] = useState(null);

  const filtered = useMemo(() => {
    let list = [...shops];
    if (filter === "favorites") {
      list = list.filter((s) => favorites.includes(s.id));
    } else if (filter === "rating-high") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filter === "reviews-high") {
      list.sort((a, b) => b.reviews - a.reviews);
    } else if (filter === "hidden-gem") {
      list = list.filter((s) => s.reviews < 300 && s.rating >= 4.2);
    } else if (filter !== "all") {
      list = list.filter((s) => (s.types || []).includes(filter));
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q)
      );
    }

    if (userLoc) {
      list = [...list].sort(
        (a, b) => haversineKm(userLoc, a) - haversineKm(userLoc, b)
      );
    } else if (filter === "all") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [shops, filter, query, userLoc, favorites]);

  useReveal([visible, filtered.length]);

  const shown = filtered.slice(0, visible);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  };

  return (
    <section className="section" id="trending">
      <div className="section-head" data-reveal="fade-up">
        <p className="eyebrow">handpicked from 153 surveyed shops</p>
        <h2 className="section-title">Trending Mandhi Shops</h2>
        <p className="section-sub">
          The plates Kerala keeps coming back for — ranked by rating, menu variety, and word of mouth.
        </p>
      </div>

      <div className="shops-toolbar" data-reveal="fade-up">
        <div className="shops-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search shop, city or district…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
          />
        </div>
        <button className="btn btn-ghost small" onClick={locate}>
          📍 {userLoc ? "Near me · active" : "Sort by distance"}
        </button>
      </div>

      <div className="filter-row" data-reveal="fade-up">
        <button
          className={`chip ${filter === "all" ? "active" : ""}`}
          onClick={() => { setFilter("all"); setVisible(PAGE_SIZE); }}
        >
          All
        </button>

        <button
          className={`chip ${filter === "favorites" ? "active" : ""}`}
          onClick={() => { setFilter("favorites"); setVisible(PAGE_SIZE); }}
        >
          Favorites ❤️ ({favorites.length})
        </button>

        {categories.map((c) => (
          <button
            key={c}
            className={`chip ${filter === c ? "active" : ""}`}
            onClick={() => { setFilter(c); setVisible(PAGE_SIZE); }}
          >
            {c}
          </button>
        ))}

        <button
          className={`chip ${filter === "rating-high" ? "active" : ""}`}
          onClick={() => { setFilter("rating-high"); setVisible(PAGE_SIZE); }}
        >
          Top Rated
        </button>
        <button
          className={`chip ${filter === "hidden-gem" ? "active" : ""}`}
          onClick={() => { setFilter("hidden-gem"); setVisible(PAGE_SIZE); }}
        >
          Hidden Gems
        </button>
      </div>

      {shown.length ? (
        <div className="card-grid">
          {shown.map((shop, i) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              delay={(i % PAGE_SIZE) * 40}
              distanceKm={userLoc ? haversineKm(userLoc, shop) : null}
              onFindBuddy={(s) => openCommunity("create", s.name)}
            />
          ))}
        </div>
      ) : filter === "favorites" ? (
        <p className="shops-empty">No saved favorites yet — click the ❤️ icon on any shop to bookmark your top spots!</p>
      ) : (
        <p className="shops-empty">No shops match that search — try another district or dish.</p>
      )}

      {visible < filtered.length && (
        <div className="section-cta" data-reveal="fade-up">
          <button className="btn btn-outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show More Shops ({filtered.length - visible} left)
          </button>
        </div>
      )}
    </section>
  );
}
