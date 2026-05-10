import ImportExport from "@/components/ImportExport";

export default function ImportExportPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import / Export</h1>
        <p className="text-slate-500 text-sm mt-1">
          Bulk manage your product catalog via CSV or Excel files
        </p>
      </div>
      <ImportExport />
    </div>
  );
}
