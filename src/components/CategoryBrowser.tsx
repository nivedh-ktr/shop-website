"use client";

import { useEffect, useRef } from "react";
import { animateWateryReveal } from "@/utils/animations";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "Living Room", image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80" },
  { name: "Dining", image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80" },
  { name: "Bedroom", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80" },
  { name: "Office", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80" },
];

export default function CategoryBrowser() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".category-card");
      animateWateryReveal(containerRef.current, Array.from(elements));
    }
  }, []);

  return (
    <section id="categories" ref={containerRef} className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12 category-card">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">Browse the Range</h2>
          <Link href="/categories" className="text-sm font-medium uppercase tracking-widest hover:text-neutral-500 transition-colors">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              href={`/category/${category.name.toLowerCase().replace(' ', '-')}`} 
              key={category.name}
              className="category-card group block relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100"
            >
              <Image 
                src={category.image} 
                alt={category.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 transition-opacity duration-500 group-hover:opacity-80"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-white font-medium text-xl tracking-wide">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
