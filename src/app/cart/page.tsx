"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import gsap from "gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { useAppContext } from "@/context/AppContext";
import { useCartStore } from "@/store/cartStore";
import { products } from "@/utils/products";

export default function CartPage() {
  const { isLoggedIn, setAuthOpen } = useAppContext();
  const { items: cartItems, removeFromCart, updateQuantity: updateCartQuantity, subtotal } = useCartStore();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cart-animate",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out" }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const formattedSubtotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(subtotal());

  return (
    <main ref={pageRef} className="min-h-screen pt-24 bg-white overflow-hidden flex flex-col">
      <Header />
      
      {/* Progress Tracker */}
      <div className="bg-[#F9F1E7] pt-12 pb-16 cart-animate border-b border-neutral-200">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-serif text-5xl mb-10 text-neutral-900 tracking-wide">Cart</h1>
            <div className="flex items-center justify-center gap-3 text-xs md:text-sm font-medium tracking-widest uppercase text-neutral-400 w-full max-w-2xl mx-auto">
              <span className="text-green-600 flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.5)]"></span>
                CART
              </span>
              <span className="flex-grow border-t border-dashed border-neutral-300"></span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full border-2 border-neutral-400"></span>
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
        {cartItems.length === 0 ? (
          <div className="text-center py-20 cart-animate">
            <h2 className="text-3xl font-serif text-neutral-900 mb-6">Your cart is empty</h2>
            <Link href="/collections" className="inline-block px-10 py-4 bg-neutral-900 text-white rounded-full font-medium tracking-wide hover:bg-neutral-800 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-12 items-start">
            
            {/* Left: Cart Items Table */}
            <div className="w-full xl:w-[65%] cart-animate">
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 bg-[#F9F1E7] p-4 rounded-t-xl text-neutral-900 font-medium">
                <div className="col-span-2"></div>
                <div className="col-span-3">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Subtotal</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Items List */}
              <div className="flex flex-col gap-6 md:gap-0">
                {cartItems.map((item, idx) => {
                  const effectivePrice = item.discount_price && item.discount_price > 0 ? item.discount_price : item.price;
                  const itemSubtotal = effectivePrice * item.quantity;
                  const formattedItemSubtotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(itemSubtotal);
                  
                  return (
                    <div key={`${item.id}-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white md:p-6 border-b border-neutral-200 pb-6 md:pb-0 pt-6 md:pt-0">
                      
                      {/* Mobile Title */}
                      <div className="md:hidden font-medium text-lg mb-2">{item.title}</div>
                      
                      {/* Image */}
                      <Link href={`/shop/${item.id}`} className="md:col-span-2 flex items-center justify-center bg-[#F9F1E7] rounded-xl overflow-hidden aspect-square relative group">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">No Image</div>
                        )}
                      </Link>
                      
                      {/* Name */}
                      <div className="hidden md:block col-span-3 font-medium text-neutral-500">
                        <Link href={`/shop/${item.id}`} className="hover:text-neutral-900 transition-colors">
                          {item.title}
                        </Link>
                        {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
                          <div className="text-xs text-neutral-400 mt-1 space-y-0.5">
                            {Object.entries(item.selectedSpecs).map(([key, value]) => (
                              <div key={key}><span className="capitalize">{key.replace('_', ' ')}</span>: {value as string}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="md:col-span-2 text-neutral-500 md:text-center">
                        <span className="md:hidden font-medium mr-2">Price:</span>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(effectivePrice)}
                      </div>
                      
                      {/* Quantity */}
                      <div className="md:col-span-2 flex md:justify-center">
                        <div className="flex items-center border border-neutral-300 rounded-lg w-fit">
                          <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black">-</button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-black">+</button>
                        </div>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="md:col-span-2 font-medium text-neutral-900 md:text-center">
                        <span className="md:hidden mr-2">Subtotal:</span>
                        {formattedItemSubtotal}
                      </div>
                      
                      {/* Remove Action */}
                      <div className="md:col-span-1 flex justify-end md:justify-center">
                        <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-neutral-200 text-center md:text-left">
                <a href="tel:+911234567890" className="flex flex-col md:flex-row items-center gap-4 group cursor-pointer transition-transform hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#F9F1E7] group-hover:bg-[#B88E2F] transition-colors duration-300 flex items-center justify-center shrink-0 mx-auto md:mx-0">
                    <span className="text-xl group-hover:scale-110 transition-transform">📞</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 group-hover:text-[#B88E2F] transition-colors">Have Questions?</h4>
                    <p className="text-sm text-neutral-500">Our experts are here to help! Call us free.</p>
                  </div>
                </a>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F9F1E7] flex items-center justify-center shrink-0 mx-auto md:mx-0">
                    <span className="text-xl">🔒</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">Secure Shopping</h4>
                    <p className="text-sm text-neutral-500">Protected encryption</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F9F1E7] flex items-center justify-center shrink-0 mx-auto md:mx-0">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">Privacy First</h4>
                    <p className="text-sm text-neutral-500">Your info is safe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Cart Totals & Forms */}
            <div className="w-full xl:w-[35%] bg-[#F9F1E7] p-8 md:p-10 rounded-2xl cart-animate flex flex-col shadow-sm">
              <h2 className="text-2xl font-serif text-neutral-900 mb-8 border-b border-neutral-200 pb-4">Order Summary</h2>
              
              {/* Order Note */}
              <div className="mb-6">
                <label className="text-sm font-medium text-neutral-900 mb-2 block">Add Order Note (Optional)</label>
                <textarea className="w-full bg-white border border-neutral-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all min-h-[100px] resize-y shadow-sm" placeholder="Any special delivery instructions?"></textarea>
              </div>

              {/* Promo Code */}
              <div className="mb-8">
                <label className="text-sm font-medium text-neutral-900 mb-2 block">Promo Code</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B88E2F]/50 transition-all shadow-sm" placeholder="Enter code" />
                  <button className="bg-neutral-900 text-white px-6 rounded-xl font-medium text-sm hover:bg-neutral-800 transition-colors shadow-sm">Apply</button>
                </div>
              </div>

              <div className="w-full flex justify-between items-center mb-6 text-base border-t border-neutral-200 pt-6">
                <span className="font-medium text-neutral-900">Subtotal</span>
                <span className="text-neutral-500">{formattedSubtotal}</span>
              </div>
              
              {/* Shipping Transparency */}
              <div className="w-full flex justify-between items-center mb-4 text-sm text-neutral-700 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                <span className="font-medium">Shipping Charge</span>
                <span className="text-right italic text-neutral-500">Calculated via<br/>WhatsApp Enquiry</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6 text-justify">
                Shipping costs will be calculated and confirmed via WhatsApp.
              </p>
              
              <div className="w-full flex justify-between items-center mb-8 text-base border-t border-neutral-200 pt-6">
                <span className="font-medium text-neutral-900">Total</span>
                <span className="text-2xl font-medium text-[#B88E2F]">{formattedSubtotal}</span>
              </div>
              
              <Link 
                href="/checkout" 
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    setAuthOpen(true);
                  }
                }}
                className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-medium tracking-wide hover:bg-neutral-800 transition-colors text-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
              >
                Proceed to Checkout
              </Link>
            </div>
            
          </div>
        )}
      </div>

      {/* Cross-Sell Carousel */}
      {cartItems.length > 0 && (
        <div className="bg-[#F9F1E7] py-20 cart-animate border-t border-neutral-200 mt-auto">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-serif text-neutral-900 mb-10 text-center">You may also like...</h2>
            <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 pt-4">
              {products.slice(0, 5).map((rp) => (
                <div key={rp.id} className="min-w-[280px] md:min-w-[300px] flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <Link href={`/shop/${rp.id}`} className="relative aspect-[4/5] overflow-hidden bg-neutral-100 block">
                    <Image src={rp.image} alt={rp.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>
                  <div className="p-6">
                    <Link href={`/shop/${rp.id}`}><h3 className="font-medium text-lg text-neutral-900 mb-1 hover:text-[#B88E2F] transition-colors truncate">{rp.name}</h3></Link>
                    <p className="text-neutral-500 text-sm mb-4 truncate">{rp.category || "Furniture"}</p>
                    <span className="font-semibold text-[#B88E2F]">{rp.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
      
      <Footer />
    </main>
  );
}
