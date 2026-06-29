"use client";

import { useEffect, useRef } from "react";
import { animateWateryReveal } from "@/utils/animations";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  featuredProducts?: any[];
  disableAnimation?: boolean;
}

export default function ProductGrid({ featuredProducts = [], disableAnimation = false }: ProductGridProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current && featuredProducts.length > 0 && !disableAnimation) {
      const elements = containerRef.current.querySelectorAll(".product-card");
      animateWateryReveal(containerRef.current, Array.from(elements));
    }
  }, [featuredProducts, disableAnimation]);

  return (
    <section id="products" ref={containerRef} className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 product-card">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4">Curated Collection</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Explore our exclusive featured pieces designed for modern living.</p>
        </div>
        
        {featuredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => {
              const displayImage = (product.images && product.images.length > 0) 
                ? product.images[0] 
                : (product.image_url || '');

              return (
                <div key={product.id} className="product-card h-full">
                  <ProductCard 
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    discount_price={product.discount_price}
                    image_url={displayImage}
                    category={product.category}
                  />
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-16 text-center product-card">
          <Link href="/shop" className="inline-block px-10 py-4 border border-neutral-900 text-neutral-900 rounded-full font-medium tracking-widest uppercase hover:bg-neutral-900 hover:text-white transition-colors">
            Show More
          </Link>
        </div>
      </div>
    </section>
  );
}
