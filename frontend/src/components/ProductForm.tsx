"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Save, Loader2, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import { productsApi } from "@/lib/api";
import type { Product, ProductFormData } from "@/types/product";

const EMPTY_FORM: ProductFormData = {
  category: "",
  application: "",
  positioning: "",
  fg_code: "",
  product_name: "",
  product_hierarchy: "",
  application_type: "",
  geo_bucket: "",
  pack_size: "",
  source: "",
  is_green: false,
  fc: "",
  status: "",
  indicator_listing: 0,
  indicator_feasibility: 0,
  indicator_ke: 0,
  indicator_4: 0,
  indicator_5: 0,
  indicator_6: 0,
  image_url: "",
};

interface Props {
  initial?: Product;
}

interface FieldProps {
  label: string;
  name: keyof ProductFormData;
  required?: boolean;
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: unknown) => void;
}

interface SelectProps {
  label: string;
  name: keyof ProductFormData;
  options: { value: string; label: string }[];
  required?: boolean;
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: unknown) => void;
}

interface IndicatorFieldProps {
  label: string;
  name: keyof ProductFormData;
  value: number;
  onChange: (field: keyof ProductFormData, value: unknown) => void;
}

// Define these OUTSIDE the component to prevent recreation on each render
function Field({ label, name, required, formData, onChange, ...rest }: FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="input"
        value={String(formData[name] ?? "")}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        {...rest}
      />
    </div>
  );
}

function Select({ label, name, options, required, formData, onChange }: SelectProps) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="select"
        value={String(formData[name] ?? "")}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
      >
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function IndicatorField({ label, name, value, onChange }: IndicatorFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(name, value === 1 ? 0 : 1)}
        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all border-2 ${
          value === 1
            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
        }`}
      >
        {value === 1 ? "1" : "0"}
      </button>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}

export default function ProductForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  // Sync form state when initial data loads
  useEffect(() => {
    if (initial) {
      setForm((f) => ({ ...f, ...initial }));
    }
  }, [initial?.id]);

  const set = (field: keyof ProductFormData, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await productsApi.uploadImage(file);
      set("image_url", data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed — check server connection");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fg_code || !form.product_name || !form.category) {
      toast.error("Category, FG Code and Product Name are required.");
      return;
    }
    setSubmitting(true);
    try {
      if (initial) {
        await productsApi.update(initial.id, form);
        toast.success("Product updated");
      } else {
        await productsApi.create(form);
        toast.success("Product created");
      }
      router.push("/products");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string; fg_code?: string[] } } })?.response?.data?.detail ||
        (err as { response?: { data?: { fg_code?: string[] } } })?.response?.data?.fg_code?.[0] ||
        "Failed to save product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Image upload */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Product Image</h2>
        <div className="flex items-start gap-6">
          <div
            className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => imageRef.current?.click()}
          >
            {form.image_url ? (
              <img src={form.image_url} alt="Product" className="object-cover w-full h-full" />
            ) : (
              <div className="text-center text-slate-400">
                <ImagePlus className="w-8 h-8 mx-auto mb-1" />
                <p className="text-xs">Click to upload</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => imageRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading…" : "Upload Image"}
            </button>
            {form.image_url && (
              <button type="button" className="btn-ghost text-red-500" onClick={() => set("image_url", "")}>
                <X className="w-4 h-4" /> Remove
              </button>
            )}
            <p className="text-xs text-slate-400">PNG, JPG, WEBP — max 20 MB</p>
          </div>
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      </div>

      {/* Core details */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Core Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="FG Code" name="fg_code" required placeholder="e.g. 6101981" disabled={!!initial} formData={form} onChange={set} />
          <Field label="Product Name" name="product_name" required placeholder="Full product name" formData={form} onChange={set} />
          <Field label="Category" name="category" required placeholder="e.g. Building Care" formData={form} onChange={set} />
          <Field label="Application" name="application" placeholder="e.g. Air Freshener" formData={form} onChange={set} />
          <Field label="Positioning" name="positioning" placeholder="e.g. Hard Package Air Freshener" formData={form} onChange={set} />
          <Field label="Product Hierarchy" name="product_hierarchy" placeholder="Hierarchy name" formData={form} onChange={set} />
        </div>
      </div>

      {/* Classification */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Classification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select label="Application Type" name="application_type" options={[
            { value: "Core", label: "Core" },
            { value: "Country", label: "Country" },
            { value: "Enhanced", label: "Enhanced" },
            { value: "Specialty", label: "Specialty" },
          ]} formData={form} onChange={set} />
          <Field label="Geo Bucket" name="geo_bucket" placeholder="e.g. MEA Core, MEP Only" formData={form} onChange={set} />
          <Field label="Pack Size" name="pack_size" placeholder="e.g. 2.5Gal, 10L, 12x1L" formData={form} onChange={set} />
          <Select label="Source" name="source" options={[
            { value: "EU", label: "EU" },
            { value: "TR", label: "TR" },
            { value: "UAE", label: "UAE" },
            { value: "US", label: "US" },
          ]} formData={form} onChange={set} />
          <Field label="FC" name="fc" placeholder="e.g. Ex" formData={form} onChange={set} />
          <Select label="Status" name="status" options={[
            { value: "", label: "Active / Normal" },
            { value: "Evaluate", label: "Evaluate" },
            { value: "Discontinued", label: "Discontinued" },
          ]} formData={form} onChange={set} />
        </div>

        {/* Green toggle */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.is_green}
            onClick={() => set("is_green", !form.is_green)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.is_green ? "bg-emerald-500" : "bg-slate-200"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_green ? "translate-x-5" : ""}`}
            />
          </button>
          <label className="text-sm font-medium text-slate-700">Green Product</label>
        </div>
      </div>

      {/* Binary Indicators */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-1">Binary Indicators</h2>
        <p className="text-xs text-slate-400 mb-4">Toggle between 0 and 1 — click to switch</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <IndicatorField label="Listing" name="indicator_listing" value={form.indicator_listing} onChange={set} />
          <IndicatorField label="Feasibility" name="indicator_feasibility" value={form.indicator_feasibility} onChange={set} />
          <IndicatorField label="KE" name="indicator_ke" value={form.indicator_ke} onChange={set} />
          <IndicatorField label="Indicator 4" name="indicator_4" value={form.indicator_4} onChange={set} />
          <IndicatorField label="Indicator 5" name="indicator_5" value={form.indicator_5} onChange={set} />
          <IndicatorField label="Indicator 6" name="indicator_6" value={form.indicator_6} onChange={set} />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {submitting ? "Saving…" : initial ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
