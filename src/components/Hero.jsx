import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import "./Hero.css";

function PitCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf;
    let w, h, dpr;

    const embers = Array.from({ length: 46 }, () => spawnEmber(true));
    const steams = Array.from({ length: 6 }, () => spawnSteam(true));

    function spawnEmber(initial = false) {
      return {
        x: 0.5 + (Math.random() - 0.5) * 0.55,
        y: initial ? Math.random() : 1.05 + Math.random() * 0.2,
        r: 1 + Math.random() * 2.6,
        speed: 0.00028 + Math.random() * 0.00055,
        drift: (Math.random() - 0.5) * 0.0006,
        flicker: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.5 ? "249,115,22" : "251,191,36", // Rich Orange / Golden Yellow
      };
    }
    function spawnSteam(initial = false) {
      return {
        x: 0.5 + (Math.random() - 0.5) * 0.4,
        y: initial ? Math.random() * 0.6 + 0.3 : 0.72,
        scale: 0.6 + Math.random() * 0.9,
        speed: 0.00012 + Math.random() * 0.00012,
        drift: (Math.random() - 0.5) * 0.0003,
        opacity: 0.04 + Math.random() * 0.05,
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function drawFrame(t) {
      ctx.clearRect(0, 0, w, h);

      // steam wisps
      steams.forEach((s) => {
        const grad = ctx.createRadialGradient(
          s.x * w, s.y * h, 0,
          s.x * w, s.y * h, 120 * s.scale
        );
        grad.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(s.x * w, s.y * h, 120 * s.scale, 170 * s.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        if (!reduceMotion) {
          s.y -= s.speed;
          s.x += s.drift;
          if (s.y < 0.05) Object.assign(s, spawnSteam());
        }
      });

      // embers
      embers.forEach((e) => {
        const flick = 0.55 + Math.sin(t * 0.004 + e.flicker) * 0.45;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${e.hue},${flick})`;
        ctx.shadowColor = `rgba(${e.hue},0.9)`;
        ctx.shadowBlur = 8;
        ctx.arc(e.x * w, e.y * h, e.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (!reduceMotion) {
          e.y -= e.speed * 16;
          e.x += e.drift * 16 + Math.sin(t * 0.001 + e.flicker) * 0.0003;
          if (e.y < -0.05) Object.assign(e, spawnEmber());
        }
      });

      if (!reduceMotion) raf = requestAnimationFrame(drawFrame);
    }

    raf = requestAnimationFrame(drawFrame);
    if (reduceMotion) drawFrame(0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pit-canvas" aria-hidden="true" />;
}

export default function Hero() {
  const { setSearchOpen } = useApp();

  return (
    <section className="hero" id="hero">
      <div className="hero-media" aria-hidden="true">
        <div className="pit-rings">
          <span className="pit-ring r1"></span>
          <span className="pit-ring r2"></span>
          <span className="pit-ring r3"></span>
        </div>
        <PitCanvas />
        <div className="hero-scrim"></div>
      </div>

      <div className="hero-content" data-reveal="fade-up">
        <p className="eyebrow">153 pits · 14 districts · one ultimate community platform</p>
        <h1 className="hero-title">
          Discover the Best
          <br />
          <span className="accent-text">Kuzhi Mandhi</span> Pits
        </h1>
        <p className="hero-sub">
          Explore top-rated Kuzhi Mandhi spots across Kerala, connect with local food buddies, and pre-order takeaway plates seamlessly.
        </p>

        <div className="hero-btn-row">
          <a href="#trending" className="btn btn-primary">Explore Restaurants</a>
          <button className="btn btn-ghost" onClick={() => setSearchOpen(true)}>
            🔍 Search a shop, community, or review
          </button>
        </div>
      </div>

      <a href="#trending" className="scroll-cue" aria-label="Scroll down"><span></span></a>
    </section>
  );
}
