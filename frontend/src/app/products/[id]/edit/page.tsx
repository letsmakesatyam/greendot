"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { productsApi } from "@/lib/api";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.get(Number(id)).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/products/${id}`} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">{product.fg_code}</code>
            {" — "}{product.product_name}
          </p>
        </div>
      </div>
      <ProductForm initial={product} />
    </div>
  );
}
