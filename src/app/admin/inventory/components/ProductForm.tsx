"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

/* ──────────────────────────── Schema & Types ──────────────────────────── */

const specificationSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  discount_price: z.number().nullable().optional(),
  category: z.string().min(1, "Category is required"),
  stock_quantity: z.number().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  images: z.array(z.string()), // we validate length in submit manually now due to pendingFiles
  weight: z.number().nullable().optional(),
  warranty_period: z.string().optional(),
  is_featured: z.boolean().optional(),
  
  // Pre-defined Specs
  wood_type: z.string().optional(),
  custom_wood_type: z.string().optional(),
  surface_finish: z.string().optional(),
  custom_surface_finish: z.string().optional(),
  style: z.string().optional(),
  custom_style: z.string().optional(),
  upholstery: z.string().optional(),
  custom_upholstery: z.string().optional(),
  dimensions: z.string().optional(),
  
  // Custom Specs
  custom_specs: z.array(specificationSchema),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  "Living Room",
  "Bedroom",
  "Dining",
  "Office",
  "Kitchen",
  "Bathroom",
] as const;

const WOOD_TYPES = ["Solid Teak", "Mahogany", "Engineered Wood", "Oak", "Pine", "Metal", "Glass", "Mixed"];
const FINISHES = ["Matte", "Glossy", "PU Polish", "Melamine", "Natural", "Painted"];
const STYLES = ["Modern", "Antique", "Contemporary", "Minimalist", "Rustic", "Industrial"];
const UPHOLSTERY = ["Velvet", "Cotton", "Leatherette", "Genuine Leather", "Linen", "No Cushion"];

/* ──────────────────────────── Component ──────────────────────────── */

export default function ProductForm({
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [activeSection, setActiveSection] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Hold physical File objects securely in state until form submission
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const getInitialSpecs = () => {
    if (!initialData?.specifications) return [];
    const standardKeys = ["wood_type", "surface_finish", "style", "upholstery"];
    return Object.entries(initialData.specifications)
      .filter(([key]) => !standardKeys.includes(key))
      .map(([key, value]) => ({ key, value: String(value) }));
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      discount_price: initialData?.discount_price || null,
      category: initialData?.category || "Living Room",
      stock_quantity: initialData?.stock_quantity ?? (initialData?.stock ?? 0),
      sku: initialData?.sku || "",
      images: initialData?.images || (initialData?.image_url ? [initialData.image_url] : []),
      weight: initialData?.weight || null,
      warranty_period: initialData?.warranty_period || "",
      is_featured: initialData?.is_featured || false,
      dimensions: initialData?.dimensions || "",
      wood_type: initialData?.specifications?.wood_type && !WOOD_TYPES.includes(initialData.specifications.wood_type) ? "Other / Custom..." : (initialData?.specifications?.wood_type || ""),
      custom_wood_type: initialData?.specifications?.wood_type && !WOOD_TYPES.includes(initialData.specifications.wood_type) ? initialData.specifications.wood_type : "",
      surface_finish: initialData?.specifications?.surface_finish && !FINISHES.includes(initialData.specifications.surface_finish) ? "Other / Custom..." : (initialData?.specifications?.surface_finish || ""),
      custom_surface_finish: initialData?.specifications?.surface_finish && !FINISHES.includes(initialData.specifications.surface_finish) ? initialData.specifications.surface_finish : "",
      style: initialData?.specifications?.style && !STYLES.includes(initialData.specifications.style) ? "Other / Custom..." : (initialData?.specifications?.style || ""),
      custom_style: initialData?.specifications?.style && !STYLES.includes(initialData.specifications.style) ? initialData.specifications.style : "",
      upholstery: initialData?.specifications?.upholstery && !UPHOLSTERY.includes(initialData.specifications.upholstery) ? "Other / Custom..." : (initialData?.specifications?.upholstery || ""),
      custom_upholstery: initialData?.specifications?.upholstery && !UPHOLSTERY.includes(initialData.specifications.upholstery) ? initialData.specifications.upholstery : "",
      custom_specs: getInitialSpecs(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specs",
  });

  const currentImages = watch("images");
  const currentDesc = watch("description");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue("description", e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentDesc]);

  /* ─── Strict Submision Architecture (Supabase RLS Debugging) ─── */
  const handleFormSubmit = async (formData: ProductFormData) => {
    if (currentImages.length === 0 && pendingFiles.length === 0) {
      toast.error("Validation Error: At least one image is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const uploadedUrls: string[] = [];

      // STEP 1 & 2: Upload Files & Retrieve URLs
      if (pendingFiles.length > 0) {
        setUploadingImages(true);
        for (const file of pendingFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

          if (error) {
            // Expose exact Supabase RLS / Storage error message
            throw new Error(`Storage upload failed for ${file.name}: ${error.message}`);
          }
          
          const { data: publicData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
            
          uploadedUrls.push(publicData.publicUrl);
        }
        setUploadingImages(false);
      }

      // STEP 3: Construct Final Payload
      const finalImages = [...formData.images, ...uploadedUrls];

      const specsObject: Record<string, string> = {};
      formData.custom_specs.forEach((spec) => {
        if (spec.key.trim() && spec.value.trim()) {
          specsObject[spec.key.trim()] = spec.value.trim();
        }
      });
      if (formData.wood_type) {
        specsObject['wood_type'] = formData.wood_type === "Other / Custom..." ? (formData.custom_wood_type || "") : formData.wood_type;
      }
      if (formData.surface_finish) {
        specsObject['surface_finish'] = formData.surface_finish === "Other / Custom..." ? (formData.custom_surface_finish || "") : formData.surface_finish;
      }
      if (formData.style) {
        specsObject['style'] = formData.style === "Other / Custom..." ? (formData.custom_style || "") : formData.style;
      }
      if (formData.upholstery) {
        specsObject['upholstery'] = formData.upholstery === "Other / Custom..." ? (formData.custom_upholstery || "") : formData.upholstery;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        price: formData.price,
        discount_price: formData.discount_price || null,
        category: formData.category,
        images: finalImages,
        image_url: finalImages.length > 0 ? finalImages[0] : '', // Legacy sync
        stock_quantity: formData.stock_quantity,
        sku: formData.sku?.trim() || null,
        dimensions: formData.dimensions?.trim() || null,
        weight: formData.weight || null,
        warranty_period: formData.warranty_period?.trim() || null,
        is_featured: formData.is_featured,
        primary_material: formData.wood_type === "Other / Custom..." ? (formData.custom_wood_type || null) : (formData.wood_type || null), 
        specifications: specsObject,
      };

      // STEP 4: Execute Database Transaction
      if (initialData) {
        const { error: dbError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", initialData.id);

        if (dbError) {
          // Expose exact Supabase RLS / Table error message
          throw new Error(`Database update failed: ${dbError.message}`);
        }
      } else {
        const { error: dbError } = await supabase
          .from("products")
          .insert([payload]);

        if (dbError) {
          // Expose exact Supabase RLS / Table error message
          throw new Error(`Database insert failed: ${dbError.message}`);
        }
      }

      toast.success(initialData ? "Product updated successfully" : "Product added successfully");
      onSuccess();
      
    } catch (error: any) {
      console.error("Form Submission Error:", error);
      // Ensure the raw error message is bubbled up into the toast UI for immediate debugging
      toast.error(error.message || "An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  /* ─── Dropzone Logic ─── */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...acceptedFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });

  const removeExistingImage = (indexToRemove: number) => {
    setValue("images", currentImages.filter((_, idx) => idx !== indexToRemove));
  };
  
  const removePendingFile = (indexToRemove: number) => {
    setPendingFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 absolute inset-0 z-50">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-neutral-200/80 sticky top-0 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-serif text-neutral-900">
            {initialData ? "Edit Product" : "Add New Product"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting || uploadingImages}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? (uploadingImages ? "Uploading..." : "Saving...") : "Save Product"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-neutral-200/80 hidden md:block shrink-0">
          <nav className="p-4 space-y-1">
            {[
              { id: "basic", label: "Basic Information" },
              { id: "media", label: "Media & Images" },
              { id: "specs", label: "Specifications Engine" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Scrolling Form */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            const sections = ["basic", "media", "specs"];
            for (const section of sections) {
              const el = document.getElementById(section);
              if (el && target.scrollTop >= el.offsetTop - 100) {
                setActiveSection(section);
              }
            }
          }}
        >
          <form id="product-form" onSubmit={handleSubmit(handleFormSubmit)} className="max-w-4xl mx-auto space-y-12 pb-24">
            
            {/* ═════════ SECTION 1: Basic Information ═════════ */}
            <section id="basic" className="space-y-6 scroll-mt-8">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Basic Information</h3>
                <p className="text-sm text-neutral-500 mb-6">The primary details for this product that customers will see first.</p>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Product Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("title")}
                    placeholder="e.g. Luxury Teak Dining Set"
                    className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-300"
                  />
                  {errors.title && <span className="text-xs text-red-500 mt-1.5 block">{errors.title.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    ref={(e) => {
                      register("description").ref(e);
                      textareaRef.current = e;
                    }}
                    onChange={handleDescriptionChange}
                    placeholder="Provide a detailed, rich description for this product. Line breaks are preserved."
                    className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-300 min-h-[120px] resize-none whitespace-pre-wrap leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Base Price (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      {...register("price", { valueAsNumber: true })}
                      placeholder="0"
                      className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all"
                    />
                    {errors.price && <span className="text-xs text-red-500 mt-1.5 block">{errors.price.message}</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Discount Price (₹)
                    </label>
                    <input
                      type="number"
                      {...register("discount_price", { valueAsNumber: true })}
                      placeholder="Optional"
                      className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      {...register("category")}
                      className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all appearance-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Stock Quantity <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      {...register("stock_quantity", { valueAsNumber: true })}
                      placeholder="0"
                      className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      SKU
                    </label>
                    <input
                      {...register("sku")}
                      placeholder="e.g. KF-1024"
                      className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-300 uppercase"
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-neutral-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        {...register("is_featured")}
                        className="peer sr-only" 
                      />
                      <div className="block w-10 h-6 bg-neutral-200 rounded-full peer-checked:bg-neutral-900 transition-colors"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">Feature on Homepage</p>
                      <p className="text-xs text-neutral-500">Highlight this product in the curated section on the storefront.</p>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            {/* ═════════ SECTION 2: Media & Images ═════════ */}
            <section id="media" className="space-y-6 scroll-mt-8">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Media Gallery</h3>
                <p className="text-sm text-neutral-500 mb-6">Upload high-quality images for your product. The first image will be the primary thumbnail.</p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
                
                {/* Dropzone */}
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-500">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900 mb-1">
                      {isDragActive ? "Drop the files here" : "Click or drag files to upload"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </div>

                {/* Gallery Grid for Existing Images (URLs) */}
                {currentImages.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Existing Uploads</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {currentImages.map((url, idx) => (
                        <div key={url} className="relative aspect-square rounded-xl border border-neutral-200 overflow-hidden group bg-neutral-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Upload ${idx}`} className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-600 hover:text-red-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery Grid for Pending Files */}
                {pendingFiles.length > 0 && (
                  <div className="pt-4 border-t border-neutral-100">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Pending Uploads</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {pendingFiles.map((file, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl border border-blue-200 overflow-hidden group bg-blue-50/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(file)} alt={`Pending ${idx}`} className="object-cover w-full h-full opacity-70" />
                          <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-blue-900 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">Pending</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePendingFile(idx)}
                            className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-600 hover:text-red-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ═════════ SECTION 3: Specifications Engine ═════════ */}
            <section id="specs" className="space-y-6 scroll-mt-8">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Specifications Engine</h3>
                <p className="text-sm text-neutral-500 mb-6">Define structured attributes to populate the product data grid consistently.</p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-8">
                
                {/* Physical Attributes */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-4">Physical Attributes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Dimensions (L x W x H)</label>
                      <input
                        {...register("dimensions")}
                        placeholder="e.g. 120cm x 60cm x 45cm"
                        className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Weight (kg)</label>
                      <input
                        type="number"
                        {...register("weight", { valueAsNumber: true })}
                        placeholder="e.g. 24"
                        className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Warranty Period</label>
                      <input
                        {...register("warranty_period")}
                        placeholder="e.g. 2 Years"
                        className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all placeholder:text-neutral-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Material & Finish */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-4">Material & Styling</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Wood / Material Type</label>
                      <select
                        {...register("wood_type")}
                        className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Select Material...</option>
                        {WOOD_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                        <option value="Other / Custom...">Other / Custom...</option>
                      </select>
                      {watch("wood_type") === "Other / Custom..." && (
                        <input
                          {...register("custom_wood_type")}
                          placeholder="Specify custom material..."
                          className="mt-3 w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Surface Finish</label>
                      <select
                        {...register("surface_finish")}
                        className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Select Finish...</option>
                        {FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                        <option value="Other / Custom...">Other / Custom...</option>
                      </select>
                      {watch("surface_finish") === "Other / Custom..." && (
                        <input
                          {...register("custom_surface_finish")}
                          placeholder="Specify custom finish..."
                          className="mt-3 w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Style / Appearance</label>
                      <select
                        {...register("style")}
                        className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Select Style...</option>
                        {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                        <option value="Other / Custom...">Other / Custom...</option>
                      </select>
                      {watch("style") === "Other / Custom..." && (
                        <input
                          {...register("custom_style")}
                          placeholder="Specify custom style..."
                          className="mt-3 w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Upholstery / Cushion</label>
                      <select
                        {...register("upholstery")}
                        className="w-full px-4 py-3 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Select Upholstery...</option>
                        {UPHOLSTERY.map(u => <option key={u} value={u}>{u}</option>)}
                        <option value="Other / Custom...">Other / Custom...</option>
                      </select>
                      {watch("upholstery") === "Other / Custom..." && (
                        <input
                          {...register("custom_upholstery")}
                          placeholder="Specify custom upholstery..."
                          className="mt-3 w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-400"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Specs Builder */}
                <div className="pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-neutral-900">Custom Edge-Case Specifications</h4>
                    <button
                      type="button"
                      onClick={() => append({ key: "", value: "" })}
                      className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Row
                    </button>
                  </div>
                  
                  {fields.length === 0 ? (
                    <div className="text-center py-6 bg-neutral-50 border border-neutral-100 border-dashed rounded-xl">
                      <p className="text-sm text-neutral-500 mb-2">Need a specification not covered above?</p>
                      <button
                        type="button"
                        onClick={() => append({ key: "", value: "" })}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Click here to build a custom trait
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-3 items-start group">
                          <div className="flex-1">
                            <input
                              {...register(`custom_specs.${index}.key` as const)}
                              placeholder="Trait Key (e.g. Care Instructions)"
                              className="w-full px-4 py-2.5 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-300"
                            />
                            {errors?.custom_specs?.[index]?.key && <span className="text-xs text-red-500 mt-1 block">{errors.custom_specs[index]?.key?.message}</span>}
                          </div>
                          <div className="flex-1">
                            <input
                              {...register(`custom_specs.${index}.value` as const)}
                              placeholder="Trait Value (e.g. Wipe with dry cloth)"
                              className="w-full px-4 py-2.5 text-sm bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all placeholder:text-neutral-300"
                            />
                            {errors?.custom_specs?.[index]?.value && <span className="text-xs text-red-500 mt-1 block">{errors.custom_specs[index]?.value?.message}</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-3 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}
