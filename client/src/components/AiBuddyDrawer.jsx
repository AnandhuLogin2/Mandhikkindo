import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useShops } from "../hooks/useShops";
import { getSiteSettings } from "../services/siteSettingsService";
import "./AiBuddyDrawer.css";

const MANDHI_FACTS = [
  "💡 Traditional Kuzhi Mandhi is cooked inside an underground clay pit (Kuzhi) sealed with wet jute cloth for 5-6 hours!",
  "🍵 Sulaimani black tea with lemon & cardamom neutralizes the rich oiliness of Mandhi after a heavy meal.",
  "🌶️ Authentic Sahawiq (Arabic tomato chutney) is made raw with tomatoes, fresh coriander, green chillies, and garlic.",
  "🍗 Alfaham Mandhi combines Arabian pit cooking with Kerala charcoal grilling spices!",
  "🍚 Kuzhi Mandhi rice gets its yellow hue and subtle aroma from dry spices, smoked ghee, and saffron threads."
];

export default function AiBuddyDrawer() {
  const { aiOpen, setAiOpen, openShopDetail } = useApp();
  const { shops } = useShops();
  const [siteConfig, setSiteConfig] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "init",
      sender: "bot",
      text: "Namaskaram! 🍗 I'm your Mandhi Buddy AI. Ask me for shop recommendations, dish pairings, district recommendations, or Mandhi secrets across Kerala!",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const conf = await getSiteSettings();
        setSiteConfig(conf);
      } catch (err) {
        console.warn("AiBuddy config load failed:", err);
      }
    }
    loadConfig();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!aiOpen) return null;

  const handleSend = (textToSend = input) => {
    const q = textToSend.trim();
    if (!q) return;

    const userMsg = { id: `u-${Date.now()}`, sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Generate intelligent AI Response
    setTimeout(() => {
      const lower = q.toLowerCase();
      let botText = "";
      let recShops = [];

      if (lower.includes("alfaham")) {
        recShops = shops.filter((s) => (s.types || []).includes("Alfaham Mandhi")).sort((a, b) => b.rating - a.rating).slice(0, 3);
        botText = "Here are the top-rated Alfaham Mandhi pits with perfect smoky charcoal crust:";
      } else if (lower.includes("beef")) {
        recShops = shops.filter((s) => (s.types || []).includes("Beef Mandhi")).sort((a, b) => b.rating - a.rating).slice(0, 3);
        botText = "Craving tender, slow-cooked Beef Mandhi? These spots are famous for melt-in-mouth beef:";
      } else if (lower.includes("mutton")) {
        recShops = shops.filter((s) => (s.types || []).includes("Mutton Mandhi")).sort((a, b) => b.rating - a.rating).slice(0, 3);
        botText = "Royal Mutton Mandhi recommendations cooked with Yemeni traditional spices:";
      } else if (lower.includes("family")) {
        recShops = shops.filter((s) => s.reviews > 1000).sort((a, b) => b.rating - a.rating).slice(0, 3);
        botText = "Here are top family-friendly Mandhi hubs with spacious seating & high ratings:";
      } else if (lower.includes("kozhikode") || lower.includes("calicut")) {
        recShops = shops.filter((s) => s.district.toLowerCase() === "kozhikode").sort((a, b) => b.rating - a.rating).slice(0, 3);
        botText = "Kozhikode is legendary for Mandhi! Here are the highest rated spots in Kozhikode:";
      } else if (lower.includes("kochi") || lower.includes("ernakulam")) {
        recShops = shops.filter((s) => s.district.toLowerCase() === "ernakulam").sort((a, b) => b.rating - a.rating).slice(0, 3);
        botText = "Top Mandhi hubs in Kochi / Ernakulam:";
      } else if (lower.includes("fact") || lower.includes("secret")) {
        botText = MANDHI_FACTS[Math.floor(Math.random() * MANDHI_FACTS.length)];
      } else if (lower.includes("sulaimani") || lower.includes("tea")) {
        botText = "🍵 Pro tip: Always end your Mandhi feast with a steaming cup of Sulaimani tea! The cardamom, clove & lemon kick-start digestion after unlimited rice!";
      } else {
        recShops = [...shops].sort((a, b) => b.rating - a.rating).slice(0, 3);
        botText = `Great choice! Based on customer reviews, here are 3 top-rated Mandhi pits you should check out:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: botText,
          shops: recShops,
        },
      ]);
    }, 400);
  };

  return (
    <div className="ai-drawer-overlay" onClick={() => setAiOpen(false)}>
      <div className="ai-drawer glass" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-header">
          <div className="ai-bot-avatar">🍗</div>
          <div>
            <h3 className="ai-title">Mandhi AI Assistant</h3>
            <span className="ai-status">🟢 Online · AI Guru</span>
          </div>
          <button className="icon-btn ai-close" onClick={() => setAiOpen(false)}>✕</button>
        </div>

        {/* Messages Body */}
        <div className="ai-messages">
          {messages.map((m) => (
            <div key={m.id} className={`ai-msg-row ${m.sender}`}>
              {m.sender === "bot" && <div className="bot-icon">🤖</div>}
              <div className="ai-bubble">
                <p>{m.text}</p>
                {m.shops && m.shops.length > 0 && (
                  <div className="ai-shop-cards">
                    {m.shops.map((s) => (
                      <div
                        key={s.id}
                        className="ai-shop-card glass glass-tight"
                        onClick={() => {
                          setAiOpen(false);
                          openShopDetail(s);
                        }}
                      >
                        <div className="ais-head">
                          <strong>{s.name}</strong>
                          <span className="ais-rating">★ {s.rating.toFixed(1)}</span>
                        </div>
                        <span className="ais-loc">📍 {s.location}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="ai-quick-chips">
          <button onClick={() => handleSend("Top Alfaham Mandhi spots")}>🔥 Alfaham Spots</button>
          <button onClick={() => handleSend("Best Beef Mandhi")}>🥩 Beef Mandhi</button>
          <button onClick={() => handleSend("Family spots")}>👨‍👩‍👧 Family Friendly</button>
          <button onClick={() => handleSend("Tell me a Mandhi fact")}>💡 Mandhi Secret</button>
        </div>

        {/* Input Bar */}
        <form
          className="ai-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            placeholder="Ask Mandhi AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary small">Send 🚀</button>
        </form>
      </div>
    </div>
  );
}
