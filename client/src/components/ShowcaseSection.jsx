import { useState, useEffect } from "react";
import { subscribeGalleryImages } from "../services/galleryService";
import heroImg from "../assets/mandhi-hero.png";
import chickenImg from "../assets/chicken-mandhi.png";
import beefImg from "../assets/beef-mandhi.png";
import muttonImg from "../assets/mutton-mandhi.png";
import "./ShowcaseSection.css";

const FALLBACK_ITEMS = [
  { img: heroImg, caption: "Straight off the pit", class: "tall" },
  { img: chickenImg, caption: "Grilled to order", class: "" },
  { img: beefImg, caption: "Slow-cooked beef", class: "" },
  { img: muttonImg, caption: "Built for sharing", class: "wide" },
];

export default function ShowcaseSection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = subscribeGalleryImages((list) => {
      if (list && list.length > 0) {
        setItems(list);
      }
    });
    return () => unsub();
  }, []);

  const displayList = items.length > 0
    ? items.slice(0, 4).map((g, idx) => ({
        img: g.imageUrl || g.url,
        caption: g.title || "Mandhi Showcase",
        class: idx === 0 ? "tall" : idx === 3 ? "wide" : "",
      }))
    : FALLBACK_ITEMS;

  return (
    <section className="section showcase" id="showcase">
      <div className="showcase-grid" data-reveal="fade-up">
        {displayList.map((item, idx) => (
          <figure key={idx} className={`showcase-item ${item.class}`}>
            <img src={item.img} alt={item.caption} loading="lazy" />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
