"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

export default function CartDrawer() {
  const router = useRouter();
  const { isCartOpen, setCartOpen } = useAppContext();
  const { items, updateQuantity, removeFromCart, subtotal } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCartOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: "power2.out", display: "block" });
      gsap.to(drawerRef.current, { x: "0%", duration: 0.6, ease: "power4.out" });
    } else {
      gsap.to(drawerRef.current, { x: "100%", duration: 0.5, ease: "power4.inOut" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: "power2.inOut", display: "none" });
    }
  }, [isCartOpen]);

  const closeDrawer = () => setCartOpen(false);

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] hidden opacity-0"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-white z-[70] shadow-2xl flex flex-col transform translate-x-full"
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="font-serif text-2xl">Your Shopping Cart</h2>
          <button onClick={closeDrawer} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => {
              const effectivePrice = item.discount_price && item.discount_price > 0 ? item.discount_price : item.price;
              
              return (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                        <span className="text-[10px] text-neutral-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 truncate">{item.title}</h3>
                    <p className="text-sm text-neutral-500">{formatPrice(effectivePrice)}</p>
                    
                    {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
                      <div className="text-[11px] text-neutral-400 mt-1 space-y-0.5">
                        {Object.entries(item.selectedSpecs).map(([key, value]) => (
                          <div key={key}><span className="capitalize">{key.replace('_', ' ')}</span>: {value}</div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-neutral-200 rounded-full bg-neutral-50">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-serif text-xl font-medium">
                {formatPrice(subtotal())}
              </span>
            </div>
            <button 
              onClick={() => { closeDrawer(); router.push('/checkout'); }}
              className="w-full bg-neutral-900 text-white py-4 rounded-full font-medium tracking-wide hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
