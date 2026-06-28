"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Loader2,
  ChevronDown,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

/* ─── Types ────────────────────────────────────────────────────────────── */

type OrderStatus =
  | "Pending Coordination"
  | "Processing"
  | "Delivered"
  | "Cancelled";

interface Order {
  id: string;
  order_id: string;
  client_name: string;
  client_email: string;
  subtotal: number;
  status: OrderStatus;
  created_at: string;
}

/* ─── Constants ────────────────────────────────────────────────────────── */

const STATUS_OPTIONS: OrderStatus[] = [
  "Pending Coordination",
  "Processing",
  "Delivered",
  "Cancelled",
];

const TAB_FILTERS: { label: string; value: OrderStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending Coordination" },
  { label: "Processing", value: "Processing" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    bg: string;
    text: string;
    dot: string;
    icon: React.ElementType;
  }
> = {
  "Pending Coordination": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    icon: Clock,
  },
  Processing: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
    icon: Truck,
  },
  Delivered: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  Cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
    icon: XCircle,
  },
};

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Status Dropdown Component ────────────────────────────────────────── */

function StatusDropdown({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = STATUS_CONFIG[order.status];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  async function handleSelect(newStatus: OrderStatus) {
    if (newStatus === order.status) {
      setIsOpen(false);
      return;
    }
    setIsUpdating(true);
    setIsOpen(false);
    await onStatusChange(order.id, newStatus);
    setIsUpdating(false);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isUpdating}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          transition-all duration-200 cursor-pointer
          ${config.bg} ${config.text}
          hover:shadow-sm
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span
            className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
          />
        )}
        <span>{order.status}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-neutral-200/80 shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {STATUS_OPTIONS.map((status) => {
            const optConfig = STATUS_CONFIG[status];
            const isActive = status === order.status;
            return (
              <button
                key={status}
                onClick={() => handleSelect(status)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-neutral-50 font-medium"
                      : "hover:bg-neutral-50"
                  }
                `}
              >
                <span
                  className={`w-2 h-2 rounded-full ${optConfig.dot}`}
                />
                <span className="text-neutral-700">{status}</span>
                {isActive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page Component ──────────────────────────────────────────────── */

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("status") as OrderStatus | null) ?? "All";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const tableRef = useRef<HTMLTableSectionElement>(null);
  const hasAnimated = useRef(false);

  /* ── Fetch Orders ── */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    hasAnimated.current = false;

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (activeTab !== "All") {
      query = query.eq("status", activeTab);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load orders", {
        description: error.message,
      });
      setOrders([]);
    } else {
      setOrders((data as Order[]) ?? []);
    }

    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ── GSAP Stagger Animation ── */
  useEffect(() => {
    if (loading || hasAnimated.current || !tableRef.current) return;

    const rows = tableRef.current.querySelectorAll(".order-row");
    if (rows.length === 0) return;

    gsap.fromTo(
      rows,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
      }
    );

    hasAnimated.current = true;
  }, [loading, orders]);

  /* ── Handle Status Change ── */
  async function handleStatusChange(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Update failed", {
        description: error.message,
      });
      return;
    }

    // Optimistically update local state
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    toast.success("Order updated", {
      description: `Status changed to "${newStatus}"`,
    });
  }

  /* ── Tab Change Handler ── */
  function handleTabChange(value: OrderStatus | "All") {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    const query = params.toString();
    router.push(`/admin/orders${query ? `?${query}` : ""}`);
  }

  /* ── Render ── */
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-neutral-900">
              Active Orders
            </h1>
            <p className="text-sm text-neutral-500">
              Track and manage customer orders
            </p>
          </div>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
          {TAB_FILTERS.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {loading ? (
          /* ── Loading State ── */
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-neutral-300 animate-spin mb-4" />
            <p className="text-sm text-neutral-400">Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-5">
              <Package className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-base font-medium text-neutral-600 mb-1">
              No orders found
            </p>
            <p className="text-sm text-neutral-400">
              {activeTab === "All"
                ? "Orders will appear here once customers place them."
                : `No orders with status "${activeTab}".`}
            </p>
          </div>
        ) : (
          /* ── Table ── */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4">
                    Client
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4">
                    Subtotal
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody ref={tableRef}>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="order-row border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60 transition-colors duration-150"
                    style={{ opacity: 0 }}
                  >
                    {/* Order ID */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-neutral-900 tracking-tight">
                        #{order.order_id}
                      </span>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {order.client_name}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {order.client_email}
                        </p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-neutral-500">
                        {formatDate(order.created_at)}
                      </span>
                    </td>

                    {/* Subtotal */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                        {INR.format(order.subtotal)}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <StatusDropdown
                          order={order}
                          onStatusChange={handleStatusChange}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && orders.length > 0 && (
          <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/50">
            <p className="text-xs text-neutral-400">
              Showing{" "}
              <span className="font-medium text-neutral-600">
                {orders.length}
              </span>{" "}
              order{orders.length !== 1 ? "s" : ""}
              {activeTab !== "All" && (
                <span>
                  {" "}
                  · filtered by{" "}
                  <span className="font-medium text-neutral-600">
                    {activeTab}
                  </span>
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
