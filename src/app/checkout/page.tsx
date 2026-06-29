"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/utils/supabase";
import { Loader2, ArrowLeft, ShieldCheck, Plus, Minus, AlertTriangle, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { countries } from "@/utils/countries";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, totalItems, updateQuantity, removeFromCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Form State
  const [formData, setFormData] = useState({
    customer_name: "",
    country_code: "+91",
    customer_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zipcode: "",
    customer_notes: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    
    try {
      const finalTotal = subtotal();
      
      // Concatenate address and phone
      const fullAddress = [
        formData.address_line1,
        formData.address_line2,
        formData.city,
        formData.state,
        formData.zipcode
      ].filter(Boolean).join(", ");
      
      const fullPhone = `${formData.country_code} ${formData.customer_phone}`;

      // Generate a unique order_id
      const generatedOrderId = `KF-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Insert into orders table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_id: generatedOrderId,
          client_name: formData.customer_name, // Legacy required column
          customer_name: formData.customer_name,
          customer_phone: fullPhone,
          customer_address: fullAddress,
          customer_notes: formData.customer_notes || null,
          total_amount: finalTotal,
          order_status: 'Pending Verification'
        })
        .select('id')
        .single();
        
      if (orderError) throw orderError;
      
      // 2. Insert into order_items table
      const orderItemsData = items.map(item => ({
        order_id: orderData.id,
        product_id: typeof item.id === 'number' ? null : item.id,
        product_title: item.title,
        quantity: item.quantity,
        price_at_purchase: item.discount_price && item.discount_price > 0 ? item.discount_price : item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);
        
      if (itemsError) throw itemsError;
      
      // 3. Compile WhatsApp Message
      let waMessage = `🪑 *NEW ORDER INQUIRY - KRISHNA FURNITURE*\n\n`;
      waMessage += `👤 *Customer Information:*\n`;
      waMessage += `• *Name:* ${formData.customer_name}\n`;
      waMessage += `• *Phone:* ${fullPhone}\n`;
      waMessage += `• *Address:* ${fullAddress}\n`;
      waMessage += `• *Notes:* ${formData.customer_notes || "None"}\n\n`;
      
      waMessage += `📦 *Items Requested:*\n`;
      items.forEach(item => {
        const specsString = item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 
          ? ` (${Object.values(item.selectedSpecs).join(', ')})`
          : '';
        waMessage += `• ${item.quantity}x ${item.title}${specsString} - ${formatPrice(item.quantity * (item.discount_price || item.price))}\n`;
      });
      
      waMessage += `\n💰 *Estimated Total:* ${formatPrice(finalTotal)}\n\n`;
      waMessage += `_Please confirm availability and coordinate delivery schedule options._`;
      
      const encodedMessage = encodeURIComponent(waMessage);
      const WHATSAPP_NUMBER = "919778358912";
      const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
      
      // Clear Cart and execute Top-Level Redirection
      clearCart();
      window.location.href = whatsappURL;
      
    } catch (error: any) {
      console.error("Critical Checkout Failure:", error);
      toast.error(`Checkout Stopped: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-neutral-50 py-12 md:py-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12">
          <Link href="/shop" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-serif mt-6">Secure Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left Side: Form */}
          <div className="flex-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
              
              <div className="mb-8 p-4 border-2 border-yellow-400 bg-yellow-50 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-yellow-800 text-sm font-medium leading-relaxed">
                  COD IS NOT AVAILABLE. ADDITIONAL CHARGES. AND YOU CAN MAKE PAYMENT ON WHATSAPP.
                </div>
              </div>

              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                Delivery Details
              </h2>
              
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium text-neutral-700 mb-1.5">WhatsApp / Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex relative items-stretch">
                    <div className="relative flex" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="flex items-center justify-center gap-1 bg-neutral-100/80 border border-r-0 border-neutral-200 rounded-l-xl px-3 hover:bg-neutral-200/60 transition-colors focus:outline-none"
                      >
                        <span className="text-lg">{countries.find(c => c.code === formData.country_code)?.flag || "🇮🇳"}</span>
                        <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-500 ml-0.5">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                          <div className="p-3 border-b border-neutral-100 bg-neutral-50">
                            <input
                              type="text"
                              className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-300 focus:ring-1 focus:ring-neutral-200"
                              placeholder="Search country or code..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {countries
                              .filter(c => 
                                c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
                                c.code.includes(countrySearch)
                              )
                              .map((country) => (
                                <button
                                  key={country.name}
                                  type="button"
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 flex items-center gap-3 transition-colors"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, country_code: country.code }));
                                    setShowCountryDropdown(false);
                                    setCountrySearch("");
                                  }}
                                >
                                  <span className="text-lg w-6 flex-shrink-0">{country.flag}</span>
                                  <span className="flex-1 truncate">{country.name}</span>
                                  <span className="text-neutral-400 font-medium">{country.code}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center px-2 bg-white border-y border-neutral-200 text-neutral-900 font-medium text-base">
                      {formData.country_code}
                    </div>
                    <input
                      type="tel"
                      id="customer_phone"
                      name="customer_phone"
                      required
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      className="w-full pl-2 pr-4 py-3 bg-white rounded-r-xl border border-l-0 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all flex-1"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address_line1" className="block text-sm font-medium text-neutral-700 mb-1.5">Address Line 1 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="address_line1"
                    name="address_line1"
                    required
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    placeholder="Flat No, Building, Street"
                  />
                </div>

                <div>
                  <label htmlFor="address_line2" className="block text-sm font-medium text-neutral-700 mb-1.5">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    id="address_line2"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    placeholder="Landmark, Area, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1.5">City <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-neutral-700 mb-1.5">State <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="zipcode" className="block text-sm font-medium text-neutral-700 mb-1.5">ZIP / PIN Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    required
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="customer_notes" className="block text-sm font-medium text-neutral-700 mb-1.5">Order Notes (Optional)</label>
                  <textarea
                    id="customer_notes"
                    name="customer_notes"
                    rows={2}
                    value={formData.customer_notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
                    placeholder="Any specific instructions for delivery..."
                  />
                </div>
              </form>

              <div className="mt-12">
                <h3 className="text-lg font-medium text-neutral-900 mb-4 uppercase tracking-wide">Payment Method</h3>
                <div className="p-5 border-2 border-yellow-400 bg-yellow-50/30 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="font-medium text-neutral-900 text-sm md:text-base">
                    PAYMENT ON UPI/BANK TRANSFER AT WHATSAPP/ NO COD
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Right Side: Order Summary */}
          <div className="lg:w-[450px]">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 sticky top-24">
              <h3 className="text-xl font-medium mb-6">Order Summary</h3>
              
              <div className="space-y-6 mb-6 max-h-[500px] overflow-y-auto pr-2">
                {items.length === 0 ? (
                  <p className="text-neutral-500 italic">Your cart is empty.</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex gap-4 border-b border-neutral-50 pb-6 last:border-0 last:pb-0">
                      <div className="relative w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 bg-neutral-200">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-sm font-medium text-neutral-900 truncate mb-1">{item.title}</h4>
                          {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
                            <p className="text-[10px] text-neutral-400 truncate">
                              {Object.values(item.selectedSpecs).join(', ')}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          {/* Interactive Quantity Controls */}
                          <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium text-neutral-900">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-sm font-medium">
                            {formatPrice((item.discount_price || item.price) * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="border-t border-neutral-100 pt-6 space-y-4">
                <div className="flex justify-between text-neutral-500 text-sm">
                  <span>Subtotal ({totalItems()} items)</span>
                  <span>{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-sm">
                  <span>Shipping</span>
                  <span>Calculated on WhatsApp</span>
                </div>
                
                <div className="flex justify-between items-end pt-4 border-t border-neutral-100">
                  <span className="font-medium">Estimated Total</span>
                  <span className="font-serif text-2xl">{formatPrice(subtotal())}</span>
                </div>
              </div>
              
              <button
                type="submit"
                form="checkout-form"
                disabled={loading || items.length === 0}
                className="w-full mt-8 bg-neutral-900 text-white py-4 rounded-xl font-medium tracking-wide hover:bg-neutral-800 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Proceed to WhatsApp"
                )}
              </button>
              
              <p className="text-center text-xs text-neutral-400 mt-4 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Secure Order Processing
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
