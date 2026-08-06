import { useCountUp } from "../hooks/useCountUp";
import "./StatsSection.css";

const STATS = [
  { target: 153, suffix: "+", label: "Restaurants Surveyed" },
  { target: 20, suffix: "K+", label: "Food Lovers" },
  { target: 120, suffix: "K+", label: "Reviews Analysed" },
  { target: 14, suffix: "", label: "Districts Covered" },
];

function Stat({ target, suffix, label }) {
  const [ref, value] = useCountUp(target);
  return (
    <div className="stat-card glass glass-tight" ref={ref}>
      <span className="stat-number">{value}</span>
      <span className="stat-plus">{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="section stats-section" id="stats">
      <div className="stats-grid">
        {STATS.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
