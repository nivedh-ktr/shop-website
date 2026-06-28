"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Users, UserPlus, ShoppingBag, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { supabase } from "@/utils/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_orders: number;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isThisMonth(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tableRef = useRef<HTMLTableSectionElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // ── Fetch customers ────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load customers", {
          description: error.message,
        });
        setCustomers([]);
      } else {
        setCustomers((data as Customer[]) ?? []);
      }
      setLoading(false);
    }

    fetchCustomers();
  }, []);

  // ── GSAP: Stats bar entry ──────────────────────────────────────────────────

  useEffect(() => {
    if (loading || !statsRef.current) return;

    const pills = statsRef.current.querySelectorAll(".stat-pill");
    gsap.fromTo(
      pills,
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
      }
    );
  }, [loading]);

  // ── GSAP: Table rows stagger ───────────────────────────────────────────────

  useEffect(() => {
    if (loading || !tableRef.current) return;

    const rows = tableRef.current.querySelectorAll(".customer-row");
    if (rows.length === 0) return;

    gsap.fromTo(
      rows,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.45,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.15,
      }
    );
  }, [loading, customers]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;

    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const totalCustomers = customers.length;
  const newThisMonth = customers.filter((c) => isThisMonth(c.created_at)).length;
  const withOrders = customers.filter((c) => c.total_orders > 0).length;

  // ── Stats config ───────────────────────────────────────────────────────────

  const statPills: { label: string; value: number; icon: React.ElementType; accent: string }[] = [
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "New This Month",
      value: newThisMonth,
      icon: UserPlus,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "With Orders",
      value: withOrders,
      icon: ShoppingBag,
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-neutral-900 mb-1">
          Customer Directory
        </h1>
        <p className="text-sm text-neutral-500">
          View and search all registered customers.
        </p>
      </div>

      {/* Stat Pills */}
      <div ref={statsRef} className="flex flex-wrap gap-4 mb-8">
        {statPills.map((pill) => (
          <div
            key={pill.label}
            className="stat-pill flex items-center gap-3 bg-white border border-neutral-200/80 rounded-2xl px-5 py-3.5 shadow-sm"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${pill.accent}`}
            >
              <pill.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{pill.label}</p>
              <p className="text-lg font-semibold text-neutral-900 tracking-tight leading-tight">
                {pill.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, email, or phone…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-neutral-200/80 rounded-xl shadow-sm placeholder:text-neutral-400 text-neutral-800 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200 transition-all duration-200"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3" />
            <p className="text-sm">Loading customers…</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <Users className="w-8 h-8 mb-3 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-500">
              No customers found
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {searchQuery.trim()
                ? "Try adjusting your search query."
                : "Customers will appear here once they register."}
            </p>
          </div>
        ) : (
          /* Customer Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-6 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th className="px-6 py-3.5 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">
                    Total Orders
                  </th>
                </tr>
              </thead>
              <tbody ref={tableRef}>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="customer-row border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-neutral-900">
                        {customer.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">
                        {customer.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">
                        {customer.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-500">
                        {formatDate(customer.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center justify-center text-sm font-medium min-w-[2rem] ${
                          customer.total_orders > 0
                            ? "text-neutral-900"
                            : "text-neutral-400"
                        }`}
                      >
                        {customer.total_orders}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer count */}
      {!loading && filteredCustomers.length > 0 && (
        <p className="text-xs text-neutral-400 mt-4 text-right">
          Showing {filteredCustomers.length} of {totalCustomers} customer
          {totalCustomers !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
