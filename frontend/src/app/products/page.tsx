"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  PlusCircle, Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  Download, Loader2, X, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { productsApi, type ProductFilters } from "@/lib/api";
import ProductTable from "@/components/ProductTable";

const SOURCES = ["EU", "TR", "UAE", "US"];
const APP_TYPES = ["Core", "Country", "Enhanced", "Specialty"];
const STATUSES = [
  { value: "", label: "Active" },
  { value: "Evaluate", label: "Evaluate" },
  { value: "Discontinued", label: "Discontinued" },
];

export default function ProductsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<ProductFilters>({ page: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      productsApi.list({ ...filters, search: search || undefined }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this product? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const setFilter = (key: keyof ProductFilters, value: string | number | boolean | undefined) =>
    setFilters((f) => ({ ...f, [key]: value || undefined, page: 1 }));

  const clearFilters = () => {
    setFilters({ page: 1 });
    setSearch("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: search || undefined, page: 1 }));
  };

  const totalPages = data ? Math.ceil(data.count / 50) : 1;
  const page = filters.page ?? 1;
  const hasFilters = Object.keys(filters).some((k) => k !== "page" && filters[k as keyof ProductFilters]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isLoading ? "Loading…" : `${data?.count ?? 0} products total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={productsApi.export("xlsx")} className="btn-secondary">
            <Download className="w-4 h-4" /> Export
          </a>
          <Link href="/products/new" className="btn-primary">
            <PlusCircle className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[220px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search product name, FG code, hierarchy…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>

          <button
            className={`btn-secondary ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </button>

          {(hasFilters || search) && (
            <button className="btn-ghost text-slate-500" onClick={clearFilters}>
              <X className="w-4 h-4" /> Clear
            </button>
          )}

          <button
            className="btn-ghost text-slate-500"
            onClick={() => qc.invalidateQueries({ queryKey: ["products"] })}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="label">Source</label>
              <select
                className="select"
                value={String(filters.source ?? "")}
                onChange={(e) => setFilter("source", e.target.value)}
              >
                <option value="">All sources</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Application Type</label>
              <select
                className="select"
                value={String(filters.application_type ?? "")}
                onChange={(e) => setFilter("application_type", e.target.value)}
              >
                <option value="">All types</option>
                {APP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={String(filters.status ?? "")}
                onChange={(e) => setFilter("status", e.target.value)}
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Green Products</label>
              <select
                className="select"
                value={filters.is_green === undefined ? "" : String(filters.is_green)}
                onChange={(e) =>
                  setFilter("is_green", e.target.value === "" ? undefined : e.target.value === "true")
                }
              >
                <option value="">All</option>
                <option value="true">Green only</option>
                <option value="false">Non-green only</option>
              </select>
            </div>
            <div>
              <label className="label">Sort By</label>
              <select
                className="select"
                value={String(filters.ordering ?? "")}
                onChange={(e) => setFilter("ordering", e.target.value)}
              >
                <option value="">Default</option>
                <option value="fg_code">FG Code ↑</option>
                <option value="-fg_code">FG Code ↓</option>
                <option value="product_name">Name ↑</option>
                <option value="-product_name">Name ↓</option>
                <option value="-updated_at">Recently updated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span>Loading products…</span>
          </div>
        ) : (
          <>
            <ProductTable products={data?.results ?? []} onDelete={handleDelete} />
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages} · {data?.count} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="btn-secondary py-1.5 px-3"
                    disabled={!data?.previous}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    className="btn-secondary py-1.5 px-3"
                    disabled={!data?.next}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
