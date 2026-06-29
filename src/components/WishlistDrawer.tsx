"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { X, Trash2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { products } from "@/utils/products";
import Image from "next/image";

import { useCartStore } from "@/store/cartStore";

export default function WishlistDrawer() {
  const { isWishlistOpen, setWishlistOpen, wishlist, toggleWishlist } = useAppContext();
  const addToCart = useCartStore((state) => state.addToCart);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isWishlistOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: "power2.out", display: "block" });
      gsap.to(drawerRef.current, { x: "0%", duration: 0.6, ease: "power4.out" });
    } else {
      gsap.to(drawerRef.current, { x: "100%", duration: 0.5, ease: "power4.inOut" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: "power2.inOut", display: "none" });
    }
  }, [isWishlistOpen]);

  const closeDrawer = () => setWishlistOpen(false);

  const wishlistDetails = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  const handleMoveToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.name,
      price: parseInt(product.price.replace(/[^\d]/g, ''), 10), // This is a bit brittle, but handles the static mock product price string
      discount_price: product.oldPrice ? parseInt(product.oldPrice.replace(/[^\d]/g, ''), 10) : null,
      image_url: product.image,
      category: product.category || 'General'
    }, 1);
    toggleWishlist(product.id);
  };

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
          <h2 className="font-serif text-2xl">Your Wishlist</h2>
          <button onClick={closeDrawer} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {wishlistDetails.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <p>Your wishlist is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {wishlistDetails.map((product) => (
                <div key={product!.id} className="group flex flex-col bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100 p-3">
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white mb-3">
                    <Image src={product!.image} alt={product!.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-medium text-sm text-neutral-900 truncate">{product!.name}</h3>
                  <p className="text-xs text-neutral-500 mb-3">{product!.price}</p>
                  
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-200">
                    <button 
                      onClick={() => handleMoveToCart(product)}
                      className="text-sm font-medium hover:text-neutral-500 transition-colors"
                    >
                      Move to Cart
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product!.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
