"use client";

import { useEffect, useRef } from "react";
import { animateHeroReveal } from "@/utils/animations";
import Link from "next/link";
import gsap from "gsap";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll(".hero-animate");
      animateHeroReveal(Array.from(elements));
    }

    if (bgRef.current && heroRef.current) {
      // Gentle entry zoom
      gsap.fromTo(bgRef.current,
        { scale: 1.15, opacity: 0 },
        { scale: 1.05, opacity: 1, duration: 2.5, ease: "power2.out" }
      );

      // Scroll parallax
      const bgAnim = gsap.fromTo(bgRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          }
        }
      );

      return () => {
        bgAnim.scrollTrigger?.kill();
        bgAnim.kill();
      };
    }
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#e9e8e4]"
    >
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center origin-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80')`,
        }}
      >
        {/* Soft, premium overlay to preserve high-contrast dark typography */}
        <div className="absolute inset-0 bg-[#e9e8e4]/65 backdrop-blur-[1px]"></div>
      </div>
      
      <div className="container relative z-10 px-6 md:px-12 flex flex-col items-center text-center mt-20">
        <h1 className="hero-animate font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] mb-6 max-w-5xl text-balance">
          Redefine Your Space with Timeless Elegance
        </h1>
        <p className="hero-animate text-lg md:text-xl text-neutral-800 mb-10 max-w-2xl text-balance font-medium">
          Discover high-end, meticulously crafted furniture pieces designed to elevate your living environment.
        </p>
        <div className="hero-animate flex flex-col sm:flex-row items-center gap-4">
          <a 
            href="#products" 
            className="px-8 py-4 bg-neutral-900 text-white rounded-full font-medium tracking-wide hover:bg-neutral-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            Shop Now
          </a>
          <a 
            href="#categories" 
            className="px-8 py-4 bg-white/60 backdrop-blur-md border border-white/20 text-neutral-900 rounded-full font-medium tracking-wide hover:bg-white/80 transition-all"
          >
            Explore Collections
          </a>
        </div>
      </div>
    </section>
  );
}
