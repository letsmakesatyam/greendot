import axios from "axios";
import type { Product, ProductFormData, PaginatedResponse, Stats, ImportResult } from "@/types/product";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

export type ProductFilters = {
  search?: string;
  category?: string;
  application?: string;
  application_type?: string;
  geo_bucket?: string;
  source?: string;
  is_green?: boolean;
  status?: string;
  page?: number;
  ordering?: string;
};

export const productsApi = {
  list: (filters: ProductFilters = {}) =>
    api.get<PaginatedResponse<Product>>("/products/", { params: filters }),

  get: (id: number) => api.get<Product>(`/products/${id}/`),

  create: (data: ProductFormData) => api.post<Product>("/products/", data),

  update: (id: number, data: Partial<ProductFormData>) =>
    api.put<Product>(`/products/${id}/`, data),

  remove: (id: number) => api.delete(`/products/${id}/`),

  import: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ImportResult>("/products/import-data/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  export: (format: "csv" | "xlsx" = "xlsx", filters: ProductFilters = {}) => {
    const params = new URLSearchParams({ format, ...filters as Record<string, string> });
    return `${BASE}/products/export-data/?${params}`;
  },

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.post<{ url: string }>("/products/upload-image/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  stats: () => api.get<Stats>("/products/stats/"),
};

export const healthApi = {
  check: () => api.get("/health/", { timeout: 5000 }),
};
