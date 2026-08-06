import { useEffect, useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import "./Nav.css";

// ONLY these navigation items in main header
const LINKS = [
  { href: "#buddy", label: "Community" },
  { href: "#why", label: "Why Us" },
  { href: "#interrogation", label: "Quiz" },
  { href: "#reviews", label: "Reviews" },
  { href: "#gallery", label: "Gallery" },
  { href: "#footer", label: "Contact" },
];

export default function Nav() {
  const {
    theme, toggleTheme,
    setSearchOpen,
    cart, setCartOpen,
    setAiOpen,
  } = useApp();

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("buddy");
  const [isExpandingSearch, setIsExpandingSearch] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const lastScrollY = useRef(0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Smart Hide on Scroll Down & Show on Scroll Up
  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 24);

      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current + 8) {
          setHidden(true); // scrolling down
        } else if (currentScrollY < lastScrollY.current - 8) {
          setHidden(false); // scrolling up
        }
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section spy
  useEffect(() => {
    const sectionIds = LINKS.map((l) => l.href.replace("#", ""));
    const handleObserver = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleInlineSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setSearchOpen(true);
    }
  };

  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
      <div className="nav-inner glass-pill">
        {/* Logo */}
        <a href="#top" className="nav-logo">
          <span className="logo-mark">🔥</span>
          <span className="logo-word">Mandhikkindo</span>
        </a>

        {/* Main Navigation Links (ONLY 6 items + AI Buddy CTA) */}
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {LINKS.map((l) => {
            const id = l.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={l.href}
                href={l.href}
                className={isActive ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
                {isActive && <span className="active-pill-indicator" />}
              </a>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="nav-actions">
          {/* Expanding Search Bar */}
          <div className={`nav-search-wrap ${isExpandingSearch ? "expanded" : ""}`}>
            {isExpandingSearch ? (
              <form className="nav-search-form" onSubmit={handleInlineSearchSubmit}>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search community, reviews, shops..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onBlur={() => !searchVal && setIsExpandingSearch(false)}
                />
                <button
                  type="button"
                  className="search-close-btn"
                  onClick={() => setIsExpandingSearch(false)}
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                className="icon-btn search-trigger-btn"
                aria-label="Search"
                title="Search website"
                onClick={() => {
                  setIsExpandingSearch(true);
                  setSearchOpen(true);
                }}
              >
                🔍
              </button>
            )}
          </div>

          {/* Takeaway Cart Button */}
          <button
            className="icon-btn nav-cart-btn"
            aria-label="Takeaway Cart"
            title="Takeaway Cart"
            onClick={() => setCartOpen(true)}
          >
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Animated Theme Switcher Toggle */}
          <button
            className={`theme-toggle-switch ${theme === "dark" ? "is-dark" : "is-light"}`}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={toggleTheme}
          >
            <span className="toggle-thumb">
              {theme === "dark" ? "🌙" : "☀️"}
            </span>
          </button>

          {/* 🤖 AI Buddy Highlighted CTA Button */}
          <button
            className="btn btn-primary small nav-ai-cta"
            aria-label="Open AI Buddy"
            onClick={() => setAiOpen(true)}
          >
            🤖 AI Buddy
          </button>

          {/* Mobile Hamburger */}
          <button
            className={`icon-btn nav-burger ${menuOpen ? "open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
