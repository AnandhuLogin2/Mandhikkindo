import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShops } from "../hooks/useShops";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { subscribeReviews, addReview } from "../services/reviewService";
import "./ReviewsSection.css";

export default function ReviewsSection() {
  const { shops } = useShops();
  const { user } = useAuth();
  const { showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Form state
  const [selectedShopId, setSelectedShopId] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firestoreReviews, setFirestoreReviews] = useState([]);

  useEffect(() => {
    const unsub = subscribeReviews((items) => {
      if (items && items.length > 0) {
        setFirestoreReviews(items);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (shops.length && !selectedShopId) {
      setSelectedShopId(shops[0].id);
    }
  }, [shops, selectedShopId]);

  const allReviews = useMemo(() => {
    if (firestoreReviews.length > 0) {
      return firestoreReviews.map((r) => ({
        initial: (r.userName || r.userEmail || "C").charAt(0).toUpperCase(),
        name: r.userName || r.userEmail || "Customer",
        text: r.comment || r.text || "Great Mandhi experience!",
        shop: r.shopName || "Mandhi Spot",
        rating: Math.max(1, Math.min(5, Math.round(r.rating || 5))),
      }));
    }
    return [];
  }, [firestoreReviews]);

  const [idx, setIdx] = useState(0);
  const total = allReviews.length;
  const hovering = useRef(false);

  const goTo = (i) => setIdx(((i % total) + total) % total);

  useEffect(() => {
    if (!total) return;
    const int = setInterval(() => {
      if (!hovering.current) setIdx((i) => (i + 1) % total);
    }, 6000);
    return () => clearInterval(int);
  }, [total]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", {
        state: { from: location, reason: "Sign in to share your Mandhi review" },
      });
      return;
    }

    if (!text.trim() || !selectedShopId) {
      showToast("Please write a review and select a shop.");
      return;
    }

    try {
      setIsSubmitting(true);
      const targetShop = shops.find((s) => s.id === selectedShopId);

      await addReview({
        shopId: selectedShopId,
        shopName: targetShop ? targetShop.name || targetShop.shopName : "Mandhi Spot",
        userName: user.displayName || user.email || "Customer",
        userEmail: user.email || "",
        rating: Number(rating),
        comment: text.trim(),
      });

      setText("");
      showToast("Review submitted successfully to Firestore! Thank you 🙌");
    } catch (err) {
      console.error("Submit review failed:", err);
      showToast(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section" id="reviews">
      <div className="section-head" data-reveal="fade-up">
        <p className="eyebrow">from people who finished the whole plate</p>
        <h2 className="section-title">Customer Reviews</h2>
      </div>

      {/* Review Carousel */}
      <div
        className="review-carousel"
        data-reveal="fade-up"
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
      >
        <button className="carousel-btn prev" aria-label="Previous review" onClick={() => goTo(idx - 1)}>
          ‹
        </button>
        <div className="review-track-wrap">
          <div className="review-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
            {allReviews.map((r, i) => (
              <div className="review-card glass glass-tight" key={i}>
                <div className="review-avatar">{r.initial}</div>
                <div className="review-stars">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-meta">
                  <span className="review-name">{r.name}</span>
                  <span className="verified-badge">✓ Verified</span>
                </div>
                <div className="review-shop">Visited {r.shop}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="carousel-btn next" aria-label="Next review" onClick={() => goTo(idx + 1)}>
          ›
        </button>
      </div>

      <div className="carousel-dots">
        {allReviews.map((_, i) => (
          <span key={i} className={i === idx ? "active" : ""} onClick={() => goTo(i)}></span>
        ))}
      </div>

      {/* Write a Review Form */}
      <div className="write-review-container glass glass-tight" data-reveal="fade-up" style={{ marginTop: "3rem", padding: "2rem" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", marginBottom: "0.5rem" }}>
          🔥 Write a Review
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          Have you tried Mandhi recently? Share your experience with the Kerala food community.
        </p>

        <form onSubmit={handleSubmitReview} className="write-review-form">
          <div className="review-form-row">
            <div className="form-group flex-1">
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
                Select Shop
              </label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="review-input"
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "var(--radius-md)", background: "var(--surface-glass)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: "#1a1612" }}>
                    {s.name} ({s.district})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="review-input"
                style={{ padding: "0.6rem 0.8rem", borderRadius: "var(--radius-md)", background: "var(--surface-glass)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}
              >
                <option value={5} style={{ background: "#1a1612" }}>★★★★★ (5/5)</option>
                <option value={4} style={{ background: "#1a1612" }}>★★★★☆ (4/5)</option>
                <option value={3} style={{ background: "#1a1612" }}>★★★☆☆ (3/5)</option>
                <option value={2} style={{ background: "#1a1612" }}>★★☆☆☆ (2/5)</option>
                <option value={1} style={{ background: "#1a1612" }}>★☆☆☆☆ (1/5)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <textarea
              placeholder="Tell us about the flavor, portion, meat tenderness, and ambiance..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              required
              className="review-input"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-glass)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", resize: "vertical", fontFamily: "var(--font-sans)" }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ marginTop: "1rem" }}
          >
            {isSubmitting ? "Submitting..." : user ? "Submit Review" : "Sign in to Post Review"}
          </button>
        </form>
      </div>
    </section>
  );
}
