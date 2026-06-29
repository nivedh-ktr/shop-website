"use client";

import { useEffect, useState } from "react";
import { Order, OrderItem } from "@/types/admin";
import { X, User, Phone, MapPin, FileText, PackageSearch, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";

export default function OrderDrawer({
  order,
  isOpen,
  onClose
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchItems(orderId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
      
    if (!error && data) {
      setItems(data as OrderItem[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (isOpen && order) {
      document.body.style.overflow = 'hidden';
      fetchItems(order.id);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <>
      <div 
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[70] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-[80] transform transition-transform animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h2 className="text-xl font-serif text-neutral-900">Order Details</h2>
            <p className="text-sm text-neutral-500 mt-1 font-mono">{order.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-500 hover:text-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Customer Profile */}
          <section>
            <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase mb-4">Customer Profile</h3>
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{order.customer_name}</p>
                  <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {order.customer_phone}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-100 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-neutral-700 leading-relaxed">{order.customer_address}</p>
              </div>

              {order.customer_notes && (
                <div className="pt-4 border-t border-neutral-100 flex items-start gap-3">
                  <FileText className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 bg-amber-50 p-3 rounded-lg flex-1">
                    <span className="block font-medium mb-1">Delivery Notes</span>
                    {order.customer_notes}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Line Items */}
          <section>
            <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase mb-4 flex items-center gap-2">
              <PackageSearch className="w-4 h-4" />
              Line Items
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-12 text-neutral-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium text-center">Qty</th>
                      <th className="px-5 py-3 font-medium text-right">Price</th>
                      <th className="px-5 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 bg-white">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/50">
                        <td className="px-5 py-4 font-medium text-neutral-900">{item.product_title}</td>
                        <td className="px-5 py-4 text-center text-neutral-600">{item.quantity}</td>
                        <td className="px-5 py-4 text-right text-neutral-600">{formatPrice(item.price_at_purchase)}</td>
                        <td className="px-5 py-4 text-right font-medium text-neutral-900">{formatPrice(item.price_at_purchase * item.quantity)}</td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-neutral-500">No items found for this order.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="bg-neutral-50 px-5 py-4 border-t border-neutral-200 flex justify-between items-center">
                  <span className="font-medium text-neutral-600">Order Total</span>
                  <span className="text-lg font-serif font-medium text-neutral-900">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
