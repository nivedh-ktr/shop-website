"use client";

import { useEffect, useRef, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, Heart, Minus, Plus, Share2, Loader2, Info } from "lucide-react";
import gsap from "gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { products as staticProducts } from "@/utils/products";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

interface SupabaseProduct {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  category: string;
  image_url: string; // Legacy fallback
  images?: string[];
  description?: string;
  stock_quantity: number;
  sku: string | null;
  dimensions: string | null;
  primary_material: string | null;
  specifications: Record<string, string>;
  created_at: string;
}

export default function ProductDetailPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const productId = resolvedParams.id;
  const refSlug = resolvedSearchParams.ref as string | undefined;
  
  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const categoryDictionary: Record<string, string> = {
    "living-room": "Living Room Collection",
    "dining": "Dining Room Collection",
    "bedroom": "Bedroom Collection",
    "office": "Home Office Space",
  };

  const breadcrumbCategoryName = refSlug && categoryDictionary[refSlug] ? categoryDictionary[refSlug] : product?.category || "Shop";
  const breadcrumbCategoryLink = refSlug ? `/category/${refSlug}` : "/collections";

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  
  const { addToCart, toggleWishlist, wishlist } = useAppContext();
  const pageRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  // Fetch product from Supabase
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      
      // Try fetching from Supabase first
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
        
      if (!error && data) {
        setProduct(data as SupabaseProduct);
        
        // Fetch related products from Supabase
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4);
          
        if (relatedData) setRelatedProducts(relatedData);
      } else {
        // Fallback for static demo products (which have integer IDs)
        const staticId = parseInt(productId, 10);
        if (!isNaN(staticId)) {
          const sp = staticProducts.find(p => p.id === staticId);
          if (sp) {
            // Map static product to Supabase schema format for rendering
            setProduct({
              id: String(sp.id),
              title: sp.name,
              price: sp.priceValue,
              discount_price: null,
              category: sp.category || 'Living Room',
              image_url: sp.image,
              images: sp.images || [sp.image],
              description: sp.desc || '',
              stock_quantity: 10,
              sku: sp.sku || `KF-${sp.id}`,
              dimensions: null,
              primary_material: null,
              specifications: {},
              created_at: new Date().toISOString(),
            });
            setRelatedProducts(staticProducts.filter(p => p.category === sp.category && p.id !== sp.id).slice(0, 4));
          }
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    if (!loading && product) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".product-animate",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power4.out" }
        );
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading, product]);

  const handleImageSwitch = (index: number) => {
    if (index === activeImage) return;
    if (mainImageRef.current) {
      gsap.fromTo(
        mainImageRef.current,
        { opacity: 0.4, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" }
      );
    }
    setActiveImage(index);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(productId);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: `Check out ${product?.title} at Krishna Furniture!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("✓ Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Header />
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <Header />
        <h1 className="text-3xl font-serif text-neutral-900 mb-4">Product Not Found</h1>
        <Link href="/" className="px-8 py-3 bg-neutral-900 text-white rounded-full font-medium">Return Home</Link>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url]; // Fallback to legacy
    
  const formatPrice = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  
  const hasDynamicSpecs = product.specifications && Object.keys(product.specifications).length > 0;
  const hasPhysicalSpecs = product.dimensions || product.primary_material;
  const showSpecsSection = hasPhysicalSpecs || hasDynamicSpecs;

  return (
    <main ref={pageRef} className="min-h-screen pt-24 bg-white overflow-hidden">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-[#F9F1E7] py-8 product-animate">
        <div className="container mx-auto px-6 md:px-12 flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-500 hover:text-neutral-900 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <Link href={breadcrumbCategoryLink} className="text-neutral-500 hover:text-neutral-900 transition-colors">{breadcrumbCategoryName}</Link>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-900 font-medium border-l-2 border-neutral-300 pl-4 ml-2 truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-6 product-animate">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible no-scrollbar">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleImageSwitch(idx)}
                  className={cn(
                    "relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#F9F1E7] transition-all duration-300",
                    activeImage === idx ? "ring-2 ring-neutral-900 opacity-100" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            <div className="relative aspect-[4/5] md:aspect-square w-full rounded-2xl overflow-hidden bg-[#F9F1E7]">
              <Image 
                ref={mainImageRef}
                src={galleryImages[activeImage]} 
                alt={product.title} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col product-animate">
            <h1 className="text-4xl lg:text-5xl font-serif text-neutral-900 tracking-wide mb-2">{product.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-2xl font-medium text-neutral-900">{formatPrice(product.price)}</p>
              {product.discount_price && (
                <p className="text-lg text-neutral-400 line-through">{formatPrice(product.discount_price)}</p>
              )}
            </div>
            

            
            <p className="text-neutral-600 mb-8 max-w-lg text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {product.description || `Setting the bar as one of the finest pieces in its class, the ${product.title} is a beautiful, stout-hearted addition to any space. Designed with premium materials and aesthetic appeal that brings timeless elegance to your home.`}
            </p>

            {/* Premium Specifications Block */}
            {showSpecsSection && (
              <div className="mb-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-neutral-400" />
                  <h4 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Specifications</h4>
                </div>
                
                <dl className="grid grid-cols-1 divide-y divide-neutral-200/60">
                  {/* Physical Specs */}
                  {product.primary_material && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm text-neutral-500">Primary Material</dt>
                      <dd className="text-sm font-medium text-neutral-900">{product.primary_material}</dd>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm text-neutral-500">Dimensions</dt>
                      <dd className="text-sm font-medium text-neutral-900">{product.dimensions}</dd>
                    </div>
                  )}
                  
                  {/* Dynamic Specs */}
                  {hasDynamicSpecs && Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="py-3 flex justify-between">
                      <dt className="text-sm text-neutral-500 capitalize">{key}</dt>
                      <dd className="text-sm font-medium text-neutral-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-10 pb-10 border-b border-neutral-200">
              <div className="flex items-center border border-neutral-400 rounded-full bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:text-[#B88E2F] transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:text-[#B88E2F] transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="px-10 py-3 rounded-full border border-neutral-900 bg-neutral-900 text-white font-medium tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {product.stock_quantity > 0 ? "Add To Cart" : "Out of Stock"}
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="px-10 py-3 rounded-full border border-neutral-900 flex items-center gap-2 font-medium hover:bg-neutral-50 transition-colors group"
              >
                <Heart className={cn("w-5 h-5", wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "group-hover:text-neutral-900 text-neutral-600")} />
                Wishlist
              </button>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-3 text-sm text-neutral-400">
              <div className="flex"><span className="w-24">SKU</span><span className="text-neutral-500">: {product.sku || "N/A"}</span></div>
              <div className="flex"><span className="w-24">Category</span><span className="text-neutral-500">: {product.category || "General"}</span></div>
              <div className="flex"><span className="w-24">Stock</span><span className="text-neutral-500">: {product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Out of stock"}</span></div>
              <div className="flex items-center">
                <span className="w-24">Share</span>
                <div className="flex gap-4 text-neutral-900">
                  <button onClick={handleShare} className="hover:text-[#B88E2F] transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
      
      <Footer />
    </main>
  );
}
