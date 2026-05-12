import axios, { AxiosProgressEvent, type AxiosResponse } from "axios";
import type { Product, ProductFormData, PaginatedResponse, Stats, ImportResult } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const BASE = API_URL.replace(/\/+$/, "");

function buildApiPath(path: string) {
  return `${BASE}/${path.replace(/^\/+/, "")}`;
}

function normalizeFilters(filters: ProductFilters) {
  return Object.entries(filters).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") return acc;
    acc[key] = String(value);
    return acc;
  }, {});
}

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

  import: (
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
  ) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ImportResult, AxiosResponse<ImportResult>>("/products/import-data/", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
  },

  export: (format: "csv" | "xlsx" = "xlsx", filters: ProductFilters = {}) => {
    const params = new URLSearchParams({ export_format: format, ...normalizeFilters(filters) });
    return buildApiPath(`products/export-data/?${params.toString()}`);
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
