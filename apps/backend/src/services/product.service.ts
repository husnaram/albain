import db from "../database/connection";
import { deleteFile } from "../utils/file-upload";
import type {
  Product,
  ProductImage,
  ProductVariation,
  ProductWithRelations,
  CreateProductInput,
  UpdateProductInput,
  PaginatedProducts,
} from "../types/product";

export function getAllProducts(
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
): PaginatedProducts {
  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params: unknown[] = [];

  if (search) {
    whereClause += " AND (name LIKE ? OR main_sku LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status && (status === "active" || status === "inactive")) {
    whereClause += " AND status = ?";
    params.push(status);
  }

  const countQuery = db.query<{ count: number }, unknown[]>(
    `SELECT COUNT(*) as count FROM products ${whereClause}`
  );
  const countResult = countQuery.get(...params);
  const total = countResult?.count ?? 0;

  const dataQuery = db.query<Product, unknown[]>(
    `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  );
  const data = dataQuery.all(...params, limit, offset);

  return { data, total, page, limit };
}

export function getProductById(id: number): ProductWithRelations | null {
  const product = db
    .query<Product, [number]>("SELECT * FROM products WHERE id = ?")
    .get(id);

  if (!product) return null;

  const images = db
    .query<ProductImage, [number]>(
      "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC"
    )
    .all(id);

  const variations = db
    .query<ProductVariation, [number]>(
      "SELECT * FROM product_variations WHERE product_id = ? ORDER BY id ASC"
    )
    .all(id);

  return { ...product, images, variations };
}

export function createProduct(input: CreateProductInput): number {
  const transact = db.transaction(() => {
    const stmt = db.query<{ id: number }, unknown[]>(`
      INSERT INTO products (
        name, description, cost_price, selling_price, campaign_price,
        flash_sale_price, category, main_sku, status, affiliate_commission
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `);

    const result = stmt.get(
      input.name,
      input.description ?? "",
      input.cost_price,
      input.selling_price,
      input.campaign_price ?? null,
      input.flash_sale_price ?? null,
      input.category ?? "",
      input.main_sku,
      input.status ?? "active",
      input.affiliate_commission ?? 0
    );

    const productId = result!.id;

    if (input.variations && input.variations.length > 0) {
      const varStmt = db.query(`
        INSERT INTO product_variations (product_id, color, sku, stock, image_path)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const v of input.variations) {
        varStmt.run(
          productId,
          v.color,
          v.sku,
          v.stock,
          v.image_path ?? null
        );
      }
    }

    return productId;
  });

  return transact();
}

export function updateProduct(id: number, input: UpdateProductInput): void {
  const transact = db.transaction(() => {
    db.query(`
      UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        cost_price = COALESCE(?, cost_price),
        selling_price = COALESCE(?, selling_price),
        campaign_price = ?,
        flash_sale_price = ?,
        category = COALESCE(?, category),
        main_sku = COALESCE(?, main_sku),
        status = COALESCE(?, status),
        affiliate_commission = COALESCE(?, affiliate_commission),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      input.name ?? null,
      input.description ?? null,
      input.cost_price ?? null,
      input.selling_price ?? null,
      input.campaign_price !== undefined ? input.campaign_price : undefined,
      input.flash_sale_price !== undefined ? input.flash_sale_price : undefined,
      input.category ?? null,
      input.main_sku ?? null,
      input.status ?? null,
      input.affiliate_commission ?? null,
      id
    );

    // Replace variations if provided
    if (input.variations !== undefined) {
      // Delete old variation images
      const oldVariations = db
        .query<ProductVariation, [number]>(
          "SELECT * FROM product_variations WHERE product_id = ?"
        )
        .all(id);
      for (const v of oldVariations) {
        if (v.image_path) deleteFile(v.image_path);
      }

      db.query("DELETE FROM product_variations WHERE product_id = ?").run(id);

      if (input.variations.length > 0) {
        const varStmt = db.query(`
          INSERT INTO product_variations (product_id, color, sku, stock, image_path)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const v of input.variations) {
          varStmt.run(id, v.color, v.sku, v.stock, v.image_path ?? null);
        }
      }
    }
  });

  transact();
}

export function deleteProduct(id: number): void {
  // Get images to delete files
  const images = db
    .query<ProductImage, [number]>(
      "SELECT * FROM product_images WHERE product_id = ?"
    )
    .all(id);
  for (const img of images) {
    deleteFile(img.file_path);
  }

  // Get variation images to delete files
  const variations = db
    .query<ProductVariation, [number]>(
      "SELECT * FROM product_variations WHERE product_id = ?"
    )
    .all(id);
  for (const v of variations) {
    if (v.image_path) deleteFile(v.image_path);
  }

  db.query("DELETE FROM products WHERE id = ?").run(id);
}

export function addProductImage(
  productId: number,
  filePath: string,
  sortOrder: number = 0
): void {
  db.query(
    "INSERT INTO product_images (product_id, file_path, sort_order) VALUES (?, ?, ?)"
  ).run(productId, filePath, sortOrder);
}

export function deleteProductImage(
  productId: number,
  imageId: number
): void {
  const image = db
    .query<ProductImage, [number, number]>(
      "SELECT * FROM product_images WHERE id = ? AND product_id = ?"
    )
    .get(imageId, productId);

  if (image) {
    deleteFile(image.file_path);
    db.query("DELETE FROM product_images WHERE id = ?").run(imageId);
  }
}
