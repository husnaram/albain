import { Elysia } from "elysia";
import * as productService from "../services/product.service";
import {
  saveFile,
  isValidImageType,
} from "../utils/file-upload";

export const productRoutes = new Elysia({ prefix: "/api/products" })

  // GET /api/products — List produk dengan pagination, search, filter
  .get("/", ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = (query.search as string) || undefined;
    const status = (query.status as string) || undefined;
    return productService.getAllProducts(page, limit, search, status);
  })

  // GET /api/products/:id — Detail produk
  .get("/:id", ({ params, set }) => {
    const product = productService.getProductById(Number(params.id));
    if (!product) {
      set.status = 404;
      return { error: "Produk tidak ditemukan" };
    }
    return product;
  })

  // POST /api/products — Buat produk baru
  .post("/", async ({ body, set }) => {
    try {
      const formData = body as FormData;

      const name = formData.get("name") as string;
      const mainSku = formData.get("main_sku") as string;

      if (!name || !mainSku) {
        set.status = 400;
        return { error: "Nama dan SKU Utama wajib diisi" };
      }

      const costPrice = Number(formData.get("cost_price")) || 0;
      const sellingPrice = Number(formData.get("selling_price")) || 0;
      const campaignPrice = formData.get("campaign_price")
        ? Number(formData.get("campaign_price"))
        : null;
      const flashSalePrice = formData.get("flash_sale_price")
        ? Number(formData.get("flash_sale_price"))
        : null;
      const affiliateCommission =
        Number(formData.get("affiliate_commission")) || 0;
      const status =
        (formData.get("status") as "active" | "inactive") || "active";

      // Parse variations JSON
      let variations: Array<{
        color: string;
        sku: string;
        stock: number;
        image_path?: string | null;
      }> = [];
      const variationsJson = formData.get("variations");
      if (variationsJson) {
        try {
          variations = JSON.parse(variationsJson as string);
        } catch {
          variations = [];
        }
      }

      // Upload variation images
      for (let i = 0; i < variations.length; i++) {
        const varImage = formData.get(`variation_image_${i}`) as File | null;
        if (varImage && varImage.size > 0 && isValidImageType(varImage)) {
          variations[i].image_path = await saveFile(varImage, "variations");
        }
      }

      const productId = productService.createProduct({
        name,
        description: (formData.get("description") as string) || "",
        cost_price: costPrice,
        selling_price: sellingPrice,
        campaign_price: campaignPrice,
        flash_sale_price: flashSalePrice,
        category: (formData.get("category") as string) || "",
        main_sku: mainSku,
        status,
        affiliate_commission: affiliateCommission,
        variations,
      });

      // Upload product images
      const images = formData.getAll("images") as File[];
      let sortOrder = 0;
      for (const img of images) {
        if (img && img.size > 0 && isValidImageType(img)) {
          const filePath = await saveFile(img, "products");
          productService.addProductImage(productId, filePath, sortOrder++);
        }
      }

      set.status = 201;
      return { id: productId, message: "Produk berhasil dibuat" };
    } catch (err: unknown) {
      set.status = 500;
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      return { error: message };
    }
  })

  // PUT /api/products/:id — Update produk
  .put("/:id", async ({ params, body, set }) => {
    try {
      const id = Number(params.id);
      const existing = productService.getProductById(id);
      if (!existing) {
        set.status = 404;
        return { error: "Produk tidak ditemukan" };
      }

      const formData = body as FormData;

      const campaignPrice = formData.get("campaign_price") !== null
        ? (formData.get("campaign_price") === "" ? null : Number(formData.get("campaign_price")))
        : undefined;
      const flashSalePrice = formData.get("flash_sale_price") !== null
        ? (formData.get("flash_sale_price") === "" ? null : Number(formData.get("flash_sale_price")))
        : undefined;

      // Parse variations
      let variations: Array<{
        color: string;
        sku: string;
        stock: number;
        image_path?: string | null;
      }> | undefined;

      const variationsJson = formData.get("variations");
      if (variationsJson !== null) {
        try {
          variations = JSON.parse(variationsJson as string);
        } catch {
          variations = [];
        }
      }

      // Upload variation images if provided
      if (variations) {
        for (let i = 0; i < variations.length; i++) {
          const varImage = formData.get(`variation_image_${i}`) as File | null;
          if (varImage && varImage.size > 0 && isValidImageType(varImage)) {
            variations[i].image_path = await saveFile(varImage, "variations");
          }
        }
      }

      productService.updateProduct(id, {
        name: (formData.get("name") as string) || undefined,
        description: formData.get("description") !== null
          ? (formData.get("description") as string)
          : undefined,
        cost_price: formData.get("cost_price") ? Number(formData.get("cost_price")) : undefined,
        selling_price: formData.get("selling_price") ? Number(formData.get("selling_price")) : undefined,
        campaign_price: campaignPrice,
        flash_sale_price: flashSalePrice,
        category: formData.get("category") !== null
          ? (formData.get("category") as string)
          : undefined,
        main_sku: (formData.get("main_sku") as string) || undefined,
        status: (formData.get("status") as "active" | "inactive") || undefined,
        affiliate_commission: formData.get("affiliate_commission")
          ? Number(formData.get("affiliate_commission"))
          : undefined,
        variations,
      });

      // Upload new product images
      const images = formData.getAll("images") as File[];
      const existingCount = existing.images.length;
      let sortOrder = existingCount;
      for (const img of images) {
        if (img && img.size > 0 && isValidImageType(img)) {
          const filePath = await saveFile(img, "products");
          productService.addProductImage(id, filePath, sortOrder++);
        }
      }

      return { message: "Produk berhasil diperbarui" };
    } catch (err: unknown) {
      set.status = 500;
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      return { error: message };
    }
  })

  // DELETE /api/products/:id — Hapus produk
  .delete("/:id", ({ params, set }) => {
    const id = Number(params.id);
    const existing = productService.getProductById(id);
    if (!existing) {
      set.status = 404;
      return { error: "Produk tidak ditemukan" };
    }
    productService.deleteProduct(id);
    return { message: "Produk berhasil dihapus" };
  })

  // POST /api/products/:id/images — Upload foto produk
  .post("/:id/images", async ({ params, body, set }) => {
    try {
      const id = Number(params.id);
      const existing = productService.getProductById(id);
      if (!existing) {
        set.status = 404;
        return { error: "Produk tidak ditemukan" };
      }

      const formData = body as FormData;
      const images = formData.getAll("images") as File[];
      let sortOrder = existing.images.length;

      for (const img of images) {
        if (img && img.size > 0 && isValidImageType(img)) {
          const filePath = await saveFile(img, "products");
          productService.addProductImage(id, filePath, sortOrder++);
        }
      }

      return { message: "Foto berhasil diupload" };
    } catch (err: unknown) {
      set.status = 500;
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      return { error: message };
    }
  })

  // DELETE /api/products/:id/images/:imageId — Hapus 1 foto
  .delete("/:id/images/:imageId", ({ params, set }) => {
    const productId = Number(params.id);
    const imageId = Number(params.imageId);
    productService.deleteProductImage(productId, imageId);
    return { message: "Foto berhasil dihapus" };
  });
