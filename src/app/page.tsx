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
import SearchBar from "@/components/SearchBar";
import HomeProductGridSkeleton from "@/components/HomeProductGridSkeleton";
import { supabase } from "@/utils/supabase";
import { Suspense } from "react";

export const revalidate = 0;

async function HomeProductGrid({ query }: { query?: string }) {
  let productsQuery = supabase
    .from('products')
    .select('id, title, price, discount_price, images, image_url, category')
    .order('created_at', { ascending: false });

  if (query) {
    productsQuery = productsQuery.ilike('title', `%${query}%`);
  } else {
    productsQuery = productsQuery.eq('is_featured', true).limit(8);
  }

  const { data: featuredProducts } = await productsQuery;

  if (featuredProducts && featuredProducts.length > 0) {
    return <ProductGrid featuredProducts={featuredProducts} disableAnimation={!!query} />;
  }

  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4">Curated Collection</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Explore our exclusive featured pieces designed for modern living.</p>
        </div>
        
        <div className="py-12 text-center bg-white rounded-3xl border border-neutral-200/60 shadow-sm max-w-3xl mx-auto">
          <h2 className="text-2xl font-serif text-neutral-900 mb-4">
            No products found for &quot;{query}&quot;
          </h2>
          <p className="text-neutral-500">
            Try adjusting your search or exploring our categories.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <CategoryBrowser />
      
      <div className="container mx-auto px-6 md:px-12 mt-12 mb-12">
        <SearchBar />
      </div>
        
      <Suspense fallback={<HomeProductGridSkeleton />} key={query || 'home'}>
        <HomeProductGrid query={query} />
      </Suspense>

      <SocialProof />
      <TestimonialHub />
      <Footer />
      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
    </main>
  );
}
