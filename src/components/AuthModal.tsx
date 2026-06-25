"use client";

import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { X } from "lucide-react";
import gsap from "gsap";

export default function AuthModal() {
  const { isAuthOpen, setAuthOpen, setIsLoggedIn } = useAppContext();
  const [isSignIn, setIsSignIn] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
      
      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        display: "flex",
      }).fromTo(
        contentRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" },
        "-=0.2"
      );
    } else {
      document.body.style.overflow = ""; // Restore scrolling
      
      const tl = gsap.timeline({
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.display = "none";
          }
        },
      });
      
      tl.to(contentRef.current, {
        y: 20,
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
      }).to(
        overlayRef.current,
        { opacity: 0, duration: 0.3, ease: "power2.in" },
        "-=0.1"
      );
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthOpen) {
        setAuthOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthOpen, setAuthOpen]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md opacity-0"
      style={{ display: "none" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) setAuthOpen(false);
      }}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden opacity-0 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setAuthOpen(false)}
          className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl mb-2">
            {isSignIn ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-neutral-500 text-sm">
            {isSignIn
              ? "Sign in to access your wishlist and orders."
              : "Join us for an exclusive premium experience."}
          </p>
        </div>

        <button 
          type="button"
          onClick={() => {
            // Mock OAuth Handler
            setIsLoggedIn(true);
            setAuthOpen(false);
          }}
          className="w-full border border-neutral-300 rounded-full py-3 flex items-center justify-center gap-3 font-medium tracking-wide hover:bg-neutral-50 transition-colors mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-neutral-400">or continue with email</span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={(e) => {
          e.preventDefault();
          setIsLoggedIn(true);
          setAuthOpen(false);
        }}>
          {!isSignIn && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900 transition-colors bg-transparent"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900 transition-colors bg-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900 transition-colors bg-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-neutral-900 text-white rounded-full py-4 font-medium tracking-wide hover:bg-neutral-800 transition-colors mt-8"
          >
            {isSignIn ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="font-medium text-neutral-900 hover:underline"
          >
            {isSignIn ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
