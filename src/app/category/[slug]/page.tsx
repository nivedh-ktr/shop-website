"use client";

import { use, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/utils/cn";
import { products } from "@/utils/products";
import gsap from "gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categoryDictionary: Record<string, { title: string; desc: string; filters: string[] }> = {
  "living-room": {
    title: "Living Room Collection",
    desc: "Elevate your living space with our premium sofas and comfortable seating arrangements.",
    filters: ["Sofas", "Chairs", "Lighting"],
  },
  "dining": {
    title: "Dining Room Collection",
    desc: "Gather around luxury. Hand-crafted chairs and premium accessories for dining.",
    filters: ["Chairs", "Accessories"],
  },
  "bedroom": {
    title: "Bedroom Collection",
    desc: "Rest in luxury. High-end beds and aesthetic lighting for your sanctuary.",
    filters: ["Beds", "Lighting"],
  },
  "office": {
    title: "Home Office Space",
    desc: "Focus in comfort. Ergonomic, premium seating and aesthetic accessories.",
    filters: ["Chairs", "Accessories", "Lighting"],
  },
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  
  const { addToCart, wishlist, toggleWishlist } = useAppContext();
  const pageRef = useRef<HTMLDivElement>(null);
  
  const categoryData = categoryDictionary[slug] || {
    title: "Premium Collection",
    desc: "Explore our curated lifestyle pieces.",
    filters: [],
  };

  const filteredProducts = products.filter((p) => 
    categoryData.filters.length === 0 || (p.category && categoryData.filters.includes(p.category))
  );

  useEffect(() => {
    // Instantly snap scroll back to top of screen via Lenis
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0 });
    }

    if (pageRef.current) {
      const elements = pageRef.current.querySelectorAll(".animate-item");
      gsap.fromTo(
        elements,
        { y: 40, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2, 
          stagger: 0.05, 
          ease: "power4.out" 
        }
      );
    }
  }, [slug]);

  const handleProductClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (pageRef.current) {
      const allCards = pageRef.current.querySelectorAll('.product-card');
      const clickedCard = (e.currentTarget as HTMLElement).closest('.product-card');
      
      const tl = gsap.timeline({
        onComplete: () => {
          router.push(href);
        }
      });

      // Fade down surrounding grid elements
      tl.to(allCards, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "power2.inOut",
        stagger: 0.02
      });
      
      // Highlight the clicked card
      if (clickedCard) {
        gsap.to(clickedCard, {
          scale: 1.02,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    } else {
      router.push(href);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col pt-32" ref={pageRef}>
      <Header />
      
      <main className="flex-grow container mx-auto px-6 md:px-12 py-12">
        <div className="text-center mb-16 animate-item">
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-4">{categoryData.title}</h1>
          <p className="text-neutral-500 max-w-2xl mx-auto">{categoryData.desc}</p>
          <div className="mt-8 text-sm font-medium tracking-wide text-neutral-400">
            SHOWING {filteredProducts.length} RESULTS
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card animate-item group flex flex-col bg-white rounded-2xl overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
              <a 
                href={`/shop/${product.id}?ref=${slug}`} 
                onClick={(e) => handleProductClick(e, `/shop/${product.id}?ref=${slug}`)} 
                className="relative aspect-[4/5] overflow-hidden bg-neutral-100 block cursor-pointer"
              >
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </a>
              
              <div className="absolute top-0 left-0 w-full aspect-[4/5] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product.id); }}
                  className="bg-white text-neutral-900 px-8 py-3 rounded-full font-medium tracking-wide hover:bg-neutral-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-auto shadow-lg"
                >
                  Add to cart
                </button>
              </div>
              
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                className={cn(
                  "absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors z-20",
                  wishlist.includes(product.id) ? "text-red-500" : "text-neutral-600 hover:text-red-500"
                )}
              >
                <Heart className="w-5 h-5" fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
              </button>

              <div className="p-6 flex flex-col flex-grow">
                <a 
                  href={`/shop/${product.id}?ref=${slug}`}
                  onClick={(e) => handleProductClick(e, `/shop/${product.id}?ref=${slug}`)}
                  className="cursor-pointer"
                >
                  <h3 className="font-medium text-xl tracking-wide text-neutral-900 mb-1 hover:text-neutral-600 transition-colors">{product.name}</h3>
                </a>
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
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-neutral-500 animate-item">
            No products found for this collection yet.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
