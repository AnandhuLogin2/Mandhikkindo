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
import GallerySection from "./components/GallerySection";
import Footer from "./components/Footer";
import Fabs from "./components/Fabs";
import SearchModal from "./components/SearchModal";
import CommunityModal from "./components/CommunityModal";
import ShopDetailModal from "./components/ShopDetailModal";
import CartModal from "./components/CartModal";
import AiBuddyDrawer from "./components/AiBuddyDrawer";
import Toast from "./components/Toast";

function PageContent() {
  useReveal();

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
        <GallerySection />
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
      <PageContent />
    </AppProvider>
  );
}
