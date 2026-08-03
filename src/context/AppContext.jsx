import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AppContext = createContext(null);

const AUDIO_CHIME = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...";// synth fallback via Web Audio

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("mk-theme") || "dark");
  const [searchOpen, setSearchOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [communityTab, setCommunityTab] = useState("browse");
  const [prefillShop, setPrefillShop] = useState(null);
  
  // New features
  const [selectedShop, setSelectedShop] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Favorites (array of shop IDs)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("mk-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart: [{ id, shopId, shopName, name, price, qty, notes }]
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("mk-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User-submitted reviews
  const [userReviews, setUserReviews] = useState(() => {
    try {
      const saved = localStorage.getItem("mk-user-reviews");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimer = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mk-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("mk-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("mk-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("mk-user-reviews", JSON.stringify(userReviews));
  }, [userReviews]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, msg });
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 2800);
  }, []);

  const toggleFavorite = useCallback((shopId) => {
    setFavorites((prev) => {
      const exists = prev.includes(shopId);
      const next = exists ? prev.filter((id) => id !== shopId) : [...prev, shopId];
      showToast(exists ? "Removed from favorites" : "Added to favorites ❤️");
      return next;
    });
  }, [showToast]);

  const addToCart = useCallback((shop, item, notes = "") => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.shopId === shop.id && i.name === item.name
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].qty += 1;
        return next;
      }
      return [
        ...prev,
        {
          id: `${shop.id}-${item.name}-${Date.now()}`,
          shopId: shop.id,
          shopName: shop.name,
          name: item.name,
          price: item.price,
          qty: 1,
          notes,
        },
      ];
    });
    showToast(`Added ${item.name} to takeaway cart 🍗`);
  }, [showToast]);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateCartQty = useCallback((itemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addReview = useCallback((shopId, review) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      shopId,
      date: new Date().toISOString().slice(0, 10),
      ...review,
    };
    setUserReviews((prev) => [newRev, ...prev]);
    showToast("Review submitted successfully! Thank you 🙌");
  }, [showToast]);

  const openCommunity = useCallback((tab = "browse", shopName = null) => {
    setCommunityTab(tab);
    setPrefillShop(shopName);
    setCommunityOpen(true);
  }, []);

  const openShopDetail = useCallback((shop) => {
    setSelectedShop(shop);
  }, []);

  // Web Audio Sizzle Sound Synthesizer
  const playSizzle = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 1800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {
      // Audio fallback
    }
  }, [audioEnabled]);

  const value = {
    theme, toggleTheme,
    searchOpen, setSearchOpen,
    communityOpen, setCommunityOpen, communityTab, setCommunityTab, openCommunity,
    prefillShop, setPrefillShop,
    selectedShop, setSelectedShop, openShopDetail,
    cartOpen, setCartOpen, cart, addToCart, removeFromCart, updateCartQty, clearCart,
    aiOpen, setAiOpen,
    favorites, toggleFavorite,
    userReviews, addReview,
    audioEnabled, setAudioEnabled, playSizzle,
    toast, showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
