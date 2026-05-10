"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Package, Leaf, AlertTriangle, TrendingUp,
  PlusCircle, Upload, ArrowRight, BarChart3,
} from "lucide-react";
import { productsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => productsApi.stats().then((r) => r.data),
  });

  const statCards = [
    {
      label: "Total Products",
      value: stats?.total ?? "—",
      icon: Package,
      color: "bg-blue-500",
      lightColor: "bg-blue-50 text-blue-700",
    },
    {
      label: "Green Products",
      value: stats?.green_count ?? "—",
      icon: Leaf,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Needs Evaluation",
      value: stats?.evaluate_count ?? "—",
      icon: AlertTriangle,
      color: "bg-orange-500",
      lightColor: "bg-orange-50 text-orange-700",
    },
    {
      label: "Categories",
      value: stats?.by_category?.length ?? "—",
      icon: BarChart3,
      color: "bg-violet-500",
      lightColor: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Building Care & Cleaning Products — MEA Catalog</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, lightColor }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className={cn("text-2xl font-bold", isLoading ? "animate-pulse text-slate-300" : "text-slate-900")}>
                {isLoading ? "···" : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories breakdown */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Products by Category
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="h-3 bg-slate-200 rounded flex-1" />
                  <div className="h-3 w-8 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.by_category?.slice(0, 8).map(({ category, count }) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium">{category || "Uncategorized"}</span>
                      <span className="text-slate-500">{count} <span className="text-slate-400">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Source breakdown */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-500" /> Products by Source
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-20 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stats?.by_source?.map(({ source, count }) => (
                <div key={source || "unknown"} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-800">{count}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{source || "Unknown"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/products/new" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group">
            <PlusCircle className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Add Product</p>
              <p className="text-xs text-blue-600">Create a new product entry</p>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/import-export" className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors group">
            <Upload className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-900">Import Data</p>
              <p className="text-xs text-emerald-600">Upload CSV or Excel file</p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/products" className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-colors group">
            <Package className="w-8 h-8 text-violet-600" />
            <div>
              <p className="font-medium text-violet-900">Browse Products</p>
              <p className="text-xs text-violet-600">View and manage catalog</p>
            </div>
            <ArrowRight className="w-4 h-4 text-violet-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
