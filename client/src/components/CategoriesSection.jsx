import { useState, useEffect } from "react";
import { getCategories } from "../services/categoryService";
import "./CategoriesSection.css";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getCategories();
        setCategories(list);
      } catch (err) {
        console.warn("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <section className="section alt" id="categories">
      <div className="section-head" data-reveal="fade-up">
        <p className="eyebrow">what are you craving</p>
        <h2 className="section-title">Popular Mandhi Categories</h2>
      </div>

      <div className="category-grid" data-reveal="fade-up">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="category-card glass glass-tight" style={{ opacity: 0.6 }}>
              <span className="cat-icon">⏳</span>
              <span className="cat-name">Loading...</span>
            </div>
          ))
        ) : (
          categories.map((c, i) => (
            <a
              key={c.id || c.name}
              href="#trending"
              className="category-card glass glass-tight"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <span className="cat-icon">{c.icon || "🏷️"}</span>
              <span className="cat-name">{c.name}</span>
            </a>
          ))
        )}
      </div>
    </section>
  );
}
