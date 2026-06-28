"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

export interface CartItem {
  id: string | number;
  quantity: number;
}

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
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (productId?: string | number) => void;
  incrementCart: (productId?: string | number) => void; // for backwards compatibility
  removeFromCart: (productId: string | number) => void;
  updateCartQuantity: (productId: string | number, quantity: number) => void;
  
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (productId?: string | number) => {
    // Default to a specific product for demo purposes if none provided
    const id = productId ?? 1;
    
    setCartItems(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id, quantity: 1 }];
    });
    
    toast.success("Added to cart");
  };

  const incrementCart = addToCart;

  const removeFromCart = (productId: string | number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

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
        cartItems,
        cartCount,
        addToCart,
        incrementCart: addToCart,
        removeFromCart,
        updateCartQuantity,
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
