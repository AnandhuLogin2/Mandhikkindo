import "./CategoriesSection.css";

const CATEGORIES = [
  { icon: "🍗", name: "Chicken Kuzhi Mandhi" },
  { icon: "🔥", name: "Alfaham Mandhi" },
  { icon: "🥩", name: "Beef Mandhi" },
  { icon: "🍖", name: "Mutton Mandhi" },
  { icon: "🐟", name: "Fish Mandhi" },
  { icon: "⭐", name: "Top Rated" },
  { icon: "👪", name: "Family Favourites" },
  { icon: "💎", name: "Hidden Gems" },
];

export default function CategoriesSection() {
  return (
    <section className="section alt" id="categories">
      <div className="section-head" data-reveal="fade-up">
        <p className="eyebrow">what are you craving</p>
        <h2 className="section-title">Popular Mandhi Categories</h2>
      </div>

      <div className="category-grid" data-reveal="fade-up">
        {CATEGORIES.map((c, i) => (
          <a
            key={c.name}
            href="#trending"
            className="category-card glass glass-tight"
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            <span className="cat-icon">{c.icon}</span>
            <span className="cat-name">{c.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
