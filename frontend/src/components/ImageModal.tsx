"use client";

import { X, Download } from "lucide-react";
import { useEffect } from "react";

interface ImageModalProps {
  imageUrl: string | null;
  productName: string;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, productName, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 truncate">
            {productName}
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download={`${productName}.jpg`}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50 p-4">
          <img
            src={imageUrl}
            alt={productName}
            className="max-w-full max-h-full object-contain rounded"
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm text-slate-500">
          Press ESC to close • Click outside to close
        </div>
      </div>
    </div>
  );
}
