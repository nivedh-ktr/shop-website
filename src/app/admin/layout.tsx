"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/utils/supabase";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Active Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-[#F8F8F8] overflow-hidden">
      {/* ── Mobile Overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[260px] bg-white border-r border-neutral-200
          flex flex-col
          transition-transform duration-300 ease-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100">
          <span className="font-serif text-lg tracking-tight text-neutral-900">
            Krishna Admin
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-md"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  }
                `}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to Store */}
        <div className="px-3 pb-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-neutral-500 hidden sm:block">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
