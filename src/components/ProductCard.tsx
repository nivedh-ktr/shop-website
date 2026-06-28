"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/utils/cn";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  category: string;
}

export default function ProductCard({ id, title, price, discount_price, image_url, category }: ProductCardProps) {
  const { addToCart, wishlist, toggleWishlist } = useAppContext();
  
  const formatPrice = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="product-card group flex flex-col bg-white rounded-2xl overflow-hidden relative border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <Link href={`/shop/${id}`} className="relative aspect-[4/5] overflow-hidden bg-neutral-100 block">
        {image_url ? (
          <Image 
            src={image_url} 
            alt={title} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300">
            No Image
          </div>
        )}
      </Link>
      
      {/* Hover Overlay Actions */}
      <div className="absolute top-0 left-0 w-full aspect-[4/5] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
        <button 
          onClick={(e) => { e.preventDefault(); addToCart(id); }}
          className="bg-white text-neutral-900 px-8 py-3 rounded-full font-medium tracking-wide hover:bg-neutral-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-auto shadow-lg"
        >
          Add to cart
        </button>
      </div>
      
      <button 
        onClick={(e) => { e.preventDefault(); toggleWishlist(id); }}
        className={cn(
          "absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-10 shadow-sm hover:scale-110",
          wishlist.includes(id) ? "text-red-500" : "text-neutral-400 hover:text-red-500"
        )}
      >
        <Heart className="w-5 h-5" fill={wishlist.includes(id) ? "currentColor" : "none"} />
      </button>

      <div className="p-6 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{category}</span>
        <Link href={`/shop/${id}`}>
          <h3 className="font-medium text-lg tracking-tight text-neutral-900 mb-1 hover:text-neutral-600 transition-colors line-clamp-1">{title}</h3>
        </Link>
        <div className="mt-auto flex items-center gap-3 pt-4">
          {discount_price ? (
            <>
              <span className="font-bold text-lg text-neutral-900">{formatPrice(discount_price)}</span>
              <span className="text-sm font-medium text-neutral-400 line-through">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="font-bold text-lg text-neutral-900">{formatPrice(price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
