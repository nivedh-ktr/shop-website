"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, IndianRupee, TrendingUp, ArrowUpRight, ExternalLink } from "lucide-react";
import gsap from "gsap";

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "neutral";
  icon: React.ElementType;
  accent: string;
  href: string;
}

const stats: StatCard[] = [
  {
    title: "Total Products",
    value: "48",
    change: "+4 this month",
    trend: "up",
    icon: Package,
    accent: "bg-blue-50 text-blue-600",
    href: "/admin/inventory",
  },
  {
    title: "Pending Orders",
    value: "12",
    change: "3 new today",
    trend: "up",
    icon: ShoppingBag,
    accent: "bg-amber-50 text-amber-600",
    href: "/admin/orders?status=pending",
  },
  {
    title: "Total Revenue",
    value: "₹18,45,000",
    change: "+12% from last month",
    trend: "up",
    icon: IndianRupee,
    accent: "bg-emerald-50 text-emerald-600",
    href: "/admin/orders",
  },
];

const quickActions = [
  { label: "Add New Product", href: "/admin/inventory?action=new", external: false },
  { label: "View Active Orders", href: "/admin/orders", external: false },
  { label: "Manage Customers", href: "/admin/customers", external: false },
  { label: "Visit Storefront", href: "/", external: true },
];

export default function AdminDashboardPage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17) setGreeting("Good evening");
  }, []);

  // GSAP entry animation
  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll(".stat-card");

    gsap.fromTo(
      cards,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-neutral-900 mb-1">
          {greeting}, Admin 👋
        </h1>
        <p className="text-sm text-neutral-500">
          Here&apos;s what&apos;s happening with Krishna Furniture today.
        </p>
      </div>

      {/* Stat Cards — Clickable */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <button
            key={stat.title}
            onClick={() => router.push(stat.href)}
            className="stat-card bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-300 text-left cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.accent}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.trend === "up" && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Up
                </span>
              )}
            </div>

            <p className="text-sm text-neutral-500 mb-1">{stat.title}</p>
            <p className="text-3xl font-semibold text-neutral-900 tracking-tight mb-2">
              {stat.value}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">{stat.change}</p>
              <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions — Fully Wired */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) =>
            action.external ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between bg-white border border-neutral-200/80 rounded-xl px-5 py-4 hover:border-neutral-400 hover:shadow-sm transition-all duration-200"
              >
                <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  {action.label}
                </span>
                <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
              </a>
            ) : (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center justify-between bg-white border border-neutral-200/80 rounded-xl px-5 py-4 hover:border-neutral-400 hover:shadow-sm transition-all duration-200"
              >
                <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  {action.label}
                </span>
                <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
              </Link>
            )
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6">
        <h2 className="text-lg font-medium text-neutral-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { time: "2 hours ago", text: "New order #KF-4821 placed — ₹45,000" },
            { time: "5 hours ago", text: "Customer Ravi S. signed up" },
            { time: "Yesterday", text: "Product 'Luxury Teak Dining Set' added to inventory" },
            { time: "2 days ago", text: "Order #KF-4819 delivered successfully" },
          ].map((activity, i) => (
            <div
              key={i}
              className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
            >
              <div className="w-2 h-2 rounded-full bg-neutral-300 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-neutral-700">{activity.text}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
