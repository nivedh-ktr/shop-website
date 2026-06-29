"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  
  const initialQuery = searchParams?.get("query") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  // Sync external URL changes back to local state (e.g. clicking Home)
  useEffect(() => {
    const currentQuery = searchParams?.get("query") || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchTerm(currentQuery);
  }, [searchParams]);

  // Update URL on debounced term using useTransition
  useEffect(() => {
    const currentQuery = searchParams?.get("query") || "";
    
    // Only push if the term actually differs from what's in the URL
    if (searchTerm !== currentQuery) {
      const timer = setTimeout(() => {
        startTransition(() => {
          if (searchTerm) {
            router.push(`${pathname}?query=${encodeURIComponent(searchTerm)}`, { scroll: false });
          } else {
            router.push(pathname, { scroll: false });
          }
        });
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    }
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        {isPending ? (
          <Loader2 className="h-5 w-5 text-neutral-400 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
        )}
      </div>
      <input
        type="text"
        className="w-full pl-12 pr-6 py-4 bg-white border border-neutral-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all shadow-sm group-hover:shadow-md"
        placeholder="Search premium furniture..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
