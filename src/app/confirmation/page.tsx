"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { useAppContext } from "@/context/AppContext";
import { products } from "@/utils/products";

export default function ConfirmationPage() {
  const { checkoutData, cartItems } = useAppContext();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Snap scroll to top immediately upon load
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const ctx = gsap.context(() => {
      // Structural liquid cascade
      gsap.fromTo(
        ".confirm-animate",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out" }
      );

      // SVG Circle bloom
      gsap.fromTo(
        ".checkmark-circle",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, delay: 0.3, ease: "back.out(1.5)" }
      );

      // SVG Path self-draw
      gsap.fromTo(
        ".checkmark-path",
        { strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: 0.8, delay: 0.7, ease: "power2.out" }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleWhatsAppHandoff = () => {
    if (!checkoutData) {
      alert("Session expired or order data missing. Please return to your cart.");
      return;
    }

    const populatedCart = cartItems.map(item => ({
      ...item,
      product: products.find(p => p.id === item.id)
    })).filter(item => item.product !== undefined);

    let message = `*NEW ORDER REQUEST* | ${checkoutData.orderId}\n\n`;
    message += `*CUSTOMER DETAILS*\n`;
    message += `Name: ${checkoutData.firstName} ${checkoutData.lastName}\n`;
    message += `Email: ${checkoutData.email}\n`;
    message += `Phone: ${checkoutData.phone}\n`;
    message += `Address: ${checkoutData.street}, ${checkoutData.city}, ${checkoutData.province}, ${checkoutData.zip}, ${checkoutData.country}\n`;
    if (checkoutData.company) message += `Company: ${checkoutData.company}\n`;
    if (checkoutData.notes) message += `Notes: ${checkoutData.notes}\n`;
    
    message += `\n*ORDER ITEMS*\n`;
    populatedCart.forEach((item, index) => {
      const itemFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.product!.priceValue * item.quantity);
      message += `${index + 1}. ${item.product?.name} (x${item.quantity}) - ${itemFormatted}\n`;
    });

    message += `\n*TOTAL DUE*: ${checkoutData.subtotal}\n`;
    message += `\nPlease confirm availability and payment options.`;

    const businessPhone = "1234567890";
    const waUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(waUrl, "_blank");
  };

  return (
    <main ref={pageRef} className="min-h-screen pt-24 bg-white overflow-hidden flex flex-col">
      <Header />
      
      {/* Progress Tracker */}
      <div className="bg-[#F9F1E7] pt-12 pb-16 confirm-animate border-b border-neutral-200">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-serif text-5xl mb-10 text-neutral-900 tracking-wide text-center">Order Confirmed</h1>
            <div className="flex items-center justify-center gap-3 text-xs md:text-sm font-medium tracking-widest uppercase text-neutral-400 w-full max-w-2xl mx-auto">
              <Link href="/cart" className="text-green-600 flex items-center gap-2 shrink-0 hover:text-green-700 transition-colors">
                <span className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.5)]"></span>
                CART
              </Link>
              <span className="flex-grow border-t border-solid border-green-600"></span>
              <span className="text-green-600 flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.5)]"></span>
                CHECKOUT
              </span>
              <span className="flex-grow border-t border-solid border-green-600"></span>
              <span className="text-green-600 flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.5)]"></span>
                CONFIRMATION
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-20 flex-grow flex flex-col items-center justify-center">
        
        {/* Animated Checkmark UI */}
        <div className="relative w-32 h-32 mb-8 confirm-animate">
          <svg className="w-full h-full text-green-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="checkmark-circle" cx="50" cy="50" r="45" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="4" />
            <path className="checkmark-path" d="M30 50L45 65L70 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" strokeDashoffset="100" />
          </svg>
        </div>

        <h2 className="text-4xl font-serif text-neutral-900 mb-4 text-center confirm-animate">Order Placed Successfully!</h2>
        
        {checkoutData ? (
          <div className="flex items-center gap-3 bg-[#F9F1E7] px-6 py-3 rounded-full mb-12 confirm-animate">
            <span className="text-neutral-500 text-sm">Order ID:</span>
            <span className="font-semibold tracking-wide">{checkoutData.orderId}</span>
          </div>
        ) : (
          <div className="mb-12 confirm-animate text-neutral-500">Processing order details...</div>
        )}

        <div className="max-w-xl w-full bg-white border border-neutral-200 p-8 md:p-12 rounded-3xl shadow-xl confirm-animate flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h3 className="text-2xl font-serif text-neutral-900 mb-4">Final Step: Secure Payment</h3>
          <p className="text-neutral-500 leading-relaxed mb-8">
            Your items have been reserved. To complete the transaction and finalize shipping, please forward your order securely to our WhatsApp coordination team.
          </p>
          
          <button 
            onClick={handleWhatsAppHandoff}
            className="w-full relative py-5 bg-green-600 text-white rounded-2xl font-medium tracking-wide transition-all shadow-lg hover:shadow-green-500/30 hover:bg-green-700 transform hover:-translate-y-1 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
              Send Details to WhatsApp
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            {/* Soft pulsing background layer */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-green-400 opacity-20 animate-pulse"></div>
          </button>
        </div>

        <div className="mt-16 confirm-animate">
          <Link href="/" className="text-neutral-500 hover:text-neutral-900 font-medium tracking-wide transition-colors border-b border-transparent hover:border-neutral-900 pb-1">
            Return to Homepage
          </Link>
        </div>
      </div>

      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
      
      <Footer />
    </main>
  );
}
