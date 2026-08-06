import { useApp } from "../context/AppContext";
import "./ShopCard.css";

const CATEGORY_ICONS = {
  "Chicken Mandhi": "🍗",
  "Alfaham Mandhi": "🔥",
  "Beef Mandhi": "🥩",
  "Mutton Mandhi": "🍖",
  "Fish Mandhi": "🐟",
};

export default function ShopCard({ shop, onFindBuddy, distanceKm, reveal = true, delay = 0 }) {
  const { openShopDetail, favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(shop.id);

  return (
    <article
      className="shop-card glass glass-tight"
      data-reveal={reveal ? "fade-up" : undefined}
      data-reveal-delay={delay}
      onClick={() => openShopDetail(shop)}
    >
      <div className="shop-card-top">
        <span className="shop-icon">{CATEGORY_ICONS[shop.types?.[0]] || "🍛"}</span>
        <div className="shop-card-top-right">
          <button
            className={`shop-card-fav ${isFav ? "active" : ""}`}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(shop.id);
            }}
          >
            {isFav ? "❤️" : "🤍"}
          </button>
          <span className="shop-rating">★ {shop.rating.toFixed(1)}</span>
        </div>
      </div>

      <h3 className="shop-name">{shop.name}</h3>
      <p className="shop-location">{shop.location}</p>

      <div className="shop-tags">
        {(shop.types || []).slice(0, 3).map((t) => (
          <span key={t} className="shop-tag">{t}</span>
        ))}
      </div>

      <div className="shop-meta-row">
        <span className="shop-reviews">{shop.reviews.toLocaleString()} reviews</span>
        {distanceKm != null && <span className="shop-distance">{distanceKm.toFixed(1)} km</span>}
      </div>

      <div className="shop-card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn btn-primary small" onClick={() => openShopDetail(shop)}>
          Menu & Order 📋
        </button>
        <button className="btn btn-ghost small" onClick={() => onFindBuddy?.(shop)}>
          Find a Buddy 🍗
        </button>
      </div>
    </article>
  );
}
