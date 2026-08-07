import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { useReveal } from "./hooks/useReveal";

import Nav from "./components/Nav";
import Hero from "./components/Hero";
import BuddySection from "./components/BuddySection";
import ShopsSection from "./components/ShopsSection";
import MapSection from "./components/MapSection";
import CategoriesSection from "./components/CategoriesSection";
import ShowcaseSection from "./components/ShowcaseSection";
import WhySection from "./components/WhySection";
import QuizSection from "./components/QuizSection";
import ReviewsSection from "./components/ReviewsSection";
import StatsSection from "./components/StatsSection";
import Footer from "./components/Footer";
import Fabs from "./components/Fabs";
import SearchModal from "./components/SearchModal";
import CommunityModal from "./components/CommunityModal";
import ShopDetailModal from "./components/ShopDetailModal";
import CartModal from "./components/CartModal";
import AiBuddyDrawer from "./components/AiBuddyDrawer";
import Toast from "./components/Toast";

import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

const AdminApp = lazy(() => import("./admin/AdminApp"));

function MainPageContent() {
  useReveal();
  const location = useLocation();

  // Scroll to anchor ID when location hash changes or on mount
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location]);

  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <BuddySection />
        <ShopsSection />
        <MapSection />
        <CategoriesSection />
        <ShowcaseSection />
        <WhySection />
        <QuizSection />
        <ReviewsSection />
        <StatsSection />
      </main>
      <Footer />
      <Fabs />
      <SearchModal />
      <CommunityModal />
      <ShopDetailModal />
      <CartModal />
      <AiBuddyDrawer />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<MainPageContent />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppProvider>
  );
}
