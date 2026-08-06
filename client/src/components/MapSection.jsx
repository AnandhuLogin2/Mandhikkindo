import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useShops } from "../hooks/useShops";
import { useApp } from "../context/AppContext";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";

function makeIcon(emoji, glow) {
  return L.divIcon({
    className: "mk-marker",
    html: `<span class="mk-marker-pin" style="--glow:${glow}">${emoji}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 30],
    popupAnchor: [0, -28],
  });
}

const shopIcon = makeIcon("🔥", "rgba(255,106,57,0.65)");

export default function MapSection() {
  const { shops } = useShops();
  const { openCommunity, openShopDetail } = useApp();

  const center = useMemo(() => [10.35, 76.4], []);

  return (
    <section className="section map-section" id="map">
      <div className="section-head" data-reveal="fade-up">
        <p className="eyebrow">every pit, plotted</p>
        <h2 className="section-title">Interactive Kerala Map</h2>
        <p className="section-sub">
          Browse all surveyed shops across Kerala. 🔥 markers are Mandhi pits — click to see
          details, menu, or find a buddy.
        </p>
      </div>
      <div className="map-shell glass glass-tight" data-reveal="fade-up">
        <MapContainer center={center} zoom={7.3} scrollWheelZoom={false} className="kerala-map">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {shops.map((shop) => (
            <Marker key={shop.id} position={[shop.lat, shop.lng]} icon={shopIcon}>
              <Popup>
                <div className="mk-popup">
                  <strong>{shop.name}</strong>
                  <span>{shop.location}</span>
                  <span className="mk-popup-rating">★ {shop.rating.toFixed(1)} · {shop.reviews.toLocaleString()} reviews</span>
                  <div className="mk-popup-btns">
                    <button onClick={() => openShopDetail(shop)}>View Menu & Pre-Order 📋</button>
                    <button onClick={() => openCommunity("create", shop.name)}>Find a Mandhi Buddy 🍗</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
