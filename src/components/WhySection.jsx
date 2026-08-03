import "./WhySection.css";

const FEATURES = [
  {
    grad: "var(--grad-1)",
    title: "Verified Data",
    desc: "Every rating here comes from a real district-by-district audit — not scraped listings or paid placements.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    grad: "var(--grad-2)",
    title: "Smart Match",
    desc: "Answer five quick questions in the Interrogation and we'll match you to the exact plate you're craving.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2 L14 9 L21 11 L14 13 L12 20 L10 13 L3 11 L10 9 Z" />
      </svg>
    ),
  },
  {
    grad: "var(--grad-3)",
    title: "Hyperlocal Coverage",
    desc: "From Kasaragod to Thiruvananthapuram — 153 shops across all 14 districts, zero guesswork.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

export default function WhySection() {
  return (
    <section className="section why-section" id="why">
      <div className="section-head" data-reveal="fade-up">
        <p className="eyebrow">why people trust the pit</p>
        <h2 className="section-title">Why Mandhikkindo</h2>
        <p className="section-sub">
          Not another listing site — a hand-audited map of Kerala's best Kuzhi Mandhi.
        </p>
      </div>

      <div className="neon-grid">
        {FEATURES.map((f, i) => (
          <div
            className="neon-card-wrap"
            key={f.title}
            data-reveal="fade-up"
            data-reveal-delay={i * 120}
          >
            <div className="neon-glow" style={{ background: f.grad }}></div>
            <div className="neon-card glass glass-tight" style={{ "--card-grad": f.grad }}>
              <div className="neon-icon">{f.icon}</div>
              <div>
                <h3 className="neon-title">{f.title}</h3>
                <p className="neon-desc">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
