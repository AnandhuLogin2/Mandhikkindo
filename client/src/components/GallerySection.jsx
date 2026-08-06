import heroImg from "../assets/mandhi-hero.png";
import chickenImg from "../assets/chicken-mandhi.png";
import beefImg from "../assets/beef-mandhi.png";
import muttonImg from "../assets/mutton-mandhi.png";
import "./GallerySection.css";

const ITEMS = [
  { img: heroImg, caption: "The full spread", tall: true },
  { img: chickenImg, caption: "Charcoal-grilled chicken" },
  { img: muttonImg, caption: "Sunday family table" },
  { img: beefImg, caption: "Slow-braised beef" },
  { img: chickenImg, caption: "Fresh off the coals", tall: true },
  { img: heroImg, caption: "Rice, done right" },
  { img: beefImg, caption: "Weekend regulars" },
  { img: muttonImg, caption: "Sharing plate for six" },
];

export default function GallerySection() {
  return (
    <section className="section" id="gallery">
      <div className="section-head" data-reveal="fade-up">
        <p className="eyebrow">the pit, the plate, the people</p>
        <h2 className="section-title">Gallery</h2>
      </div>
      <div className="masonry" data-reveal="fade-up">
        {ITEMS.map((it, i) => (
          <figure className={`masonry-item ${it.tall ? "tall" : ""}`} key={i}>
            <img src={it.img} alt={it.caption} loading="lazy" />
            <figcaption>{it.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
