import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import CategoryProductGridSkeleton from "@/components/CategoryProductGridSkeleton";
import { supabase } from "@/utils/supabase";
import { Suspense } from "react";

export const revalidate = 0;

const categoryDictionary: Record<string, { title: string; desc: string; searchTag: string }> = {
  "living-room": {
    title: "Living Room Collection",
    desc: "Elevate your living space with our premium sofas and comfortable seating arrangements.",
    searchTag: "Living Room",
  },
  "dining": {
    title: "Dining Room Collection",
    desc: "Gather around luxury. Hand-crafted chairs and premium accessories for dining.",
    searchTag: "Dining",
  },
  "bedroom": {
    title: "Bedroom Collection",
    desc: "Rest in luxury. High-end beds and aesthetic lighting for your sanctuary.",
    searchTag: "Bedroom",
  },
  "office": {
    title: "Home Office Space",
    desc: "Focus in comfort. Ergonomic, premium seating and aesthetic accessories.",
    searchTag: "Office",
  },
};

async function CategoryProductGrid({ query, categoryData }: { query?: string, categoryData: any }) {
  let productsQuery = supabase
    .from('products')
    .select('id, title, price, discount_price, images, image_url, category')
    .ilike('category', `%${categoryData.searchTag}%`)
    .order('created_at', { ascending: false });

  if (query) {
    productsQuery = productsQuery.ilike('title', `%${query}%`);
  }

  const { data: products, error } = await productsQuery;

  if (error) {
    console.error("Error fetching category products:", error);
  }

  const safeProducts = products || [];

  if (safeProducts.length === 0) {
    return (
      <div className="py-24 text-center bg-white rounded-3xl border border-neutral-200/60 shadow-sm mt-8">
        <h2 className="text-2xl font-serif text-neutral-900 mb-3">No Products Found</h2>
        <p className="text-neutral-500 mb-8">We couldn't find any products in this category matching your search.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-sm font-medium tracking-wide text-neutral-400">
        SHOWING {safeProducts.length} RESULTS
      </div>
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
    </>
  );
}

export default async function CategoryPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ query?: string }>;
}) {
  const { slug } = await params;
  const { query } = await searchParams;
  
  const categoryData = categoryDictionary[slug] || {
    title: "Premium Collection",
    desc: "Explore our curated lifestyle pieces.",
    searchTag: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col pt-32">
      <Header />
      
      <main className="flex-grow container mx-auto px-6 md:px-12 py-12">
        <div className="text-center mb-16 animate-item">
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-4">{categoryData.title}</h1>
          <p className="text-neutral-500 max-w-2xl mx-auto">{categoryData.desc}</p>
        </div>

        <SearchBar />

        <Suspense fallback={<CategoryProductGridSkeleton />} key={query || 'category'}>
          <CategoryProductGrid query={query} categoryData={categoryData} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
