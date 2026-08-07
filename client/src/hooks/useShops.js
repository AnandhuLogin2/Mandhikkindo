import { useEffect, useState, useMemo } from "react";
import { subscribeShops } from "../services/shopService";
import { getDistricts } from "../services/districtService";
import shopsFallback from "../data/shops.json";

const CATEGORY_ICONS = {
  "Chicken Mandhi": "🍗",
  "Alfaham Mandhi": "🔥",
  "Beef Mandhi": "🥩",
  "Mutton Mandhi": "🍖",
  "Fish Mandhi": "🐟",
  "Kuzhi Mandhi": "🍲",
};

export function useShops() {
  const [shops, setShops] = useState(shopsFallback);
  const [districtList, setDistrictList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    async function initData() {
      try {
        const dists = await getDistricts();
        if (dists && dists.length > 0) {
          setDistrictList(dists.map((d) => d.name));
        }
      } catch (err) {
        console.warn("Districts init failed:", err);
      }

      unsubscribe = subscribeShops((liveShops) => {
        if (liveShops && liveShops.length > 0) {
          setShops(liveShops);
        }
        setLoading(false);
      });
    }

    initData();

    return () => unsubscribe();
  }, []);

  const districts = useMemo(() => {
    if (districtList.length > 0) return districtList.sort();
    return [...new Set(shops.map((s) => s.district).filter(Boolean))].sort();
  }, [shops, districtList]);

  const categories = useMemo(() => {
    return [...new Set(shops.flatMap((s) => s.types || s.selectedTypes || []).filter(Boolean))].sort();
  }, [shops]);

  return { shops, districts, categories, categoryIcons: CATEGORY_ICONS, loading };
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
