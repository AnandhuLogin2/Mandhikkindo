import heroImg from "../assets/mandhi-hero.png";
import chickenImg from "../assets/chicken-mandhi.png";
import beefImg from "../assets/beef-mandhi.png";
import muttonImg from "../assets/mutton-mandhi.png";
import "./ShowcaseSection.css";

export default function ShowcaseSection() {
  return (
    <section className="section showcase" id="showcase">
      <div className="showcase-grid" data-reveal="fade-up">
        <figure className="showcase-item tall">
          <img src={heroImg} alt="Arabian chicken Kuzhi Mandhi platter" loading="lazy" />
          <figcaption>Straight off the pit</figcaption>
        </figure>
        <figure className="showcase-item">
          <img src={chickenImg} alt="Grilled chicken mandhi close-up" loading="lazy" />
          <figcaption>Grilled to order</figcaption>
        </figure>
        <figure className="showcase-item">
          <img src={beefImg} alt="Beef mandhi with Arabian rice" loading="lazy" />
          <figcaption>Slow-cooked beef</figcaption>
        </figure>
        <figure className="showcase-item wide">
          <img src={muttonImg} alt="Mutton mandhi family sharing platter" loading="lazy" />
          <figcaption>Built for sharing</figcaption>
        </figure>
      </div>
    </section>
  );
}
