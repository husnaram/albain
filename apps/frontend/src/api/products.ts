import type { PaginatedProducts, ProductWithRelations } from "../types/product";

const API_BASE = "/api/products";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Terjadi kesalahan" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedProducts> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);

  const res = await fetch(`${API_BASE}?${query.toString()}`);
  return handleResponse<PaginatedProducts>(res);
}

export async function fetchProduct(id: number): Promise<ProductWithRelations> {
  const res = await fetch(`${API_BASE}/${id}`);
  return handleResponse<ProductWithRelations>(res);
}

export async function createProduct(formData: FormData): Promise<{ id: number; message: string }> {
  const res = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });
  return handleResponse(res);
}

export async function updateProduct(
  id: number,
  formData: FormData
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return handleResponse(res);
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/${productId}/images/${imageId}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}
