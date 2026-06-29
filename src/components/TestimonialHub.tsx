"use client";

import { useEffect, useRef } from "react";
import { animateWateryReveal } from "@/utils/animations";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Aarav Menon",
    role: "Interior Designer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80",
    text: "The quality of Krishna Furniture is unmatched. Their pieces perfectly blend modern aesthetics with timeless comfort. Highly recommended for any premium space.",
    rating: 5
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Homeowner",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    text: "I transformed my living room with their collection. The attention to detail and the luxurious feel of the fabrics is beyond what I expected.",
    rating: 5
  },
  {
    id: 3,
    name: "Rohan Kapoor",
    role: "Architect",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80",
    text: "As an architect, I appreciate well-crafted furniture. Krishna Furniture delivers exactly that—stunning designs with robust build quality.",
    rating: 5
  }
];

export default function TestimonialHub() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".testimonial-card");
      animateWateryReveal(containerRef.current, Array.from(elements));
    }
  }, []);

  return (
    <section id="testimonials" ref={containerRef} className="py-24 bg-[#f9f8f6]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16 testimonial-card">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4">What Our Customers Say</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Real stories from people who have transformed their spaces with our furniture.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="testimonial-card bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-500 border border-neutral-100 flex flex-col h-full">
              <div className="flex gap-1 mb-6 text-yellow-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed mb-8 italic flex-grow">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image src={t.image} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">{t.name}</h4>
                  <p className="text-sm text-neutral-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
