import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import "./Fabs.css";

export default function Fabs() {
  const { setSearchOpen, cart, setCartOpen, setAiOpen } = useApp();
  const [showTop, setShowTop] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fabs-container">
      {showTop && (
        <button
          className="fab fab-top"
          aria-label="Back to top"
          title="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}

      {/* AI Assistant FAB */}
      <button
        className="fab fab-ai"
        aria-label="Ask Mandhi AI"
        title="Mandhi AI Assistant 🤖"
        onClick={() => setAiOpen(true)}
      >
        🤖
      </button>

      {/* Cart FAB */}
      <button
        className="fab fab-cart"
        aria-label="View Takeaway Cart"
        title="Takeaway Cart 🛒"
        onClick={() => setCartOpen(true)}
      >
        🛒
        {cartCount > 0 && <span className="fab-cart-badge">{cartCount}</span>}
      </button>

      <a
        href="https://wa.me/910000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fab fab-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Community WhatsApp"
      >
        ✆
      </a>

      <button className="fab fab-search" aria-label="Search shops" title="Search Pits" onClick={() => setSearchOpen(true)}>
        ⌕
      </button>
    </div>
  );
}
