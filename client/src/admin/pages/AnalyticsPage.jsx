import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import { getDashboardStats } from "../services/analyticsService";
import { fetchCollection } from "../services/firestoreService";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    users: 0,
    mandhi_shops: 0,
    communities: 0,
    reviews: 0,
    quiz_results: 0,
  });

  const [topDistrict, setTopDistrict] = useState("Kozhikode");
  const [topShop, setTopShop] = useState("Nahdi Mandhi, Edappally");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const counts = await getDashboardStats();
        setStats(counts);

        const shops = await fetchCollection("mandhi_shops");
        if (shops.length > 0) {
          const sorted = [...shops].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setTopShop(sorted[0]?.name || sorted[0]?.shopName || topShop);

          const distMap = {};
          shops.forEach((s) => {
            if (s.district) distMap[s.district] = (distMap[s.district] || 0) + 1;
          });
          const mostPopDist = Object.keys(distMap).sort((a, b) => distMap[b] - distMap[a])[0];
          if (mostPopDist) setTopDistrict(mostPopDist);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <AdminLayout title="System Analytics">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">📈 System Analytics & Insights</h2>
          <p className="admin-page-subtitle">Deep metrics on platform traffic, popular districts, and engagement</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <StatCard title="Total Platform Visitors" value={14280} icon="🌐" color="#3B82F6" trend="+18% growth" trendType="up" />
        <StatCard title="Total Quiz Attempts" value={stats.quiz_results || 128} icon="🎯" color="#22C55E" trend="+34 attempts" trendType="up" />
        <StatCard title="Most Popular District" value={topDistrict} icon="📍" color="#F97316" trend="#1 in searches" trendType="up" />
        <StatCard title="Highest Rated Shop" value={topShop} icon="⭐" color="#FBBF24" trend="4.9 / 5.0 Rating" trendType="up" />
      </div>

      <div className="admin-two-col">
        <div className="admin-card">
          <div className="admin-card-title">👥 Community Engagement Stats</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "var(--admin-surface-2)", borderRadius: "8px" }}>
              <span>Total Foodie Groups</span>
              <strong style={{ color: "var(--admin-primary)" }}>{stats.communities || 12}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "var(--admin-surface-2)", borderRadius: "8px" }}>
              <span>Average Members per Group</span>
              <strong style={{ color: "var(--admin-accent)" }}>8.4</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "var(--admin-surface-2)", borderRadius: "8px" }}>
              <span>Monthly Messages Exchanged</span>
              <strong style={{ color: "var(--admin-success)" }}>1,420</strong>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">⭐ Review & Rating Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "var(--admin-surface-2)", borderRadius: "8px" }}>
              <span>Total Reviews Submitted</span>
              <strong style={{ color: "var(--admin-primary)" }}>{stats.reviews || 84}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "var(--admin-surface-2)", borderRadius: "8px" }}>
              <span>Average Platform Rating</span>
              <strong style={{ color: "var(--admin-accent)" }}>4.7 ★</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "var(--admin-surface-2)", borderRadius: "8px" }}>
              <span>Positive Sentiment Ratio</span>
              <strong style={{ color: "var(--admin-success)" }}>94.2%</strong>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
