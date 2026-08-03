import { useMemo } from "react";
import shopsRaw from "../data/shops.json";

const CATEGORY_ICONS = {
  "Chicken Mandhi": "🍗",
  "Alfaham Mandhi": "🔥",
  "Beef Mandhi": "🥩",
  "Mutton Mandhi": "🍖",
  "Fish Mandhi": "🐟",
};

export function useShops() {
  return useMemo(() => {
    const shops = shopsRaw;
    const districts = [...new Set(shops.map((s) => s.district))].sort();
    const categories = [...new Set(shops.flatMap((s) => s.types || []))].sort();
    return { shops, districts, categories, categoryIcons: CATEGORY_ICONS };
  }, []);
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}
