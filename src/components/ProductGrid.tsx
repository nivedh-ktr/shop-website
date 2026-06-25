"use client";

import { useEffect, useRef } from "react";
import { animateWateryReveal } from "@/utils/animations";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/utils/cn";
import { products } from "@/utils/products";

export default function ProductGrid() {
  const containerRef = useRef<HTMLElement>(null);
  const { addToCart, wishlist, toggleWishlist } = useAppContext();

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".product-card");
      animateWateryReveal(containerRef.current, Array.from(elements));
    }
  }, []);

  return (
    <section id="products" ref={containerRef} className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 product-card">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4">Our Products</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Explore our exclusive collection designed for modern living.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="product-card group flex flex-col bg-neutral-50 rounded-2xl overflow-hidden relative">
              <Link href={`/shop/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-neutral-100 block">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
              
              {/* Hover Overlay Actions */}
              <div className="absolute top-0 left-0 w-full aspect-[4/5] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
                  className="bg-white text-neutral-900 px-8 py-3 rounded-full font-medium tracking-wide hover:bg-neutral-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-auto"
                >
                  Add to cart
                </button>
              </div>
              <button 
                onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                className={cn(
                  "absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors z-10",
                  wishlist.includes(product.id) ? "text-red-500" : "text-neutral-600 hover:text-red-500"
                )}
              >
                <Heart className="w-5 h-5" fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
              </button>

              <div className="p-6 flex flex-col flex-grow">
                <Link href={`/shop/${product.id}`}>
                  <h3 className="font-medium text-xl tracking-wide text-neutral-900 mb-1 hover:text-neutral-600 transition-colors">{product.name}</h3>
                </Link>
                <p className="text-sm text-neutral-500 mb-4">{product.desc}</p>
                <div className="mt-auto flex items-center gap-3">
                  <span className="font-semibold text-lg">{product.price}</span>
                  {product.oldPrice && (
                    <span className="text-sm text-neutral-400 line-through">{product.oldPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center product-card">
          <Link href="/collections" className="inline-block px-10 py-4 border border-neutral-900 text-neutral-900 rounded-full font-medium tracking-widest uppercase hover:bg-neutral-900 hover:text-white transition-colors">
            Show More
          </Link>
        </div>
      </div>
    </section>
  );
}
