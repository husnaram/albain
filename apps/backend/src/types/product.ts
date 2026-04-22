export interface Product {
  id: number;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  campaign_price: number | null;
  flash_sale_price: number | null;
  category: string;
  main_sku: string;
  status: "active" | "inactive";
  affiliate_commission: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  file_path: string;
  sort_order: number;
  created_at: string;
}

export interface ProductVariation {
  id: number;
  product_id: number;
  color: string;
  sku: string;
  stock: number;
  image_path: string | null;
  created_at: string;
}

export interface ProductWithRelations extends Product {
  images: ProductImage[];
  variations: ProductVariation[];
}

export interface CreateProductInput {
  name: string;
  description?: string;
  cost_price: number;
  selling_price: number;
  campaign_price?: number | null;
  flash_sale_price?: number | null;
  category?: string;
  main_sku: string;
  status?: "active" | "inactive";
  affiliate_commission?: number;
  variations?: Array<{
    color: string;
    sku: string;
    stock: number;
    image_path?: string | null;
  }>;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}
