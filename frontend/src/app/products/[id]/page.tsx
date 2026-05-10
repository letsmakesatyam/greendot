"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft, Pencil, Trash2, Leaf, AlertTriangle, Package, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { productsApi } from "@/lib/api";
import { cn, STATUS_COLORS, SOURCE_COLORS, APP_TYPE_COLORS, formatDate } from "@/lib/utils";
import ImageModal from "@/components/ImageModal";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<{ url: string; productName: string } | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.get(Number(id)).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.remove(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      router.push("/products");
    },
    onError: () => toast.error("Failed to delete"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading product…</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">Product not found.</p>
        <Link href="/products" className="btn-primary mt-4 inline-flex">Back to Products</Link>
      </div>
    );
  }

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value || <span className="text-slate-300">—</span>}</p>
    </div>
  );

  const indicators = [
    { label: "Listing", val: product.indicator_listing },
    { label: "Feasibility", val: product.indicator_feasibility },
    { label: "KE", val: product.indicator_ke },
    { label: "Ind. 4", val: product.indicator_4 },
    { label: "Ind. 5", val: product.indicator_5 },
    { label: "Ind. 6", val: product.indicator_6 },
  ];

  return (
    <>
      <ImageModal
        imageUrl={selectedImage?.url ?? null}
        productName={selectedImage?.productName ?? ""}
        onClose={() => setSelectedImage(null)}
      />
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-3">
          <Link href="/products" className="btn-ghost p-2 mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{product.product_name}</h1>
              {product.status && (
                <span className={cn("badge", STATUS_COLORS[product.status])}>
                  {product.status === "Evaluate" && <AlertTriangle className="w-3 h-3" />}
                  {product.status}
                </span>
              )}
              {product.is_green && (
                <span className="badge bg-emerald-100 text-emerald-700 border-emerald-200">
                  <Leaf className="w-3 h-3" /> Green
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-1">
              FG Code: <code className="font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{product.fg_code}</code>
              {" · "}Updated {formatDate(product.updated_at!)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/products/${product.id}/edit`} className="btn-secondary">
              <Pencil className="w-4 h-4" /> Edit
            </Link>
            <button
              className="btn-danger"
              onClick={() => {
                if (window.confirm("Delete this product? This cannot be undone.")) deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                  onClick={() => setSelectedImage({ url: product.image_url, productName: product.product_name })}
                />
              ) : (
                <div className="aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-300">
                  <Package className="w-16 h-16" />
                  <p className="text-sm mt-2">No image</p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Core Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Category" value={product.category} />
                <Field label="Application" value={product.application} />
                <Field label="Positioning" value={product.positioning} />
                <Field label="Product Hierarchy" value={product.product_hierarchy} />
                <Field
                  label="Application Type"
                  value={
                    product.application_type && (
                      <span className={cn("badge", APP_TYPE_COLORS[product.application_type] || "")}>
                        {product.application_type}
                      </span>
                    )
                  }
                />
                <Field label="Geo Bucket" value={product.geo_bucket} />
                <Field label="Pack Size" value={product.pack_size} />
                <Field
                  label="Source"
                  value={
                    product.source && (
                      <span className={cn("badge", SOURCE_COLORS[product.source] || "")}>
                        {product.source}
                      </span>
                    )
                  }
                />
                <Field label="FC" value={product.fc} />
              </div>
            </div>

            {/* Indicators */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Binary Indicators</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {indicators.map(({ label, val }) => (
                  <div key={label} className="text-center">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-1",
                      val === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                    )}>
                      {val}
                    </div>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
