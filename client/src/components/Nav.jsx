import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import "./Nav.css";

// Nav links (Gallery removed)
const LINKS = [
  { href: "#buddy", label: "Community" },
  { href: "#why", label: "Why Us" },
  { href: "#interrogation", label: "Quiz" },
  { href: "#reviews", label: "Reviews" },
  { href: "#footer", label: "Contact" },
];

export default function Nav() {
  const {
    theme, toggleTheme,
    setSearchOpen,
    cart, setCartOpen,
    setAiOpen,
  } = useApp();

  const { user, profile, signOut, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("buddy");
  const [isExpandingSearch, setIsExpandingSearch] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const lastScrollY = useRef(0);
  const dropdownRef = useRef(null);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Close mobile drawer on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown or mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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

  // Active section spy (only when on homepage '/')
  useEffect(() => {
    if (location.pathname !== "/") return;

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
  }, [location.pathname]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
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

  const handleInlineSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setSearchOpen(true);
    }
  };

  const userDisplayName = profile?.displayName || user?.displayName || user?.email || "User";
  const userPhoto = profile?.photoURL || user?.photoURL;
  const userInitials = userDisplayName.charAt(0).toUpperCase();

  return (
    <>
      <header className={`site-nav ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
        <div className="nav-inner glass-pill">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-mark" aria-hidden="true">🔥</span>
            <span className="logo-word">Mandhikkindo</span>
          </Link>

          {/* Main Navigation Links Drawer */}
          <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Primary Navigation">
            <div className="nav-links-list">
              {LINKS.map((l) => {
                const id = l.href.replace("#", "");
                const isActive = location.pathname === "/" && activeSection === id;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className={`nav-link-item ${isActive ? "active" : ""}`}
                    onClick={(e) => handleNavClick(e, l.href)}
                  >
                    <span>{l.label}</span>
                    {isActive && <span className="active-pill-indicator" />}
                  </a>
                );
              })}
            </div>

            {/* Mobile Drawer Actions (Shown only in mobile menu) */}
            <div className="nav-drawer-actions">
              <button
                type="button"
                className="btn btn-primary nav-drawer-ai-btn"
                onClick={() => {
                  setMenuOpen(false);
                  setAiOpen(true);
                }}
              >
                🤖 Ask Mandhi AI Buddy
              </button>

              {/* User Auth Info in Drawer */}
              {!authLoading && (
                user ? (
                  <div className="drawer-user-card">
                    <div className="drawer-user-info">
                      {userPhoto ? (
                        <img src={userPhoto} alt={userDisplayName} className="drawer-avatar-img" />
                      ) : (
                        <span className="drawer-avatar-initials">{userInitials}</span>
                      )}
                      <div className="drawer-user-meta">
                        <span className="drawer-user-name">{userDisplayName}</span>
                        <span className="drawer-user-email">{user.email}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="drawer-signout-btn"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                    >
                      🚪 Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-ghost nav-drawer-signin-btn"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in to your account
                  </Link>
                )
              )}

              {/* Theme Toggle row in Mobile Drawer */}
              <div className="nav-drawer-theme-row">
                <span className="drawer-theme-label">Appearance</span>
                <button
                  type="button"
                  className={`theme-toggle-switch ${theme === "dark" ? "is-dark" : "is-light"}`}
                  aria-label="Toggle Theme"
                  onClick={toggleTheme}
                >
                  <span className="toggle-thumb">
                    {theme === "dark" ? "🌙" : "☀️"}
                  </span>
                </button>
              </div>
            </div>
          </nav>

          {/* Header Right Actions */}
          <div className="nav-actions">
            {/* Search Trigger Button */}
            <div className={`nav-search-wrap ${isExpandingSearch ? "expanded" : ""}`}>
              {isExpandingSearch ? (
                <form className="nav-search-form" onSubmit={handleInlineSearchSubmit}>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search shops, reviews..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onBlur={() => !searchVal && setIsExpandingSearch(false)}
                  />
                  <button
                    type="button"
                    className="search-close-btn"
                    onClick={() => setIsExpandingSearch(false)}
                    aria-label="Close search"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="icon-btn search-trigger-btn"
                  aria-label="Search"
                  title="Search website"
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      setSearchOpen(true);
                    } else {
                      setIsExpandingSearch(true);
                      setSearchOpen(true);
                    }
                  }}
                >
                  🔍
                </button>
              )}
            </div>

            {/* Takeaway Cart Button */}
            <button
              type="button"
              className="icon-btn nav-cart-btn"
              aria-label="Takeaway Cart"
              title="Takeaway Cart"
              onClick={() => setCartOpen(true)}
            >
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {/* Theme Switcher Toggle (Compact round on mobile, full switch on desktop) */}
            <button
              type="button"
              className={`theme-toggle-switch nav-theme-toggle ${theme === "dark" ? "is-dark" : "is-light"}`}
              aria-label="Toggle Theme"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={toggleTheme}
            >
              <span className="toggle-thumb">
                {theme === "dark" ? "🌙" : "☀️"}
              </span>
            </button>

            {/* 🤖 AI Buddy CTA Button (Desktop only) */}
            <button
              type="button"
              className="btn btn-primary small nav-ai-cta desktop-only"
              aria-label="Open AI Buddy"
              onClick={() => setAiOpen(true)}
            >
              🤖 AI Buddy
            </button>

            {/* Auth Button or User Avatar Dropdown (Desktop only) */}
            {!authLoading && (
              user ? (
                <div className="user-nav-wrap desktop-only" ref={dropdownRef}>
                  <button
                    type="button"
                    className="user-avatar-btn"
                    aria-label="User menu"
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                  >
                    {userPhoto ? (
                      <img src={userPhoto} alt={userDisplayName} className="user-avatar-img" />
                    ) : (
                      <span className="user-avatar-initials">{userInitials}</span>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="user-dropdown-menu glass">
                      <div className="user-dropdown-header">
                        <span className="user-dropdown-name">{userDisplayName}</span>
                        <span className="user-dropdown-email">{user.email}</span>
                      </div>
                      <div className="user-dropdown-divider" />
                      <button
                        type="button"
                        className="user-dropdown-item signout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOut();
                        }}
                      >
                        🚪 Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-ghost small nav-signin-btn desktop-only">
                  Sign in
                </Link>
              )
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              className={`icon-btn nav-burger ${menuOpen ? "open" : ""}`}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {menuOpen && (
        <div
          className="nav-drawer-backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
