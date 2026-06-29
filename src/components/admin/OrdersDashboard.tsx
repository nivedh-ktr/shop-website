"use client";

import { useState, useMemo } from "react";
import { Order, OrderStatus } from "@/types/admin";
import { Package, IndianRupee, Truck } from "lucide-react";
import OrderStatusDropdown from "./OrderStatusDropdown";
import OrderDrawer from "./OrderDrawer";

const TAB_FILTERS: { label: string; value: OrderStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending Verification" },
  { label: "Processing", value: "Processing / In Workshop" },
  { label: "Delivered", value: "Delivered & Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

export default function OrdersDashboard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<OrderStatus | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const formatDate = (iso: string) => 
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  // Dashboard Metrics
  const activeOrders = useMemo(() => orders.filter(o => o.order_status !== "Delivered & Completed" && o.order_status !== "Cancelled"), [orders]);
  const pendingRevenue = useMemo(() => activeOrders.reduce((sum, o) => sum + o.total_amount, 0), [activeOrders]);
  const completedDeliveries = useMemo(() => orders.filter(o => o.order_status === "Delivered & Completed").length, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (activeTab === "All") return orders;
    return orders.filter(o => o.order_status === activeTab);
  }, [orders, activeTab]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Active Orders</p>
            <p className="text-2xl font-serif text-neutral-900">{activeOrders.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Pending Revenue</p>
            <p className="text-2xl font-serif text-neutral-900">{formatPrice(pendingRevenue)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Completed Deliveries</p>
            <p className="text-2xl font-serif text-neutral-900">{completedDeliveries}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TAB_FILTERS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`
              px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.value 
                ? "bg-neutral-900 text-white shadow-md" 
                : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-center">Items</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map(order => (
                <tr 
                  key={order.id} 
                  className="hover:bg-neutral-50/60 transition-colors cursor-pointer group"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-neutral-900">{order.customer_name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{order.id.slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full text-xs font-medium">
                      {order.items_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-neutral-900">{formatPrice(order.total_amount)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusDropdown 
                      orderId={order.id}
                      initialStatus={order.order_status}
                      onStatusUpdated={(newStatus) => {
                        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, order_status: newStatus } : o));
                      }}
                    />
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDrawer 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
