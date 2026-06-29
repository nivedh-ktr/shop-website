"use client";

import { useState, useRef, useEffect } from "react";
import { OrderStatus } from "@/types/admin";
import { ChevronDown, Loader2, CheckCircle2, Clock, Truck, Package, XCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";

const STATUS_OPTIONS: OrderStatus[] = [
  "Pending Verification",
  "Processing / In Workshop",
  "Out for Delivery",
  "Delivered & Completed",
  "Cancelled"
];

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; dot: string; icon: any }> = {
  "Pending Verification": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", icon: Clock },
  "Processing / In Workshop": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", icon: Package },
  "Out for Delivery": { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400", icon: Truck },
  "Delivered & Completed": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", icon: CheckCircle2 },
  "Cancelled": { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400", icon: XCircle },
};

export default function OrderStatusDropdown({ 
  orderId, 
  initialStatus,
  onStatusUpdated
}: { 
  orderId: string; 
  initialStatus: OrderStatus;
  onStatusUpdated?: (newStatus: OrderStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialStatus);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Pending Verification"];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  async function handleSelect(newStatus: OrderStatus, e: React.MouseEvent) {
    e.stopPropagation(); // prevent row click
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }
    
    setIsUpdating(true);
    setIsOpen(false);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      
      setCurrentStatus(newStatus);
      toast.success("Order status updated successfully!");
      if (onStatusUpdated) onStatusUpdated(newStatus);
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        disabled={isUpdating}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          transition-all duration-200 cursor-pointer
          ${config.bg} ${config.text}
          hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        )}
        <span>{currentStatus}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-60 bg-white rounded-xl border border-neutral-200/80 shadow-lg z-[60] py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {STATUS_OPTIONS.map((status) => {
            const optConfig = STATUS_CONFIG[status];
            const isActive = status === currentStatus;
            return (
              <button
                key={status}
                onClick={(e) => handleSelect(status, e)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm
                  transition-colors duration-150
                  ${isActive ? "bg-neutral-50 font-medium" : "hover:bg-neutral-50"}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${optConfig.dot}`} />
                <span className="text-neutral-700">{status}</span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 ml-auto" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
