"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown,
  ExternalLink, Leaf, AlertTriangle,
} from "lucide-react";
import { cn, STATUS_COLORS, SOURCE_COLORS, APP_TYPE_COLORS } from "@/lib/utils";
import type { Product } from "@/types/product";
import ImageModal from "./ImageModal";

interface Props {
  products: Product[];
  onDelete: (id: number) => void;
}

type SortKey = keyof Product;

export default function ProductTable({ products, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("category");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [selectedImage, setSelectedImage] = useState<{ url: string; productName: string } | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...products].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
      : <ChevronDown className="w-3.5 h-3.5 text-blue-500" />;
  };

  const Th = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className="table-th cursor-pointer select-none hover:bg-slate-50 transition-colors"
      onClick={() => toggleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon col={col} />
      </div>
    </th>
  );

  const IndicatorDot = ({ val }: { val: number }) => (
    <span
      className={cn(
        "inline-block w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center",
        val === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
      )}
    >
      {val}
    </span>
  );

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No products found</p>
        <p className="text-sm mt-1">Try adjusting your filters or add a new product.</p>
      </div>
    );
  }

  return (
    <>
      <ImageModal
        imageUrl={selectedImage?.url ?? null}
        productName={selectedImage?.productName ?? ""}
        onClose={() => setSelectedImage(null)}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="table-th w-12">Image</th>
              <Th col="category" label="Category" />
              <Th col="application" label="Application" />
              <Th col="positioning" label="Positioning" />
              <Th col="fg_code" label="FG Code" />
              <Th col="product_name" label="Product" />
              <Th col="application_type" label="App Type" />
              <Th col="geo_bucket" label="Geo Bucket" />
              <Th col="pack_size" label="Pack Size" />
              <Th col="source" label="Source" />
              <th className="table-th text-center">Green</th>
              <th className="table-th">FC</th>
              <Th col="status" label="Status" />
              <th className="table-th text-center">List.</th>
              <th className="table-th text-center">Feas.</th>
              <th className="table-th text-center">KE</th>
              <th className="table-th text-center">I4</th>
              <th className="table-th text-center">I5</th>
              <th className="table-th text-center">I6</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {sorted.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group cursor-pointer" onClick={() => window.location.href = `/products/${p.id}`}>
                {/* Image */}
                <td className="table-td" onClick={(e) => e.stopPropagation()}>
                  {p.image_url && !failedImages.has(p.id) ? (
                    <img
                      src={p.image_url}
                      alt={p.product_name}
                      className="w-9 h-9 rounded-md object-cover border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onError={() => setFailedImages((prev) => new Set([...prev, p.id]))}
                      onClick={() => setSelectedImage({ url: p.image_url, productName: p.product_name })}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-slate-300">
                      <Package className="w-4 h-4" />
                    </div>
                  )}
                </td>

                <td className="table-td font-medium text-slate-800">{p.category}</td>
                <td className="table-td text-slate-600">{p.application}</td>
                <td className="table-td text-slate-500 max-w-[180px] truncate" title={p.positioning}>
                  {p.positioning}
                </td>
                <td className="table-td font-mono text-xs font-semibold text-blue-700 bg-blue-50/50 rounded">
                  {p.fg_code}
                </td>
                <td className="table-td max-w-[200px]">
                  <div className="truncate font-medium text-slate-800" title={p.product_name}>
                    {p.product_name}
                  </div>
                  <div className="text-xs text-slate-400 truncate" title={p.product_hierarchy}>
                    {p.product_hierarchy}
                  </div>
                </td>

                {/* Application Type */}
                <td className="table-td">
                  {p.application_type && (
                    <span className={cn("badge", APP_TYPE_COLORS[p.application_type] || "bg-slate-100 text-slate-600")}>
                      {p.application_type}
                    </span>
                  )}
                </td>

                <td className="table-td text-slate-600">{p.geo_bucket}</td>
                <td className="table-td text-slate-600">{p.pack_size}</td>

                {/* Source */}
                <td className="table-td">
                  {p.source && (
                    <span className={cn("badge", SOURCE_COLORS[p.source] || "bg-slate-100 text-slate-600")}>
                      {p.source}
                    </span>
                  )}
                </td>

                {/* Green */}
                <td className="table-td text-center">
                  {p.is_green && (
                    <Leaf className="w-4 h-4 text-emerald-500 mx-auto" />
                  )}
                </td>

                <td className="table-td text-slate-500 text-xs">{p.fc}</td>

                {/* Status */}
                <td className="table-td">
                  {p.status ? (
                    <span className={cn("badge flex items-center gap-1", STATUS_COLORS[p.status])}>
                      {p.status === "Evaluate" && <AlertTriangle className="w-3 h-3" />}
                      {p.status}
                    </span>
                  ) : (
                    <span className="badge bg-emerald-50 text-emerald-600 border-emerald-100">Active</span>
                  )}
                </td>

                {/* Indicators */}
                <td className="table-td text-center"><IndicatorDot val={p.indicator_listing} /></td>
                <td className="table-td text-center"><IndicatorDot val={p.indicator_feasibility} /></td>
                <td className="table-td text-center"><IndicatorDot val={p.indicator_ke} /></td>
                <td className="table-td text-center"><IndicatorDot val={p.indicator_4} /></td>
                <td className="table-td text-center"><IndicatorDot val={p.indicator_5} /></td>
                <td className="table-td text-center"><IndicatorDot val={p.indicator_6} /></td>

                {/* Actions */}
                <td className="table-td text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/products/${p.id}`}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="p-1.5 rounded-md text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
    </>
  );
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}
