"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { productsApi } from "@/lib/api";
import type { ImportResult } from "@/types/product";

export default function ImportExport() {
  const qc = useQueryClient();
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Please upload a CSV or Excel file.");
      return;
    }
    setImporting(true);
    setUploadProgress(0);
    setResult(null);
    try {
      const response = await productsApi.import(file, (progressEvent) => {
        if (typeof progressEvent.loaded === "number" && typeof progressEvent.total === "number") {
          setUploadProgress(Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total)));
        }
      });
      setResult(response.data);
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Import complete — ${response.data.created} created, ${response.data.updated} updated`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Import failed";
      toast.error(msg);
    } finally {
      setImporting(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleExport = (format: "csv" | "xlsx") => {
    const url = productsApi.export(format);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_export.${format}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${format.toUpperCase()}…`);
  };

  const TEMPLATE_HEADERS = [
    "Category", "Application", "Positioning", "FG Code", "Product",
    "Product Hierarchy", "Application Type", "Geo Bucket", "Pack Size",
    "Source", "Green", "FC", "Status", "Listing", "Feasibility",
    "KE", "Indicator 4", "Indicator 5", "Indicator 6",
  ];

  const downloadTemplate = () => {
    const csv = TEMPLATE_HEADERS.join(",") + "\n" +
      "Building Care,Air Freshener,Hard Package Air Freshener,6101981,OASIS ISLAND WAVE ROOM REFRESHER,OASIS ISLAND WAVE ROOM R,Core,MEA Core,2.5Gal,US,No,,,,1,1,0,0,0\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  return (
    <div className="space-y-6">
      {/* Import */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Import Products</h2>
            <p className="text-xs text-slate-500">Upload CSV or Excel — existing FG Codes will be updated</p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          {importing ? (
            <div className="flex flex-col items-center gap-2 text-blue-600">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-medium">Uploading file…</p>
              <p className="text-sm text-slate-500">{uploadProgress}% uploaded</p>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <FileSpreadsheet className="w-10 h-10" />
              <p className="font-medium text-slate-600">Drop CSV / XLSX here or click to browse</p>
              <p className="text-xs">Maximum 20 MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />

        <button className="btn-ghost mt-3 text-blue-600" onClick={downloadTemplate}>
          Download import template
        </button>

        {/* Result */}
        {result && (
          <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {result.created} created
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {result.updated} updated
                </span>
                {result.errors.length > 0 && (
                  <span className="flex items-center gap-1.5 text-red-600 font-medium">
                    <AlertCircle className="w-4 h-4" /> {result.errors.length} errors
                  </span>
                )}
              </div>
              <button className="btn-ghost text-slate-400 p-1" onClick={() => setResult(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {result.errors.length > 0 && (
              <div className="px-4 py-3 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-start gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {e}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Export Products</h2>
            <p className="text-xs text-slate-500">Download your full product catalog</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => handleExport("xlsx")}>
            <Download className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
          <button className="btn-secondary" onClick={() => handleExport("csv")}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Column mapping guide */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Import Column Reference</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {TEMPLATE_HEADERS.map((h) => (
            <div key={h} className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <code className="text-slate-600">{h}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
