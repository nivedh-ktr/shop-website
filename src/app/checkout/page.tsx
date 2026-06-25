"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { useAppContext } from "@/context/AppContext";
import { products } from "@/utils/products";

export default function CheckoutPage() {
  const { cartItems, setCheckoutData } = useAppContext();
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    country: "India",
    street: "",
    city: "",
    province: "Kerala",
    zip: "",
    phone: "",
    email: "",
    notes: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".checkout-animate",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out" }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const populatedCart = cartItems.map(item => ({
    ...item,
    product: products.find(p => p.id === item.id)
  })).filter(item => item.product !== undefined);

  const subtotal = populatedCart.reduce((sum, item) => sum + (item.product!.priceValue * item.quantity), 0);
  const formattedSubtotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(subtotal);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (populatedCart.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
    }
    
    // Generate Random Tracking ID
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `#KF-2026-${randomId}`;

    // Save Data to Context
    setCheckoutData({
      ...formData,
      orderId: trackingId,
      subtotal: formattedSubtotal
    });

    // Execute Exit Animation before routing
    if (pageRef.current) {
      const elements = pageRef.current.querySelectorAll(".checkout-animate");
      gsap.to(elements, {
        y: 15,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        stagger: 0.05,
        onComplete: () => {
          router.push("/confirmation");
        }
      });
    } else {
      router.push("/confirmation");
    }
  };

  return (
    <main ref={pageRef} className="min-h-screen pt-24 bg-white overflow-hidden flex flex-col">
      <Header />
      
      {/* Progress Tracker */}
      <div className="bg-[#F9F1E7] pt-12 pb-16 checkout-animate border-b border-neutral-200">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-serif text-5xl mb-10 text-neutral-900 tracking-wide">Checkout</h1>
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
              <span className="flex-grow border-t border-dashed border-neutral-300"></span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full border-2 border-neutral-400"></span>
                CONFIRMATION
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-16 flex-grow">
        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left: Billing Details */}
          <div className="w-full lg:w-[55%] checkout-animate">
            <h2 className="text-3xl font-serif text-neutral-900 mb-10">Billing details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-neutral-900 mb-3">First Name</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent shadow-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-neutral-900 mb-3">Last Name</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent shadow-sm" />
              </div>
            </div>

            <div className="flex flex-col mb-8">
              <label className="text-sm font-medium text-neutral-900 mb-3">Company Name (Optional)</label>
              <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent shadow-sm" />
            </div>

            <div className="flex flex-col mb-8">
              <label className="text-sm font-medium text-neutral-900 mb-3">Country / Region</label>
              <select name="country" value={formData.country} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent appearance-none shadow-sm cursor-pointer">
                <option value="India">India</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="UAE">UAE</option>
              </select>
            </div>

            <div className="flex flex-col mb-8">
              <label className="text-sm font-medium text-neutral-900 mb-3">Street address</label>
              <input required type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent shadow-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-neutral-900 mb-3">Town / City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent shadow-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-neutral-900 mb-3">PIN Code</label>
                <input required type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent shadow-sm" />
              </div>
            </div>

            <div className="flex flex-col mb-8">
              <label className="text-sm font-medium text-neutral-900 mb-3">Province</label>
              <select name="province" value={formData.province} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent appearance-none shadow-sm cursor-pointer">
                <option value="Kerala">Kerala</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-neutral-900 mb-3">Phone</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent shadow-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-neutral-900 mb-3">Email address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent shadow-sm" />
              </div>
            </div>

            <div className="flex flex-col mb-8">
              <label className="text-sm font-medium text-neutral-900 mb-3">Delivery Notes (Optional)</label>
              <textarea name="notes" placeholder="Notes about your order, e.g. special notes for delivery." value={formData.notes} onChange={handleInputChange} className="w-full border border-neutral-300 rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all bg-transparent min-h-[120px] shadow-sm resize-y" />
            </div>
          </div>

          {/* Right: Order Ledger */}
          <div className="w-full lg:w-[45%] checkout-animate">
            <div className="p-8 md:p-10 border border-neutral-200 rounded-2xl bg-white shadow-sm sticky top-32">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-neutral-200">
                <h3 className="font-medium text-xl text-neutral-900">Product</h3>
                <h3 className="font-medium text-xl text-neutral-900">Subtotal</h3>
              </div>
              
              <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-neutral-200">
                {populatedCart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm md:text-base">
                    <div className="text-neutral-500">
                      {item.product!.name} <span className="text-neutral-900 ml-2 font-medium">x {item.quantity}</span>
                    </div>
                    <span className="font-light text-neutral-900">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.product!.priceValue * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-6 text-base border-t border-neutral-200 pt-6 mt-2">
                <span className="font-medium text-neutral-900">Subtotal</span>
                <span className="font-light text-neutral-900">{formattedSubtotal}</span>
              </div>

              {/* Shipping Transparency */}
              <div className="w-full flex justify-between items-center mb-4 text-sm text-neutral-700 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <span className="font-medium">Shipping Charge</span>
                <span className="text-right italic text-neutral-500">Calculated via<br/>WhatsApp Enquiry</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6 text-justify">
                Shipping costs will be calculated and confirmed via WhatsApp.
              </p>
              
              <div className="flex justify-between items-center mb-10 pb-8 border-b border-neutral-200 pt-6 border-t">
                <span className="font-medium text-neutral-900">Total</span>
                <span className="text-2xl font-semibold text-[#B88E2F]">{formattedSubtotal}</span>
              </div>
              
              <div className="flex flex-col gap-6 mb-10 bg-[#F9F1E7]/50 p-6 rounded-xl border border-[#F9F1E7]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-600 shrink-0 shadow-[0_0_8px_rgba(22,163,74,0.5)]"></div>
                    <span className="font-medium text-neutral-900">WhatsApp Coordination</span>
                  </div>
                  <p className="text-sm text-neutral-500 leading-relaxed text-justify ml-7">
                    Payment to be completed via WhatsApp coordination. By confirming your order, you will be redirected to verify details with our team.
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-neutral-400 leading-relaxed text-center mb-8">
                Your personal data will be used to support your experience, manage access to your account, and for other purposes described in our privacy policy.
              </p>
              
              <button type="submit" className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-medium tracking-wide hover:bg-neutral-800 transition-colors text-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
                Confirm Order
              </button>
            </div>
          </div>
          
        </form>
      </div>

      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
      
      <Footer />
    </main>
  );
}
