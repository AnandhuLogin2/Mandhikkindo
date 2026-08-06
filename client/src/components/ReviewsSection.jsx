import { useEffect, useMemo, useRef, useState } from "react";
import { useShops } from "../hooks/useShops";
import "./ReviewsSection.css";

const TEXTS = [
  "The rice alone is worth the drive. Meat fell right off the bone.",
  "Portion sizes are unreal — came for lunch, left with dinner too.",
  "Best mandhi I've had outside of a Gulf trip, honestly.",
  "Service was quick even on a packed Sunday afternoon.",
  "The smoky pit flavour actually comes through — rare these days.",
  "Family of six, everyone had a different favourite. That says it all.",
];
const NAMES = ["Anoop", "Fathima", "Rahul", "Meera", "Sabith", "Aleena"];

export default function ReviewsSection() {
  const { shops } = useShops();
  const reviews = useMemo(() => {
    const picks = [...shops].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
    return picks.map((shop, i) => ({
      initial: shop.name.charAt(0),
      name: NAMES[i % NAMES.length],
      text: TEXTS[i % TEXTS.length],
      shop: shop.name,
      rating: Math.max(4, Math.round(shop.rating)),
    }));
  }, [shops]);

  const [idx, setIdx] = useState(0);
  const total = reviews.length;
  const hovering = useRef(false);

  const goTo = (i) => setIdx(((i % total) + total) % total);

  useEffect(() => {
    if (!total) return;
    const int = setInterval(() => {
      if (!hovering.current) setIdx((i) => (i + 1) % total);
    }, 6000);
    return () => clearInterval(int);
  }, [total]);

  return (
    <section className="section" id="reviews">
      <div className="section-head" data-reveal="fade-up">
        <p className="eyebrow">from people who finished the whole plate</p>
        <h2 className="section-title">Customer Reviews</h2>
      </div>

      <div
        className="review-carousel"
        data-reveal="fade-up"
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
      >
        <button className="carousel-btn prev" aria-label="Previous review" onClick={() => goTo(idx - 1)}>‹</button>
        <div className="review-track-wrap">
          <div className="review-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
            {reviews.map((r, i) => (
              <div className="review-card glass glass-tight" key={i}>
                <div className="review-avatar">{r.initial}</div>
                <div className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
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
        <button className="carousel-btn next" aria-label="Next review" onClick={() => goTo(idx + 1)}>›</button>
      </div>
      <div className="carousel-dots">
        {reviews.map((_, i) => (
          <span key={i} className={i === idx ? "active" : ""} onClick={() => goTo(i)}></span>
        ))}
      </div>
    </section>
  );
}
