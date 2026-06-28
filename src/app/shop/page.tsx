import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/utils/supabase";

export const revalidate = 0; // Ensure fresh data fetching

export default async function ShopPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, price, discount_price, images, image_url, category')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
  }

  const safeProducts = products || [];

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 py-32">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 mb-4">Shop Collection</h1>
          <p className="text-neutral-500 max-w-2xl">Discover our complete range of premium, handcrafted furniture designed to elevate your living spaces.</p>
        </div>

        {safeProducts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-neutral-200/60 shadow-sm">
            <h2 className="text-2xl font-serif text-neutral-900 mb-3">No Products Found</h2>
            <p className="text-neutral-500 mb-8">We couldn't find any products in our database right now. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {safeProducts.map((product) => {
              // Ensure we use the new images array if available, otherwise fallback to legacy image_url
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
        )}
      </div>

      <Footer />
    </main>
  );
}
