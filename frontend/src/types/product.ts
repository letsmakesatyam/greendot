export interface Product {
  id: number;
  category: string;
  application: string;
  positioning: string;
  fg_code: string;
  product_name: string;
  product_hierarchy: string;
  application_type: string;
  geo_bucket: string;
  pack_size: string;
  source: string;
  is_green: boolean;
  fc: string;
  status: string;
  indicator_listing: number;
  indicator_feasibility: number;
  indicator_ke: number;
  indicator_4: number;
  indicator_5: number;
  indicator_6: number;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export type ProductFormData = Omit<Product, "id" | "created_at" | "updated_at">;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Stats {
  total: number;
  by_category: { category: string; count: number }[];
  by_source: { source: string; count: number }[];
  evaluate_count: number;
  green_count: number;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}
