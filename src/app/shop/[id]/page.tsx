"use client";

import { useEffect, useRef, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, Heart, Minus, Plus, Share2 } from "lucide-react";
import gsap from "gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";
import { products } from "@/utils/products";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

export default function ProductDetailPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const productId = parseInt(resolvedParams.id, 10);
  const refSlug = resolvedSearchParams.ref as string | undefined;
  const product = products.find(p => p.id === productId);

  const categoryDictionary: Record<string, string> = {
    "living-room": "Living Room Collection",
    "dining": "Dining Room Collection",
    "bedroom": "Bedroom Collection",
    "office": "Home Office Space",
  };

  const breadcrumbCategoryName = refSlug && categoryDictionary[refSlug] ? categoryDictionary[refSlug] : "Shop";
  const breadcrumbCategoryLink = refSlug ? `/category/${refSlug}` : "/collections";

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Description");
  
  const { addToCart, toggleWishlist, wishlist } = useAppContext();
  const pageRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  // Initialize selected size/color if available
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) setActiveSize(product.sizes[0]);
      if (product.colors && product.colors.length > 0) setActiveColor(product.colors[0].name);
    }
  }, [product]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".product-animate",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power4.out" }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleImageSwitch = (index: number) => {
    if (index === activeImage) return;
    if (mainImageRef.current) {
      // Apple-style cross-fade and scale transition
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
          title: product?.name,
          text: `Check out ${product?.name} at Krishna Furniture!`,
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <Header />
        <h1 className="text-3xl font-serif text-neutral-900 mb-4">Product Not Found</h1>
        <Link href="/" className="px-8 py-3 bg-neutral-900 text-white rounded-full font-medium">Return Home</Link>
      </div>
    );
  }

  const galleryImages = product.images || [product.image];
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

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
          <span className="text-neutral-900 font-medium border-l-2 border-neutral-300 pl-4 ml-2">{product.name}</span>
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
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col product-animate">
            <h1 className="text-4xl lg:text-5xl font-serif text-neutral-900 tracking-wide mb-2">{product.name}</h1>
            <p className="text-2xl font-medium text-neutral-500 mb-4">{product.price}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-[#FFC700]">
                {[...Array(4)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                <Star className="w-5 h-5 fill-current opacity-50" />
              </div>
              <span className="text-neutral-400 text-sm border-l border-neutral-300 pl-4">5 Customer Review</span>
            </div>
            
            <p className="text-neutral-600 mb-8 max-w-lg text-sm md:text-base leading-relaxed">
              Setting the bar as one of the loudest speakers in its class, the {product.name} is a compact, stout-hearted hero with a well-balanced audio which boasts a clear midrange and extended highs for a sound that is both articulate and pronounced.
            </p>

            {/* Size Variants */}
            {product.sizes && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-neutral-400 mb-3">Size</h4>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button 
                      key={size}
                      onClick={() => setActiveSize(size)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center",
                        activeSize === size ? "bg-[#B88E2F] text-white" : "bg-[#F9F1E7] text-neutral-900 hover:bg-[#B88E2F]/20"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Variants */}
            {product.colors && (
              <div className="mb-8">
                <h4 className="text-sm font-medium text-neutral-400 mb-3">Color</h4>
                <div className="flex gap-4">
                  {product.colors.map((color) => (
                    <button 
                      key={color.name}
                      onClick={() => setActiveColor(color.name)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all duration-300",
                        activeColor === color.name ? "ring-2 ring-offset-2 ring-neutral-900 scale-110" : "hover:scale-110 opacity-80"
                      )}
                      style={{ backgroundColor: color.hex }}
                      aria-label={color.name}
                    />
                  ))}
                </div>
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
                className="px-10 py-3 rounded-full border border-neutral-900 font-medium tracking-wide hover:bg-neutral-900 hover:text-white transition-colors"
              >
                Add To Cart
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="px-10 py-3 rounded-full border border-neutral-900 flex items-center gap-2 font-medium hover:bg-neutral-900 hover:text-white transition-colors group"
              >
                <Heart className={cn("w-5 h-5", wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "group-hover:text-white")} />
                Wishlist
              </button>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-3 text-sm text-neutral-400">
              <div className="flex"><span className="w-24">SKU</span><span className="text-neutral-500">: {product.sku || `SS00${product.id}`}</span></div>
              <div className="flex"><span className="w-24">Category</span><span className="text-neutral-500">: {product.category || "Sofas"}</span></div>
              <div className="flex"><span className="w-24">Tags</span><span className="text-neutral-500">: {product.tags?.join(", ") || "Furniture"}</span></div>
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

      {/* Tabs Section */}
      <div className="border-t border-neutral-200 pt-12 pb-20 product-animate">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-10">
            {["Description", "Additional Information", "Reviews [5]"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-xl font-medium transition-colors",
                  activeTab === tab ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="max-w-4xl mx-auto text-neutral-500 leading-relaxed space-y-6">
            {activeTab === "Description" && (
              <>
                <p>Embodying the raw, wayward spirit of rock &lsquo;n&rsquo; roll, the Kilburn portable active stereo speaker takes the unmistakable look and sound of Marshall, unplugs the chords, and takes the show on the road.</p>
                <p>Weighing in under 7 pounds, the Kilburn is a lightweight piece of vintage styled engineering. Setting the bar as one of the loudest speakers in its class, the Kilburn is a compact, stout-hearted hero with a well-balanced audio which boasts a clear midrange and extended highs for a sound that is both articulate and pronounced. The analogue knobs allow you to fine tune the controls to your personal preferences while the guitar-influenced leather strap enables easy and stylish travel.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                  <div className="relative aspect-[4/3] bg-[#F9F1E7] rounded-xl overflow-hidden"><Image src={galleryImages[0]} alt="Detail 1" fill className="object-cover" /></div>
                  <div className="relative aspect-[4/3] bg-[#F9F1E7] rounded-xl overflow-hidden"><Image src={galleryImages[Math.min(1, galleryImages.length - 1)]} alt="Detail 2" fill className="object-cover" /></div>
                </div>
              </>
            )}
            {activeTab === "Additional Information" && <p className="text-center py-10">Weight: 7 lbs<br/>Dimensions: 10 x 5 x 5 in<br/>Materials: Leather, Brass, Birch Wood</p>}
            {activeTab === "Reviews [5]" && <p className="text-center py-10">No reviews yet for this aesthetic piece. Be the first to review!</p>}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-neutral-200 py-16 product-animate bg-neutral-50">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-serif text-center mb-12">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((rp) => (
                <div key={rp.id} className="product-card group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative">
                  <Link href={`/shop/${rp.id}`} className="relative aspect-[4/5] overflow-hidden bg-neutral-100 block">
                    <Image src={rp.image} alt={rp.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>
                  <div className="absolute top-0 left-0 w-full aspect-[4/5] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <button onClick={(e) => { e.preventDefault(); addToCart(rp.id); }} className="bg-white text-neutral-900 px-6 py-3 rounded-full font-medium tracking-wide hover:bg-neutral-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-auto">Add to cart</button>
                  </div>
                  <button onClick={(e) => { e.preventDefault(); toggleWishlist(rp.id); }} className={cn("absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors z-10", wishlist.includes(rp.id) ? "text-red-500" : "text-neutral-600 hover:text-red-500")}>
                    <Heart className="w-5 h-5" fill={wishlist.includes(rp.id) ? "currentColor" : "none"} />
                  </button>
                  <div className="p-6 flex flex-col flex-grow">
                    <Link href={`/shop/${rp.id}`}><h3 className="font-medium text-xl tracking-wide text-neutral-900 mb-1 hover:text-neutral-600 transition-colors">{rp.name}</h3></Link>
                    <p className="text-sm text-neutral-500 mb-4">{rp.desc}</p>
                    <span className="font-semibold text-lg">{rp.price}</span>
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
