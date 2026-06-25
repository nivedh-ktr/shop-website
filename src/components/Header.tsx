"use client";

import Link from "next/link";
import Image from "next/image";
import { User, ShoppingBag, Heart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/utils/cn";
import { useAppContext } from "@/context/AppContext";
import gsap from "gsap";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, wishlist, setAuthOpen, setCartOpen, setWishlistOpen } = useAppContext();
  const cartBadgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (cartCount > 0 && cartBadgeRef.current) {
      gsap.fromTo(
        cartBadgeRef.current,
        { scale: 0.5 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }
      );
    }
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 py-4 shadow-sm" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/#hero" className="font-serif text-2xl md:text-3xl tracking-wide font-medium text-left text-neutral-900">
          KRISHNA FURNITURE
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <Link href="/#hero" className="hover:text-neutral-500 transition-colors">Home</Link>
          <Link href="/#products" className="hover:text-neutral-500 transition-colors">Shop</Link>
          <Link href="/#categories" className="hover:text-neutral-500 transition-colors">Categories</Link>
          <Link href="/#testimonials" className="hover:text-neutral-500 transition-colors">Testimonials</Link>
          <Link href="/#footer" className="hover:text-neutral-500 transition-colors">Contact Us</Link>
        </nav>
        <div className="flex items-center gap-5">
          <button onClick={() => setAuthOpen(true)} className="hover:text-neutral-500 transition-colors" aria-label="Profile">
            <User className="w-5 h-5" />
          </button>
          <button onClick={() => setWishlistOpen(true)} className="hover:text-neutral-500 transition-colors relative" aria-label="Wishlist">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {wishlist.length}
              </span>
            )}
          </button>
          <button onClick={() => setCartOpen(true)} className="hover:text-neutral-500 transition-colors relative" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" />
            <span ref={cartBadgeRef} className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
