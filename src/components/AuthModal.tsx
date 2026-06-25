"use client";

import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/utils/supabase";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";

type ViewState = "signin" | "signup" | "forgot_password";

export default function AuthModal() {
  const { isAuthOpen, setAuthOpen, setIsLoggedIn } = useAppContext();
  const [view, setView] = useState<ViewState>("signin");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // ── Modal Open / Close GSAP Animations ──
  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = "hidden";

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
      document.body.style.overflow = "";

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

  // ── Escape Key Handler ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthOpen) {
        setAuthOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthOpen, setAuthOpen]);

  // ── GSAP Cross-Fade View Transition ──
  const transitionTo = (nextView: ViewState) => {
    if (!formRef.current) return;
    gsap.to(formRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setView(nextView);
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
        );
      },
    });
  };

  // ── Google OAuth Handler ──
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error("Google sign-in failed. Please try again.");
        setIsGoogleLoading(false);
      }
      // Browser will redirect — no need to setIsGoogleLoading(false) on success
    } catch {
      toast.error("An unexpected error occurred.");
      setIsGoogleLoading(false);
    }
  };

  // ── Email/Password Sign In Handler ──
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Signed in successfully!");
        setIsLoggedIn(true);
        setAuthOpen(false);
      }
    } catch {
      toast.error("Sign in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Email/Password Sign Up Handler ──
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Check your email to verify.");
        transitionTo("signin");
      }
    } catch {
      toast.error("Sign up failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot Password Handler ──
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("❌ Failed to send recovery link. Please verify your email format.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) {
        toast.error("❌ Failed to send recovery link. Please verify your email format.");
      } else {
        toast.success("✓ Recovery email sent! Please check your inbox.");
      }
    } catch {
      toast.error("❌ Failed to send recovery link. Please verify your email format.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Header Text Logic ──
  const headerTitle =
    view === "forgot_password"
      ? "Reset Your Password"
      : view === "signin"
        ? "Welcome Back"
        : "Create Account";

  const headerSubtext =
    view === "forgot_password"
      ? "Enter your email address and we'll send you a secure link to reset your password."
      : view === "signin"
        ? "Sign in to access your wishlist and orders."
        : "Join us for an exclusive premium experience.";

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

        {/* ── Animated Content Block ── */}
        <div ref={formRef}>
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl mb-2">{headerTitle}</h2>
            <p className="text-neutral-500 text-sm">{headerSubtext}</p>
          </div>

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === "forgot_password" ? (
            <>
              <form className="space-y-5" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900 transition-colors bg-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 text-white rounded-full py-4 font-medium tracking-wide hover:bg-neutral-800 transition-colors mt-8 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-neutral-500">
                <button
                  onClick={() => transitionTo("signin")}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          ) : (
            /* ── SIGN IN / SIGN UP VIEW ── */
            <>
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full border border-neutral-300 rounded-full py-3 flex items-center justify-center gap-3 font-medium tracking-wide hover:bg-neutral-50 transition-colors mb-6 disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-neutral-400">or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form
                className="space-y-5"
                onSubmit={view === "signin" ? handleEmailSignIn : handleEmailSignUp}
              >
                {view === "signup" && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900 transition-colors bg-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-widest">
                      Password
                    </label>
                    {view === "signin" && (
                      <button
                        type="button"
                        onClick={() => transitionTo("forgot_password")}
                        className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors duration-200"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900 transition-colors bg-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 text-white rounded-full py-4 font-medium tracking-wide hover:bg-neutral-800 transition-colors mt-8 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting
                    ? "Please wait..."
                    : view === "signin"
                      ? "Sign In"
                      : "Create Account"}
                </button>
              </form>

              {/* Toggle Sign In / Sign Up */}
              <div className="mt-8 text-center text-sm text-neutral-500">
                {view === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => transitionTo(view === "signin" ? "signup" : "signin")}
                  className="font-medium text-neutral-900 hover:underline"
                >
                  {view === "signin" ? "Sign up" : "Sign in"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
