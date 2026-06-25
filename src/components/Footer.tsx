"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticIcon from "./MagneticIcon";

gsap.registerPlugin(ScrollTrigger);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".footer-col",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 85%",
          },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} id="footer" className="bg-white pt-20 pb-12 border-t border-neutral-200">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Col 1: Logo & Address */}
          <div className="footer-col lg:col-span-1 flex flex-col gap-6">
            <Link href="/#hero" className="inline-block">
              <Image src="/logo.png" alt="KRISHNA FURNITURE" width={220} height={80} className="object-contain object-left" priority />
            </Link>
            <a 
              href="https://maps.google.com/maps?vet=10CAAQoqAOahcKEwiItqqV2KKVAxUAAAAAHQAAAAAQBQ..i&rlz=1C1GCEA_enIN1174IN1174&pvq=Cg0vZy8xMXRzMDB5YmtxIhcKEUtyaXNobmEgRnVybml0dXJlEAIYAw&lqi=ChFLcmlzaG5hIEZ1cm5pdHVyZUi21LqA4LmAgAhaGxAAEAEYABgBIhFrcmlzaG5hIGZ1cm5pdHVyZZIBFWZ1cm5pdHVyZV9hY2Nlc3Nvcmllcw&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&ftid=0x3ba7f18733913ad7:0x2a5bc17879e82326"
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-neutral-500 text-sm leading-relaxed max-w-[250px] group transition-colors duration-300 hover:text-[#B88E2F]"
            >
              F665+WQQ, Kodungallur - Shornur Rd, Chevoor, Thrissur, Kerala 680027
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#B88E2F] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          {/* Col 2: Category */}
          <div className="footer-col">
            <h4 className="font-semibold text-neutral-900 mb-6">Category</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li><Link href="/collections" className="hover:text-neutral-900 transition-colors">Living Room</Link></li>
              <li><Link href="/collections" className="hover:text-neutral-900 transition-colors">Bed Room</Link></li>
              <li><Link href="/collections" className="hover:text-neutral-900 transition-colors">Kitchen</Link></li>
              <li><Link href="/collections" className="hover:text-neutral-900 transition-colors">Bath Room</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Product */}
          <div className="footer-col">
            <h4 className="font-semibold text-neutral-900 mb-6">Popular Product</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li><Link href="/shop/1" className="hover:text-neutral-900 transition-colors">Single Sofa Black</Link></li>
              <li><Link href="/shop/2" className="hover:text-neutral-900 transition-colors">Wooden Bookcase</Link></li>
              <li><Link href="/shop/3" className="hover:text-neutral-900 transition-colors">Wooden Chair</Link></li>
              <li><Link href="/shop/7" className="hover:text-neutral-900 transition-colors">Luxury White Bed</Link></li>
            </ul>
          </div>

          {/* Col 4: Sitemap */}
          <div className="footer-col">
            <h4 className="font-semibold text-neutral-900 mb-6">Sitemap</h4>
            <ul className="space-y-4 text-sm text-neutral-500">
              <li><Link href="/#products" className="hover:text-neutral-900 transition-colors">Product</Link></li>
              <li><Link href="/services" className="hover:text-neutral-900 transition-colors">Services</Link></li>
              <li><Link href="/articles" className="hover:text-neutral-900 transition-colors">Article</Link></li>
              <li><Link href="/about" className="hover:text-neutral-900 transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Col 5: Follow Us & Newsletter */}
          <div className="footer-col">
            <h4 className="font-semibold text-neutral-900 mb-6">Follow Us</h4>
            <div className="flex flex-wrap gap-4 mb-8 -ml-3">
              <MagneticIcon href="https://www.facebook.com/share/1KWRQB4CCx/?mibextid=wwXIfr">
                <FacebookIcon className="w-5 h-5" />
              </MagneticIcon>
              <MagneticIcon href="https://www.instagram.com/krishnafurniture__?igsh=eDZhZ3UxZHluZ3B5">
                <InstagramIcon className="w-5 h-5" />
              </MagneticIcon>
              <MagneticIcon href="https://wa.me/1234567890">
                <MessageCircle className="w-5 h-5" />
              </MagneticIcon>
            </div>
            
            <form className="relative flex items-center border-b border-neutral-300 pb-2 group" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-transparent text-sm focus:outline-none text-neutral-900 placeholder:text-neutral-400"
              />
              <button 
                type="submit" 
                className="absolute right-0 text-neutral-400 group-hover:text-neutral-900 transition-all hover:scale-110"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4 footer-col">
          <p className="text-neutral-400 text-sm">
            © 2026 Krishna Furniture. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-neutral-400">
            <Link href="/terms" className="hover:text-neutral-900 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-neutral-900 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
