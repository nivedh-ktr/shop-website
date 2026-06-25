"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/utils/cn";

interface MagneticIconProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function MagneticIcon({ href, children, className }: MagneticIconProps) {
  const containerRef = useRef<HTMLAnchorElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const icon = iconRef.current;
    const bg = bgRef.current;
    if (!container || !icon || !bg) return;

    // Use GSAP quickTo for ultra-smooth 60fps tracking without timeline overhead
    const xTo = gsap.quickTo(icon, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(icon, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    // Organic bubbling background tween
    const bgTween = gsap.to(bg, {
      borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      paused: true
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = container.getBoundingClientRect();
      
      // Calculate cursor position relative to center of component
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      // Apply magnetic pull (strength factor 0.4)
      xTo(x * 0.4);
      yTo(y * 0.4);
    };

    const handleMouseEnter = () => {
      gsap.to(bg, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
      bgTween.play();
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      gsap.to(bg, { scale: 0, opacity: 0, duration: 0.4, ease: "power2.out" });
      bgTween.pause();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      bgTween.kill();
    };
  }, []);

  return (
    <a
      ref={containerRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer group",
        className
      )}
    >
      <div 
        ref={bgRef} 
        className="absolute inset-0 bg-[#F9F1E7] rounded-[50%] scale-0 opacity-0"
      ></div>
      <div ref={iconRef} className="relative z-10 text-neutral-400 group-hover:text-[#B88E2F] transition-colors pointer-events-none">
        {children}
      </div>
    </a>
  );
}
