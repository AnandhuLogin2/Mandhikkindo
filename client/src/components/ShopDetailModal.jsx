import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./ShopDetailModal.css";

const DEFAULT_MENU = [
  { name: "Classic Chicken Kuzhi Mandhi", price: 190, category: "Mains", desc: "Tender chicken cooked over wood embers in underground clay pit.", tag: "Popular" },
  { name: "Smoky Alfaham Mandhi", price: 230, category: "Mains", desc: "Charcoal grilled marinated chicken over fragrant Mandhi rice.", tag: "Bestseller" },
  { name: "Traditional Beef Mandhi", price: 250, category: "Mains", desc: "Slow-cooked beef chunks with aromatic spices and caramelized onions.", tag: "Must Try" },
  { name: "Royal Mutton Mandhi", price: 380, category: "Mains", desc: "Succulent mutton cuts cooked in traditional Yemeni pit style.", tag: "Premium" },
  { name: "Unlimited Rice Refill", price: 40, category: "Sides", desc: "Extra long grain basmati infused with stock and dry spices." },
  { name: "Signature Garlic Dip (Toum)", price: 30, category: "Sides", desc: "Creamy homemade garlic dip with lemon accent." },
  { name: "Spicy Tomato Chutney (Sahawiq)", price: 25, category: "Sides", desc: "Fresh tomatoes, coriander, green chillies & lemon juice." },
  { name: "Extra Creamy Mayonnaise", price: 20, category: "Sides", desc: "Rich & silky side dip." },
  { name: "Chilled Mint Lemonade", price: 50, category: "Beverages", desc: "Refreshing lemon juice crushed with fresh mint leaves." },
  { name: "Hot Sulaimani Tea", price: 15, category: "Beverages", desc: "Spiced black tea with cardamom & clove to finish your feast." },
];

export default function ShopDetailModal() {
  const {
    selectedShop, setSelectedShop,
    favorites, toggleFavorite,
    addToCart, openCommunity,
    userReviews, addReview,
    setCartOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState("menu"); // menu | reviews | info
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewDish, setReviewDish] = useState("Chicken Mandhi");

  if (!selectedShop) return null;

  const isFav = favorites.includes(selectedShop.id);
  const shopUserReviews = userReviews.filter((r) => r.shopId === selectedShop.id);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    addReview(selectedShop.id, {
      name: reviewName.trim(),
      rating: reviewRating,
      text: reviewComment.trim(),
      dish: reviewDish,
    });
    setReviewName("");
    setReviewComment("");
  };

  return (
    <div className="shop-detail-modal-overlay" onClick={() => setSelectedShop(null)}>
      <div className="shop-detail-modal glass" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sd-header">
          <div className="sd-header-content">
            <div className="sd-title-row">
              <h2 className="sd-title">{selectedShop.name}</h2>
              <button
                className={`sd-fav-btn ${isFav ? "active" : ""}`}
                title={isFav ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleFavorite(selectedShop.id)}
              >
                {isFav ? "❤️" : "🤍"}
              </button>
            </div>
            <p className="sd-location">📍 {selectedShop.location || selectedShop.address}</p>
            <div className="sd-badges">
              <span className="sd-badge rating">★ {selectedShop.rating.toFixed(1)}</span>
              <span className="sd-badge reviews">💬 {selectedShop.reviews.toLocaleString()} reviews</span>
              <span className="sd-badge district">📍 {selectedShop.district}</span>
            </div>
          </div>
          <button className="icon-btn sd-close" onClick={() => setSelectedShop(null)}>✕</button>
        </div>

        {/* Tabs */}
        <div className="sd-tabs">
          <button
            className={`sd-tab ${activeTab === "menu" ? "active" : ""}`}
            onClick={() => setActiveTab("menu")}
          >
            📋 Menu & Takeaway
          </button>
          <button
            className={`sd-tab ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            ⭐ Reviews ({selectedShop.reviews + shopUserReviews.length})
          </button>
          <button
            className={`sd-tab ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            ℹ️ Pit Info & Vibe
          </button>
        </div>

        {/* Tab Body */}
        <div className="sd-body">
          {activeTab === "menu" && (
            <div className="sd-menu-panel">
              <div className="sd-menu-banner">
                <p>🛒 Pre-Order & Takeaway: Select items below to build your meal</p>
                <button className="btn btn-primary small" onClick={() => setCartOpen(true)}>
                  View Cart 🛒
                </button>
              </div>

              <div className="sd-menu-grid">
                {DEFAULT_MENU.map((item) => (
                  <div key={item.name} className="sd-menu-card glass glass-tight">
                    <div className="sd-menu-card-top">
                      <h4 className="sd-menu-name">{item.name}</h4>
                      {item.tag && <span className="sd-menu-tag">{item.tag}</span>}
                    </div>
                    <p className="sd-menu-desc">{item.desc}</p>
                    <div className="sd-menu-card-bottom">
                      <span className="sd-menu-price">₹{item.price}</span>
                      <button
                        className="btn btn-primary small"
                        onClick={() => addToCart(selectedShop, item)}
                      >
                        + Add to Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="sd-reviews-panel">
              {/* Review Submission Form */}
              <form className="sd-review-form glass glass-tight" onSubmit={handleReviewSubmit}>
                <h3>Rate your experience at {selectedShop.name}</h3>
                <div className="sd-form-row">
                  <div className="star-rating-picker">
                    <label>Rating:</label>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= reviewRating ? "filled" : ""}`}
                          onClick={() => setReviewRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                  />
                  <select value={reviewDish} onChange={(e) => setReviewDish(e.target.value)}>
                    {(selectedShop.types || ["Chicken Mandhi"]).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="How was the meat tenderness, rice aroma, and chutney spicy level?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-primary small">
                  Submit Review ⭐
                </button>
              </form>

              {/* Review List */}
              <div className="sd-reviews-list">
                {shopUserReviews.map((rev) => (
                  <div key={rev.id} className="sd-review-card glass glass-tight user-posted">
                    <div className="sd-rc-head">
                      <span className="sd-rc-author">{rev.name}</span>
                      <span className="sd-rc-stars">{"★".repeat(rev.rating)}</span>
                    </div>
                    <span className="sd-rc-dish">Ordered: {rev.dish}</span>
                    <p className="sd-rc-text">"{rev.text}"</p>
                    <span className="sd-rc-date">{rev.date} · Verified Eater</span>
                  </div>
                ))}

                <div className="sd-review-card glass glass-tight">
                  <div className="sd-rc-head">
                    <span className="sd-rc-author">Suhail K.</span>
                    <span className="sd-rc-stars">★★★★★</span>
                  </div>
                  <span className="sd-rc-dish">Ordered: Chicken Mandhi</span>
                  <p className="sd-rc-text">"Authentic smoke flavour! The rice was non-greasy and the garlic paste had the perfect kick."</p>
                </div>

                <div className="sd-review-card glass glass-tight">
                  <div className="sd-rc-head">
                    <span className="sd-rc-author">Anjali Nair</span>
                    <span className="sd-rc-stars">★★★★☆</span>
                  </div>
                  <span className="sd-rc-dish">Ordered: Alfaham Mandhi</span>
                  <p className="sd-rc-text">"Great place for family dining. Very generous portion sizes and courteous staff."</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "info" && (
            <div className="sd-info-panel">
              <div className="sd-info-grid">
                <div className="sd-info-box glass glass-tight">
                  <h4>⏰ Operating Hours</h4>
                  <p>Open 7 Days: 11:30 AM – 11:00 PM</p>
                  <span className="sd-info-sub">Peak Rush: 1:30 PM – 3:00 PM & 8:00 PM – 10:00 PM</span>
                </div>

                <div className="sd-info-box glass glass-tight">
                  <h4>🔥 Cooking Technique</h4>
                  <p>Slow underground clay pit (Kuzhi) roasting over mahogany wood embers for 5-6 hours.</p>
                </div>

                <div className="sd-info-box glass glass-tight">
                  <h4>🚗 Facilities & Seating</h4>
                  <p>Air-conditioned Family Rooms, Majlis traditional floor seating, Bike & Car Parking available.</p>
                </div>

                <div className="sd-info-box glass glass-tight">
                  <h4>📍 Map Coordinates</h4>
                  <p>{selectedShop.lat}, {selectedShop.lng}</p>
                  <a
                    className="btn btn-outline small"
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedShop.lat},${selectedShop.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps 🧭
                  </a>
                </div>
              </div>

              <div className="sd-action-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedShop(null);
                    openCommunity("create", selectedShop.name);
                  }}
                >
                  🍗 Find a Mandhi Buddy for {selectedShop.name}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
