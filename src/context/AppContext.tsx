"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";


export interface CheckoutData {
  firstName: string;
  lastName: string;
  company: string;
  country: string;
  street: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
  email: string;
  notes: string;
  orderId?: string;
  subtotal?: string;
}

interface AppContextType {

  wishlist: (string | number)[];
  toggleWishlist: (productId: string | number) => void;
  
  isAuthOpen: boolean;
  setAuthOpen: (isOpen: boolean) => void;
  
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  
  isWishlistOpen: boolean;
  setWishlistOpen: (isOpen: boolean) => void;

  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  checkoutData: CheckoutData | null;
  setCheckoutData: (data: CheckoutData | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<(string | number)[]>([]);
  
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isWishlistOpen, setWishlistOpen] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  // ── Supabase Auth State Listener ──
  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);


  const toggleWishlist = (productId: string | number) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        toast("Removed from wishlist");
        return prev.filter(id => id !== productId);
      } else {
        toast.success("Added to wishlist", {
          icon: '🤍',
        });
        return [...prev, productId];
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isAuthOpen,
        setAuthOpen,
        isCartOpen,
        setCartOpen,
        isWishlistOpen,
        setWishlistOpen,
        isLoggedIn,
        setIsLoggedIn,
        checkoutData,
        setCheckoutData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
