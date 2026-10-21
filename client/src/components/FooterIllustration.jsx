import React from "react";
import chickenMandhiImg from "../assets/chicken-mandhi.png";

/**
 * FooterIllustration
 * Recreates the exact Breaver Studios flame silhouette rising into the black upper section,
 * with the central character replaced by a real, high-resolution Chicken Mandhi food photograph.
 */
export default function FooterIllustration() {
  return (
    <div className="footer-flame-stage">
      {/* Upper Black Canvas with Orange Flame Silhouette */}
      <div className="footer-upper-canvas">
        <svg
          className="footer-flame-svg"
          viewBox="0 0 1200 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Flame spark / exclamation dot from reference */}
          <circle cx="700" cy="30" r="8" fill="#F97316" />
          <path d="M 697 10 L 703 10 L 702 22 L 698 22 Z" fill="#F97316" />

          {/* Exact continuous flowing orange flame silhouette */}
          <path
            d="
              M 0 320
              L 0 170
              C 15 140, 25 80, 20 40
              C 25 35, 42 45, 48 75
              C 58 120, 75 180, 105 195
              C 120 150, 125 90, 155 55
              C 170 40, 190 50, 185 85
              C 175 140, 195 185, 225 195
              C 240 165, 250 125, 280 95
              C 295 80, 310 95, 300 130
              C 290 170, 310 205, 340 215
              C 360 185, 375 155, 405 135
              C 420 125, 430 140, 420 170
              C 410 200, 425 225, 455 235
              C 475 200, 470 140, 510 95
              C 525 80, 545 95, 535 130
              C 525 165, 540 190, 560 205
              C 570 150, 580 75, 600 30
              C 610 15, 625 15, 630 45
              C 640 95, 630 150, 650 190
              C 660 140, 680 90, 710 60
              C 725 45, 740 60, 730 100
              C 720 150, 735 195, 755 220
              C 775 195, 790 155, 820 135
              C 835 125, 845 140, 835 170
              C 825 200, 840 220, 870 215
              C 890 170, 905 110, 935 85
              C 950 70, 965 85, 955 120
              C 945 155, 965 190, 995 195
              C 1015 150, 1025 80, 1060 50
              C 1075 35, 1095 45, 1085 85
              C 1075 135, 1100 175, 1130 190
              C 1145 140, 1165 75, 1180 35
              C 1190 20, 1200 30, 1200 65
              L 1200 320
              Z
            "
            fill="#F97316"
          />
        </svg>

        {/* Central Real Mandhi Food Photography */}
        <div className="footer-food-anchor">
          <div className="footer-food-glow" aria-hidden="true" />
          <div className="footer-food-platter" title="Authentic Kerala Chicken Mandhi Platter">
            <img
              src={chickenMandhiImg}
              alt="Authentic Kerala Chicken Mandhi Platter with roasted chicken and golden fragrant basmati rice"
              className="footer-food-img"
              loading="lazy"
            />
          </div>
          {/* Subtle contact shadow casting on the orange ledge */}
          <div className="footer-food-shadow" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
