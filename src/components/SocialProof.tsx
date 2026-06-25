"use client";

import { useEffect, useRef } from "react";
import { animateWateryReveal } from "@/utils/animations";
import Image from "next/image";

const gallery = [
  { id: 1, image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80", colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-1 md:row-span-2" },
  { id: 2, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { id: 3, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80", colSpan: "col-span-1", rowSpan: "row-span-1 md:row-span-2" },
  { id: 4, image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80", colSpan: "col-span-1", rowSpan: "row-span-1" },
  { id: 5, image: "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&q=80", colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-1" },
];

export default function SocialProof() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".gallery-item");
      animateWateryReveal(containerRef.current, Array.from(elements));
    }
  }, []);

  return (
    <section ref={containerRef} className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 gallery-item">
          <p className="text-neutral-500 font-medium tracking-widest uppercase mb-2 text-sm">Share your setup with</p>
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight">#KrishnaFurniture</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] gap-4">
          {gallery.map((item) => (
            <div 
              key={item.id} 
              className={`gallery-item relative overflow-hidden rounded-2xl group ${item.colSpan} ${item.rowSpan}`}
            >
              <Image 
                src={item.image} 
                alt="Customer setup" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
