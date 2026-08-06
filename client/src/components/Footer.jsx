import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./Footer.css";

export default function Footer() {
  const { showToast } = useApp();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    showToast("Subscribed — see you Sunday.");
  };

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a href="#top" className="nav-logo">
            <span className="logo-mark">灼</span>
            <span className="logo-word">Mandhikkindo</span>
          </a>
          <p className="footer-tagline">Kerala's Mandhi finder, one pit at a time.</p>
          <div className="social-row">
            <a href="#" aria-label="Instagram" className="social-btn">◎</a>
            <a href="#" aria-label="Facebook" className="social-btn">f</a>
            <a href="#" aria-label="WhatsApp" className="social-btn">✆</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <a href="#trending">Trending Shops</a>
          <a href="#categories">Categories</a>
          <a href="#interrogation">Take the Quiz</a>
          <a href="#gallery">Gallery</a>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Partner your Restaurant</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
        </div>

        <div className="footer-col newsletter">
          <h4>Get fed first</h4>
          <p>New pit openings, once a week, zero spam.</p>
          <form className="newsletter-form" onSubmit={submit}>
            <input
              type="email"
              placeholder="you@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">→</button>
          </form>
          {subscribed && <p className="newsletter-note">Subscribed — see you Sunday.</p>}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Mandhikkindo. All rights reserved.</span>
        <span>Made in Kerala, eaten everywhere.</span>
      </div>
    </footer>
  );
}
