import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/utils/supabase";
import SearchBar from "@/components/SearchBar";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import { Suspense } from "react";

export const revalidate = 0; // Ensure fresh data fetching

async function ShopProductGrid({ query }: { query?: string }) {
  let productsQuery = supabase
    .from('products')
    .select('id, title, price, discount_price, images, image_url, category')
    .order('created_at', { ascending: false });

  if (query) {
    productsQuery = productsQuery.ilike('title', `%${query}%`);
  }

  const { data: products, error } = await productsQuery;

  if (error) {
    console.error("Error fetching products:", error);
  }

  const safeProducts = products || [];

  if (safeProducts.length === 0) {
    return (
      <div className="py-24 text-center bg-white rounded-3xl border border-neutral-200/60 shadow-sm">
        <h2 className="text-2xl font-serif text-neutral-900 mb-3">No Products Found</h2>
        <p className="text-neutral-500 mb-8">We couldn&apos;t find any products matching your search right now. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {safeProducts.map((product) => {
        const displayImage = (product.images && product.images.length > 0) 
          ? product.images[0] 
          : (product.image_url || '');

        return (
          <ProductCard 
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.price}
            discount_price={product.discount_price}
            image_url={displayImage}
            category={product.category}
          />
        );
      })}
    </div>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 py-32">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 mb-4">Shop Collection</h1>
          <p className="text-neutral-500 max-w-2xl">Discover our complete range of premium, handcrafted furniture designed to elevate your living spaces.</p>
        </div>

        <SearchBar />

        <Suspense fallback={<ProductGridSkeleton />} key={query || 'shop'}>
          <ShopProductGrid query={query} />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
