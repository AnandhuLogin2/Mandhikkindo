import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getSiteSettings } from "../services/siteSettingsService";
import FooterIllustration from "./FooterIllustration";
import "./Footer.css";

// Navigation links matching reference structure & real project routes
const NAV_LINKS = [
  { href: "#why", label: "About" },
  { href: "#buddy", label: "Community" },
  { href: "#trending", label: "Mandhi Shops" },
  { href: "#map", label: "Mandhi Map" },
  { href: "#interrogation", label: "Quiz" },
  { href: "#reviews", label: "Reviews" },
  { href: "#top", label: "Privacy Policy" },
];

export default function Footer() {
  const { showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const conf = await getSiteSettings();
        setSettings(conf);
      } catch (err) {
        console.warn("Footer settings load error:", err);
      }
    }
    loadData();
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate(`/${href}`);
    } else {
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    showToast("Subscribed — see you Sunday.");
  };

  // Formatted destinations
  const contactPhone = settings?.contactPhone || "+91 98765 43210";
  const cleanPhoneDigits = contactPhone.replace(/[^0-9]/g, "") || "919876543210";
  const whatsappUrl = `https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(
    "Hi Mandhikkindo! I have a Mandhi recommendation / question."
  )}`;

  const instagramUrl = settings?.instagramLink || "https://instagram.com/mandhikkindo";
  const facebookUrl = settings?.facebookLink || "https://facebook.com/mandhikkindo";
  const youtubeUrl = settings?.youtubeLink || "https://youtube.com/mandhikkindo";

  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer-outer" id="footer" aria-label="Site Footer">
      <div className="site-footer-card">
        {/* ================= UPPER SECTION: BLACK BACKGROUND & FLAME SILHOUETTE ================= */}
        <section className="footer-upper-section" aria-hidden="true">
          <FooterIllustration />
        </section>

        {/* ================= LOWER SECTION: SOLID ORANGE SURFACE WITH CONTENT ================= */}
        <section className="footer-lower-section">
          <div className="footer-content-grid">
            {/* COLUMN 1: NAVIGATION */}
            <div className="footer-col-nav">
              <h3 className="footer-section-heading">Navigation</h3>
              <nav className="footer-nav-menu" aria-label="Footer Navigation">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="footer-link"
                    onClick={(e) => handleNavClick(e, link.href)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* COLUMN 2: CONTACT CTA */}
            <div className="footer-col-cta">
              <h3 className="footer-section-heading cta-heading">Say Hi!</h3>
              <p className="footer-cta-desc">
                Let&apos;s talk Mandhi, share recommendations, and bring food lovers together.
              </p>
              <div className="cta-button-wrap">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-pill-btn"
                  aria-label="Let's Chat on WhatsApp"
                >
                  Lets Chat!
                </a>
              </div>

              {/* Newsletter subscription toggle */}
              <div className="footer-newsletter-row">
                {!showNewsletter ? (
                  <button
                    type="button"
                    className="newsletter-expand-btn"
                    onClick={() => setShowNewsletter(true)}
                  >
                    ✉ Get weekly pit drops
                  </button>
                ) : (
                  <form className="footer-compact-newsletter" onSubmit={handleSubscribe}>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-label="Email address for newsletter"
                      className="newsletter-pill-input"
                    />
                    <button type="submit" className="newsletter-pill-submit" aria-label="Subscribe">
                      ✓
                    </button>
                  </form>
                )}
                {subscribed && (
                  <span className="newsletter-confirm-tag">✓ Subscribed!</span>
                )}
              </div>
            </div>

            {/* COLUMN 3: SOCIAL & COPYRIGHT */}
            <div className="footer-col-social">
              {/* Round Black Social Buttons */}
              <div className="footer-social-icons-row" aria-label="Social media links">
                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="footer-black-social-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="footer-black-social-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="footer-black-social-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="footer-black-social-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#111111" />
                  </svg>
                </a>
              </div>

              {/* Dynamic Copyright */}
              <p className="footer-copyright-text">
                © {currentYear} Mandhikkindo
              </p>

              {/* Inset Badge Inspired by Reference */}
              <div className="footer-badge-wrap">
                <span className="footer-badge">
                  <span className="badge-flame" aria-hidden="true">🔥</span>
                  Built with love in Kerala
                </span>
              </div>
            </div>
          </div>

          {/* ================= OVERSIZED WORDMARK ================= */}
          <div className="footer-wordmark-bottom" aria-hidden="true">
            <h2 className="footer-giant-wordmark">MANDHIKKINDO</h2>
          </div>
        </section>
      </div>
    </footer>
  );
}
