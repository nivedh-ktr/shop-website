"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";

const categoryList = [
  { name: "Living Room", desc: "Plush seating and sophisticated centers.", image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80", colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-2" },
  { name: "Dining", desc: "Gather around timeless elegance.", image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { name: "Bedroom", desc: "Your personal sanctuary.", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { name: "Office", desc: "Focus meets high-end form.", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { name: "Outdoor", desc: "Nature, elevated.", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { name: "Luxury Bath", desc: "Minimalist aquatic spaces.", image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80", colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-1" },
  { name: "Minimalist Kitchen", desc: "Culinary perfection.", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80", colSpan: "col-span-1 md:col-span-3", rowSpan: "row-span-1" },
];

export default function CategoriesPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll to top instantly on route change
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    // GSAP Entrance Timeline: Apple-style liquid transition
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

  return (
    <main ref={pageRef} className="min-h-screen pt-32 pb-24 bg-neutral-50 overflow-hidden">
      <Header />
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-16 text-center max-w-3xl mx-auto stagger-item">
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight mb-6">Our Spaces</h1>
          <p className="text-neutral-500 text-lg md:text-xl">
            Explore curated design concepts tailored for every corner of your home. Premium craftsmanship meets architectural purity.
          </p>
        </div>

        {/* Premium Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[400px]">
          {categoryList.map((category, index) => (
            <Link 
              key={index} 
              href={`/category/${category.name.toLowerCase().replace(' ', '-')}`}
              className={`stagger-item group block relative overflow-hidden rounded-3xl bg-neutral-200 ${category.colSpan} ${category.rowSpan}`}
            >
              <Image 
                src={category.image} 
                alt={category.name}
                fill
                className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.08]"
              />
              
              {/* Overlay with Backdrop Blur */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700 ease-out" />
              
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-0 group-hover:opacity-100">
                <h2 className="text-white font-medium text-2xl tracking-wide mb-2">{category.name}</h2>
                <p className="text-white/90 text-sm font-light">{category.desc}</p>
              </div>
              
              {/* Default Label (Fades out softly on hover) */}
              <div className="absolute bottom-8 left-8 transition-all duration-700 ease-out group-hover:opacity-0 group-hover:-translate-y-4">
                <h2 className="text-white font-medium text-2xl tracking-wide drop-shadow-xl">{category.name}</h2>
              </div>
            </Link>
          ))}
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
