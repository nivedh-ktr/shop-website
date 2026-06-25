import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryBrowser from "@/components/CategoryBrowser";
import ProductGrid from "@/components/ProductGrid";
import SocialProof from "@/components/SocialProof";
import TestimonialHub from "@/components/TestimonialHub";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <CategoryBrowser />
      <ProductGrid />
      <SocialProof />
      <TestimonialHub />
      <Footer />
      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
    </main>
  );
}
