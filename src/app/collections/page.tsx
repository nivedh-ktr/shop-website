"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { products } from "@/utils/products";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/utils/cn";

const TABS = ["All Collections", "Best Sellers", "New Arrivals", "Limited Edition", "Designer Picks"];

export default function CollectionsPage() {
  const [activeTab, setActiveTab] = useState("All Collections");
  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { addToCart, wishlist, toggleWishlist } = useAppContext();

  // Handle Entrance Animation & Lenis Top Scroll
  useEffect(() => {
    // Force scroll to top instantly on route entry
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(
        ".stagger-item",
        { y: 80, opacity: 0, filter: "blur(15px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.5, stagger: 0.08 }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Handle Liquid Layout Reshuffle on Tab Change
  useEffect(() => {
    if (!gridRef.current) return;
    
    const cards = gridRef.current.querySelectorAll(".product-card");
    if (cards.length === 0) return;

    // Liquid elastic staggered entry for reshuffling
    gsap.fromTo(
      cards,
      { y: 40, opacity: 0, scale: 0.95 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        duration: 0.8, 
        stagger: 0.05, 
        ease: "back.out(1.5)",
        clearProps: "all"
      }
    );
  }, [activeTab]);

  const filteredProducts = activeTab === "All Collections" 
    ? products 
    : products.filter(p => p.tags?.includes(activeTab));

  return (
    <main ref={pageRef} className="min-h-screen pt-32 pb-24 bg-neutral-50 overflow-hidden">
      <Header />
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-12 text-center stagger-item">
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-6">Curated Collections</h1>
          <p className="text-neutral-500 text-lg md:text-xl max-w-2xl mx-auto">
            Discover our flagship gallery of meticulously crafted furniture pieces.
          </p>
        </div>

        {/* Liquid Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16 stagger-item">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-500",
                activeTab === tab 
                  ? "bg-neutral-900 text-white shadow-lg scale-105" 
                  : "bg-white text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[500px]">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 stagger-item relative">
              <Link href={`/shop/${product.id}`} className="relative aspect-square overflow-hidden bg-neutral-100 block">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              </Link>
                
              {/* Hover Actions */}
              <div className="absolute top-0 left-0 w-full aspect-square bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <button 
                  onClick={(e) => { e.preventDefault(); addToCart(product.id); }}
                  className="bg-white text-neutral-900 px-6 py-3 rounded-full font-medium tracking-wide hover:bg-neutral-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-auto"
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
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-20 text-neutral-400 font-medium">
              No products found in this collection.
            </div>
          )}
        </div>
      </div>

      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
      
      <div className="mt-32">
        <Footer />
      </div>
    </main>
  );
}
