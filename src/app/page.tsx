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
import { supabase } from "@/utils/supabase";

export const revalidate = 0;

export default async function Home() {
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('id, title, price, discount_price, images, image_url, category')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <CategoryBrowser />
      <ProductGrid featuredProducts={featuredProducts || []} />
      <SocialProof />
      <TestimonialHub />
      <Footer />
      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
    </main>
  );
}
