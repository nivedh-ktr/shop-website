"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  PackageOpen,
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";
import ProductForm, { ProductFormData } from "./components/ProductForm";

/* ──────────────────────────── Types ──────────────────────────── */

interface Product {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  category: string;
  image_url?: string;
  images: string[];
  description: string;
  weight: number | null;
  warranty_period: string | null;
  stock_quantity: number;
  sku: string | null;
  dimensions: string | null;
  primary_material: string | null;
  specifications: Record<string, string>;
  created_at: string;
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

/* ────────────────────── Inner component ─────────────────────── */

function InventoryPageInner() {
  /* ── State ── */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const tableRef = useRef<HTMLTableSectionElement>(null);
  const searchParams = useSearchParams();

  /* ── Fetch products ── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load products");
      console.error(error);
    } else {
      setProducts((data as Product[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── Auto-open modal from URL param ── */
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openAddModal();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── GSAP stagger animation ── */
  useEffect(() => {
    if (loading || products.length === 0 || !tableRef.current) return;

    const rows = tableRef.current.querySelectorAll("tr");
    gsap.fromTo(
      rows,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.45,
        stagger: 0.06,
        ease: "power3.out",
      }
    );
  }, [loading, products]);

  /* ── Search filter ── */
  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Modal helpers ── */
  function openAddModal() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
  }

  /* ── Create / Update Success Callback ── */
  async function handleSuccess() {
    closeModal();
    await fetchProducts();
  }

  /* ── Delete ── */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } else {
      toast.success("Product deleted");
      setDeleteTarget(null);
      await fetchProducts();
    }

    setDeleting(false);
  }

  /* ─────────────────────────── Render ────────────────────────── */

  return (
    <div>
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-serif text-neutral-900">Inventory</h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-neutral-800 active:scale-[0.98] transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search products by name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-96 pl-11 pr-4 py-2.5 text-sm bg-white border border-neutral-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all duration-200 placeholder:text-neutral-400"
        />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {loading ? (
          /* Loading */
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
            <span className="ml-3 text-sm text-neutral-500">Loading products…</span>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <PackageOpen className="w-10 h-10 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-500">
              {searchQuery
                ? "No products match your search."
                : "No products yet. Add your first product to get started."}
            </p>
          </div>
        ) : (
          /* Data table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4">
                    Price
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4 hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody ref={tableRef} className="divide-y divide-neutral-100">
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-neutral-50/60 transition-colors duration-150"
                  >
                    {/* Product info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <Image src={product.images[0]} alt={product.title} width={48} height={48} className="w-full h-full object-cover" />
                        ) : product.image_url ? (
                          <Image src={product.image_url} alt={product.title} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-neutral-200"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-neutral-900">{product.title}</p>
                      </div>
                    </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-block text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {product.discount_price ? (
                        <div>
                          <span className="font-medium text-neutral-900">
                            {formatINR(product.discount_price)}
                          </span>
                          <span className="block text-xs text-neutral-400 line-through">
                            {formatINR(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-neutral-900">
                          {formatINR(product.price)}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 text-right hidden sm:table-cell">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                            product.stock_quantity > 10
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                              : product.stock_quantity > 0
                              ? "bg-amber-50 text-amber-700 border-amber-100/50"
                              : "bg-red-50 text-red-700 border-red-100/50"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.stock_quantity > 10
                                ? "bg-emerald-500"
                                : product.stock_quantity > 0
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          {product.stock_quantity > 0
                            ? `${product.stock_quantity} in stock`
                            : "Out of stock"}
                        </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-150"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════════════════ Add / Edit Modal ════════════════ */}
      {isModalOpen && (
        <ProductForm
          initialData={editingProduct}
          onSuccess={handleSuccess}
          onCancel={closeModal}
        />
      )}

      {/* ════════════════ Delete Confirmation ════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              Delete Product
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-neutral-700">
                &ldquo;{deleteTarget.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-sm"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────── Page export (with Suspense boundary) ───────────────── */

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
        </div>
      }
    >
      <InventoryPageInner />
    </Suspense>
  );
}
