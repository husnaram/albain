# Albain — Product Knowledge Sub-Application

## Deskripsi Proyek

Aplikasi web internal kantor (~5 pengguna) yang akan dibangun secara bertahap.  
Sub-aplikasi pertama: **Product Knowledge** — sistem CRUD pengelolaan data produk.

---

## Tech Stack

| Layer     | Teknologi                          |
| --------- | ---------------------------------- |
| Runtime   | Bun                                |
| Backend   | Elysia                             |
| Database  | SQLite (via `bun:sqlite`)          |
| Frontend  | React + Vite                       |
| UI Library| Mantine v9                         |
| Monorepo  | Bun Workspaces                     |

---

## Struktur Proyek (Bun Workspaces)

```
albain/
├── package.json              # Root workspace config
├── bunfig.toml               # Bun config (optional)
├── .gitignore
├── issues.md
│
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts              # Elysia entry point
│   │       ├── database/
│   │       │   ├── connection.ts     # SQLite connection singleton
│   │       │   └── migrations/
│   │       │       └── 001_create_products.ts
│   │       ├── routes/
│   │       │   └── products.ts       # Product CRUD routes
│   │       ├── services/
│   │       │   └── product.service.ts
│   │       └── utils/
│   │           └── file-upload.ts    # File upload helper
│   │
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── postcss.config.mjs
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── theme.ts              # Mantine custom theme
│           ├── api/
│           │   └── products.ts       # API client functions
│           ├── components/
│           │   ├── layout/
│           │   │   └── AppLayout.tsx  # AppShell layout
│           │   └── products/
│           │       ├── ProductForm.tsx
│           │       ├── ProductTable.tsx
│           │       ├── ProductDetail.tsx
│           │       ├── ProductImageSlider.tsx
│           │       ├── VariationFormSection.tsx
│           │       └── RupiahInput.tsx
│           ├── pages/
│           │   ├── ProductListPage.tsx
│           │   ├── ProductCreatePage.tsx
│           │   ├── ProductEditPage.tsx
│           │   └── ProductDetailPage.tsx
│           └── utils/
│               └── format.ts         # Rupiah formatter, dll
│
└── uploads/                          # Direktori penyimpanan foto (root level)
    ├── products/
    └── variations/
```

---

## Database Schema

### Tabel: `products`

| Column               | Type     | Constraint                    | Keterangan            |
| -------------------- | -------- | ----------------------------- | --------------------- |
| `id`                 | INTEGER  | PRIMARY KEY AUTOINCREMENT     |                       |
| `name`               | TEXT     | NOT NULL                      | Nama Produk           |
| `description`        | TEXT     | DEFAULT ''                    | Markdown              |
| `cost_price`         | INTEGER  | NOT NULL DEFAULT 0            | HPP (dalam Rupiah)    |
| `selling_price`      | INTEGER  | NOT NULL DEFAULT 0            | Harga Jual            |
| `campaign_price`     | INTEGER  | DEFAULT NULL                  | Harga Kampanye        |
| `flash_sale_price`   | INTEGER  | DEFAULT NULL                  | Harga Flash Sale      |
| `category`           | TEXT     | DEFAULT ''                    | Kategori Produk       |
| `main_sku`           | TEXT     | NOT NULL UNIQUE               | SKU Utama             |
| `status`             | TEXT     | NOT NULL DEFAULT 'active'     | 'active'/'inactive'   |
| `affiliate_commission` | REAL   | DEFAULT 0                     | Persentase (0-100)    |
| `created_at`         | TEXT     | DEFAULT (datetime('now'))     | ISO 8601              |
| `updated_at`         | TEXT     | DEFAULT (datetime('now'))     | ISO 8601              |

> **Catatan Penyimpanan Harga:** Semua harga disimpan sebagai **INTEGER** dalam satuan Rupiah penuh (tanpa desimal). Ini menghindari masalah floating point. Tampilan format "Rp 150.000" dilakukan di frontend.

### Tabel: `product_images`

| Column       | Type     | Constraint                      | Keterangan                 |
| ------------ | -------- | ------------------------------- | -------------------------- |
| `id`         | INTEGER  | PRIMARY KEY AUTOINCREMENT       |                            |
| `product_id` | INTEGER  | NOT NULL, FK → products(id)     | ON DELETE CASCADE          |
| `file_path`  | TEXT     | NOT NULL                        | Path relatif ke file       |
| `sort_order` | INTEGER  | DEFAULT 0                       | Urutan tampil di slider    |
| `created_at` | TEXT     | DEFAULT (datetime('now'))       |                            |

### Tabel: `product_variations`

| Column           | Type     | Constraint                      | Keterangan                 |
| ---------------- | -------- | ------------------------------- | -------------------------- |
| `id`             | INTEGER  | PRIMARY KEY AUTOINCREMENT       |                            |
| `product_id`     | INTEGER  | NOT NULL, FK → products(id)     | ON DELETE CASCADE          |
| `color`          | TEXT     | NOT NULL                        | Nama warna                 |
| `sku`            | TEXT     | NOT NULL                        | SKU variasi                |
| `stock`          | INTEGER  | NOT NULL DEFAULT 0              |                            |
| `image_path`     | TEXT     | DEFAULT NULL                    | 1 foto per variasi         |
| `created_at`     | TEXT     | DEFAULT (datetime('now'))       |                            |

---

## API Endpoints

Base URL: `http://localhost:3000/api`

### Products

| Method   | Endpoint                  | Deskripsi                          |
| -------- | ------------------------- | ---------------------------------- |
| `GET`    | `/products`               | List semua produk (+ pagination)   |
| `GET`    | `/products/:id`           | Detail 1 produk + images + variasi |
| `POST`   | `/products`               | Buat produk baru (multipart/form)  |
| `PUT`    | `/products/:id`           | Update produk (multipart/form)     |
| `DELETE` | `/products/:id`           | Hapus produk + cascade images/var  |

### Product Images

| Method   | Endpoint                           | Deskripsi                     |
| -------- | ---------------------------------- | ----------------------------- |
| `POST`   | `/products/:id/images`             | Upload foto produk            |
| `DELETE` | `/products/:id/images/:imageId`    | Hapus 1 foto produk           |

### Static Files

| Method | Endpoint              | Deskripsi                 |
| ------ | --------------------- | ------------------------- |
| `GET`  | `/uploads/*`          | Serve file statis (foto)  |

---

## Implementasi Step-by-Step

Setiap step di bawah adalah **1 commit**. Ikuti secara berurutan.

---

### Step 1 — Inisialisasi Monorepo & Konfigurasi Dasar

**Tujuan:** Setup Bun Workspaces monorepo dengan dua workspace: `backend` dan `frontend`.

**Detail tugas:**

1. **Buat `package.json` root:**
   ```json
   {
     "name": "albain",
     "private": true,
     "workspaces": ["apps/*"]
   }
   ```

2. **Buat `.gitignore`:**
   ```
   node_modules/
   dist/
   .DS_Store
   *.db
   *.db-journal
   uploads/products/*
   uploads/variations/*
   !uploads/products/.gitkeep
   !uploads/variations/.gitkeep
   bun.lock
   ```

3. **Buat direktori uploads:**
   ```
   uploads/products/.gitkeep
   uploads/variations/.gitkeep
   ```

4. **Inisialisasi backend workspace (`apps/backend/`):**
   - Buat `apps/backend/package.json`:
     ```json
     {
       "name": "@albain/backend",
       "version": "0.1.0",
       "private": true,
       "scripts": {
         "dev": "bun run --watch src/index.ts",
         "start": "bun run src/index.ts"
       },
       "dependencies": {
         "elysia": "latest",
         "@elysiajs/cors": "latest",
         "@elysiajs/static": "latest"
       },
       "devDependencies": {
         "@types/bun": "latest"
       }
     }
     ```
   - Buat `apps/backend/tsconfig.json`:
     ```json
     {
       "compilerOptions": {
         "target": "ESNext",
         "module": "ESNext",
         "moduleResolution": "bundler",
         "strict": true,
         "esModuleInterop": true,
         "skipLibCheck": true,
         "forceConsistentCasingInFileNames": true,
         "outDir": "./dist",
         "rootDir": "./src",
         "types": ["bun-types"]
       },
       "include": ["src/**/*"]
     }
     ```
   - Buat `apps/backend/src/index.ts` (minimal Elysia server):
     ```typescript
     import { Elysia } from "elysia";
     import { cors } from "@elysiajs/cors";

     const app = new Elysia()
       .use(cors())
       .get("/", () => ({ message: "Albain API is running" }))
       .listen(3000);

     console.log(`🚀 Albain API running at http://localhost:${app.server?.port}`);
     ```

5. **Inisialisasi frontend workspace (`apps/frontend/`):**
   - Jalankan: `bun create vite@latest apps/frontend --template react-ts`
   - Update `apps/frontend/package.json`, tambahkan name: `@albain/frontend`
   - Install Mantine:
     ```bash
     cd apps/frontend
     bun add @mantine/core @mantine/hooks @mantine/form @mantine/dropzone @mantine/carousel @mantine/notifications @mantine/tiptap
     bun add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-highlight @tiptap/extension-underline
     bun add embla-carousel-react
     bun add react-router
     bun add @tabler/icons-react
     bun add postcss postcss-preset-mantine postcss-simple-vars -D
     ```
   - Buat `apps/frontend/postcss.config.mjs`:
     ```javascript
     export default {
       plugins: {
         "postcss-preset-mantine": {},
         "postcss-simple-vars": {
           variables: {
             "mantine-breakpoint-xs": "36em",
             "mantine-breakpoint-sm": "48em",
             "mantine-breakpoint-md": "62em",
             "mantine-breakpoint-lg": "75em",
             "mantine-breakpoint-xl": "88em",
           },
         },
       },
     };
     ```

6. **Install semua dependencies dari root:**
   ```bash
   bun install
   ```

7. **Verifikasi:**
   - `cd apps/backend && bun run dev` → server berjalan di port 3000
   - `cd apps/frontend && bun run dev` → Vite dev server berjalan

8. **Commit:**
   ```
   feat: initialize monorepo with backend (Elysia) and frontend (React + Mantine)
   ```

---

### Step 2 — Database Schema & Migration

**Tujuan:** Setup koneksi SQLite dan buat tabel database.

**Detail tugas:**

1. **Buat `apps/backend/src/database/connection.ts`:**
   ```typescript
   import { Database } from "bun:sqlite";
   import { join } from "path";

   const DB_PATH = join(import.meta.dir, "../../../../data/albain.db");

   // Pastikan direktori data ada
   const dataDir = join(import.meta.dir, "../../../../data");
   import { mkdirSync } from "fs";
   mkdirSync(dataDir, { recursive: true });

   const db = new Database(DB_PATH, { create: true });

   // Enable WAL mode untuk performa lebih baik
   db.run("PRAGMA journal_mode = WAL");
   db.run("PRAGMA foreign_keys = ON");

   export default db;
   ```

2. **Buat `apps/backend/src/database/migrations/001_create_products.ts`:**
   ```typescript
   import db from "../connection";

   export function migrate() {
     db.run(`
       CREATE TABLE IF NOT EXISTS products (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         description TEXT DEFAULT '',
         cost_price INTEGER NOT NULL DEFAULT 0,
         selling_price INTEGER NOT NULL DEFAULT 0,
         campaign_price INTEGER DEFAULT NULL,
         flash_sale_price INTEGER DEFAULT NULL,
         category TEXT DEFAULT '',
         main_sku TEXT NOT NULL UNIQUE,
         status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
         affiliate_commission REAL DEFAULT 0,
         created_at TEXT DEFAULT (datetime('now')),
         updated_at TEXT DEFAULT (datetime('now'))
       )
     `);

     db.run(`
       CREATE TABLE IF NOT EXISTS product_images (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         product_id INTEGER NOT NULL,
         file_path TEXT NOT NULL,
         sort_order INTEGER DEFAULT 0,
         created_at TEXT DEFAULT (datetime('now')),
         FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
       )
     `);

     db.run(`
       CREATE TABLE IF NOT EXISTS product_variations (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         product_id INTEGER NOT NULL,
         color TEXT NOT NULL,
         sku TEXT NOT NULL,
         stock INTEGER NOT NULL DEFAULT 0,
         image_path TEXT DEFAULT NULL,
         created_at TEXT DEFAULT (datetime('now')),
         FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
       )
     `);

     console.log("✅ Database migration completed");
   }
   ```

3. **Buat `apps/backend/src/database/index.ts`:**
   ```typescript
   import db from "./connection";
   import { migrate } from "./migrations/001_create_products";

   export function initializeDatabase() {
     migrate();
     return db;
   }

   export default db;
   ```

4. **Update `apps/backend/src/index.ts`** — panggil `initializeDatabase()` saat startup.

5. **Update `.gitignore`** — tambahkan `data/*.db` dan `data/*.db-journal`.

6. **Buat direktori `data/` dengan `.gitkeep`.**

7. **Verifikasi:** Jalankan `bun run dev` di backend, pastikan pesan migration muncul dan file `data/albain.db` terbuat.

8. **Commit:**
   ```
   feat: setup SQLite database with products schema and migrations
   ```

---

### Step 3 — Backend: Product Service Layer

**Tujuan:** Buat service layer (business logic) untuk operasi CRUD produk.

**Detail tugas:**

1. **Buat `apps/backend/src/types/product.ts`:**
   - Definisikan TypeScript interfaces:
     - `Product` — representasi row di tabel products
     - `ProductImage` — representasi row di tabel product_images
     - `ProductVariation` — representasi row di tabel product_variations
     - `ProductWithRelations` — Product + images[] + variations[]
     - `CreateProductInput` — input untuk buat produk baru
     - `UpdateProductInput` — input untuk update produk

2. **Buat `apps/backend/src/services/product.service.ts`:**
   - Fungsi `getAllProducts(page, limit, search?, status?)`:
     - Query ke tabel products dengan pagination
     - Return `{ data: Product[], total: number, page: number, limit: number }`
   - Fungsi `getProductById(id)`:
     - Query products JOIN product_images JOIN product_variations
     - Return `ProductWithRelations | null`
   - Fungsi `createProduct(input: CreateProductInput)`:
     - INSERT ke products
     - INSERT ke product_variations (loop per variasi)
     - Return product id
     - Gunakan **transaction** (`db.transaction(...)`)
   - Fungsi `updateProduct(id, input: UpdateProductInput)`:
     - UPDATE products
     - DELETE existing variations, INSERT ulang (replace strategy)
     - Update `updated_at` timestamp
     - Gunakan **transaction**
   - Fungsi `deleteProduct(id)`:
     - Hapus file foto dari filesystem (products/ dan variations/)
     - DELETE dari database (cascade akan handle relasi)
   - Fungsi `addProductImage(productId, filePath, sortOrder)`:
     - INSERT ke product_images
   - Fungsi `deleteProductImage(productId, imageId)`:
     - Hapus file dari filesystem
     - DELETE dari database

3. **Verifikasi:** Buat test sederhana atau log output manual.

4. **Commit:**
   ```
   feat: implement product service layer with CRUD operations
   ```

---

### Step 4 — Backend: File Upload Utility

**Tujuan:** Buat helper untuk menangani upload file foto.

**Detail tugas:**

1. **Buat `apps/backend/src/utils/file-upload.ts`:**
   ```typescript
   import { join } from "path";
   import { mkdirSync, unlinkSync, existsSync } from "fs";

   const UPLOAD_DIR = join(import.meta.dir, "../../../../uploads");

   // Validasi tipe file (hanya JPG/PNG)
   export function isValidImageType(file: File): boolean {
     const allowedTypes = ["image/jpeg", "image/png"];
     return allowedTypes.includes(file.type);
   }

   // Generate nama file unik
   export function generateFileName(originalName: string): string {
     const ext = originalName.split(".").pop();
     const timestamp = Date.now();
     const random = Math.random().toString(36).substring(2, 8);
     return `${timestamp}-${random}.${ext}`;
   }

   // Simpan file ke disk
   export async function saveFile(
     file: File,
     subDir: "products" | "variations"
   ): Promise<string> {
     const dir = join(UPLOAD_DIR, subDir);
     mkdirSync(dir, { recursive: true });

     const fileName = generateFileName(file.name);
     const filePath = join(dir, fileName);

     const buffer = await file.arrayBuffer();
     await Bun.write(filePath, buffer);

     return `${subDir}/${fileName}`;  // Return path relatif
   }

   // Hapus file dari disk
   export function deleteFile(relativePath: string): void {
     const fullPath = join(UPLOAD_DIR, relativePath);
     if (existsSync(fullPath)) {
       unlinkSync(fullPath);
     }
   }
   ```

2. **Verifikasi:** Test upload file manual via curl atau script.

3. **Commit:**
   ```
   feat: implement file upload utility for image handling
   ```

---

### Step 5 — Backend: Product API Routes

**Tujuan:** Buat endpoint REST API menggunakan Elysia.

**Detail tugas:**

1. **Buat `apps/backend/src/routes/products.ts`:**
   ```typescript
   import { Elysia, t } from "elysia";
   import * as productService from "../services/product.service";
   import { saveFile, deleteFile, isValidImageType } from "../utils/file-upload";

   export const productRoutes = new Elysia({ prefix: "/api/products" })

     // GET /api/products — List produk
     .get("/", ({ query }) => {
       const page = Number(query.page) || 1;
       const limit = Number(query.limit) || 10;
       const search = query.search || undefined;
       const status = query.status || undefined;
       return productService.getAllProducts(page, limit, search, status);
     })

     // GET /api/products/:id — Detail produk
     .get("/:id", ({ params }) => {
       const product = productService.getProductById(Number(params.id));
       if (!product) {
         return new Response(JSON.stringify({ error: "Product not found" }), {
           status: 404,
         });
       }
       return product;
     })

     // POST /api/products — Buat produk baru
     .post("/", async ({ body }) => {
       // body berupa FormData karena ada file upload
       // Parse fields dan files dari FormData
       // Simpan product images
       // Simpan variation images
       // Panggil productService.createProduct(...)
       // Return { id, message: "Product created" }
     })

     // PUT /api/products/:id — Update produk
     .put("/:id", async ({ params, body }) => {
       // Mirip POST, tapi update
       // Handle penambahan/penghapusan foto
       // Panggil productService.updateProduct(...)
     })

     // DELETE /api/products/:id — Hapus produk
     .delete("/:id", ({ params }) => {
       productService.deleteProduct(Number(params.id));
       return { message: "Product deleted" };
     })

     // POST /api/products/:id/images — Upload foto produk
     .post("/:id/images", async ({ params, body }) => {
       // Upload satu atau banyak foto
       // Simpan ke uploads/products/
       // Insert ke product_images
     })

     // DELETE /api/products/:id/images/:imageId — Hapus 1 foto
     .delete("/:id/images/:imageId", ({ params }) => {
       productService.deleteProductImage(
         Number(params.id),
         Number(params.imageId)
       );
       return { message: "Image deleted" };
     });
   ```

2. **Update `apps/backend/src/index.ts`:**
   - Import dan `.use(productRoutes)`
   - Tambahkan static plugin untuk serve uploads:
     ```typescript
     import { staticPlugin } from "@elysiajs/static";

     app.use(staticPlugin({
       assets: "../../uploads",
       prefix: "/uploads",
     }));
     ```

3. **Verifikasi:** Test tiap endpoint dengan `curl` atau HTTP client:
   - `curl http://localhost:3000/api/products`
   - `curl -X POST http://localhost:3000/api/products -F "name=Test" -F "main_sku=SKU001" ...`

4. **Commit:**
   ```
   feat: implement product REST API routes with file upload support
   ```

---

### Step 6 — Frontend: Layout & Routing Setup

**Tujuan:** Konfigurasi Mantine, React Router, dan layout utama aplikasi.

**Detail tugas:**

1. **Update `apps/frontend/src/main.tsx`:**
   ```tsx
   import React from "react";
   import ReactDOM from "react-dom/client";
   import { MantineProvider } from "@mantine/core";
   import { Notifications } from "@mantine/notifications";
   import { BrowserRouter } from "react-router";
   import { theme } from "./theme";
   import App from "./App";

   import "@mantine/core/styles.css";
   import "@mantine/carousel/styles.css";
   import "@mantine/dropzone/styles.css";
   import "@mantine/notifications/styles.css";
   import "@mantine/tiptap/styles.css";

   ReactDOM.createRoot(document.getElementById("root")!).render(
     <React.StrictMode>
       <MantineProvider theme={theme} defaultColorScheme="dark">
         <Notifications position="top-right" />
         <BrowserRouter>
           <App />
         </BrowserRouter>
       </MantineProvider>
     </React.StrictMode>
   );
   ```

2. **Buat `apps/frontend/src/theme.ts`:**
   - Konfigurasi custom theme Mantine (warna, font, primary color, dll)
   - Gunakan font modern (Inter/Plus Jakarta Sans dari Google Fonts)
   - Tema dark sebagai default

3. **Buat `apps/frontend/src/components/layout/AppLayout.tsx`:**
   - Gunakan `AppShell` dari Mantine
   - Header: Logo "Albain" + dark mode toggle
   - Navbar (sidebar): Menu navigasi
     - Beranda (placeholder untuk masa depan)
     - Product Knowledge (aktif)
   - Main content: `<Outlet />`
   - Responsive: sidebar collapse di mobile

4. **Update `apps/frontend/src/App.tsx`:**
   ```tsx
   import { Routes, Route } from "react-router";
   import { AppLayout } from "./components/layout/AppLayout";
   import { ProductListPage } from "./pages/ProductListPage";
   import { ProductCreatePage } from "./pages/ProductCreatePage";
   import { ProductEditPage } from "./pages/ProductEditPage";
   import { ProductDetailPage } from "./pages/ProductDetailPage";

   export default function App() {
     return (
       <Routes>
         <Route element={<AppLayout />}>
           <Route path="/" element={<ProductListPage />} />
           <Route path="/products" element={<ProductListPage />} />
           <Route path="/products/new" element={<ProductCreatePage />} />
           <Route path="/products/:id" element={<ProductDetailPage />} />
           <Route path="/products/:id/edit" element={<ProductEditPage />} />
         </Route>
       </Routes>
     );
   }
   ```

5. **Buat halaman placeholder** untuk setiap page (isinya cukup `<Title>Nama Halaman</Title>` sementara).

6. **Konfigurasi Vite proxy** di `vite.config.ts`:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 5173,
       proxy: {
         "/api": "http://localhost:3000",
         "/uploads": "http://localhost:3000",
       },
     },
   });
   ```

7. **Verifikasi:** Jalankan frontend, pastikan layout muncul dan navigasi berfungsi.

8. **Commit:**
   ```
   feat: setup frontend layout, routing, and Mantine theming
   ```

---

### Step 7 — Frontend: API Client & Utilities

**Tujuan:** Buat fungsi-fungsi untuk komunikasi dengan backend API.

**Detail tugas:**

1. **Buat `apps/frontend/src/api/products.ts`:**
   ```typescript
   const API_BASE = "/api/products";

   export async function fetchProducts(params?: {
     page?: number;
     limit?: number;
     search?: string;
     status?: string;
   }) { /* GET /api/products?... */ }

   export async function fetchProduct(id: number) { /* GET /api/products/:id */ }

   export async function createProduct(formData: FormData) { /* POST /api/products */ }

   export async function updateProduct(id: number, formData: FormData) { /* PUT /api/products/:id */ }

   export async function deleteProduct(id: number) { /* DELETE /api/products/:id */ }

   export async function uploadProductImages(id: number, files: File[]) { /* POST /api/products/:id/images */ }

   export async function deleteProductImage(productId: number, imageId: number) { /* DELETE /api/products/:id/images/:imageId */ }
   ```

2. **Buat `apps/frontend/src/utils/format.ts`:**
   ```typescript
   // Format angka ke format Rupiah: 150000 → "Rp 150.000"
   export function formatRupiah(value: number): string {
     return new Intl.NumberFormat("id-ID", {
       style: "currency",
       currency: "IDR",
       minimumFractionDigits: 0,
       maximumFractionDigits: 0,
     }).format(value);
   }

   // Parse string Rupiah kembali ke angka: "150.000" → 150000
   export function parseRupiah(value: string): number {
     return Number(value.replace(/[^0-9]/g, ""));
   }

   // Format tanggal ke format Indonesia
   export function formatDate(dateString: string): string {
     return new Date(dateString).toLocaleDateString("id-ID", {
       day: "numeric",
       month: "long",
       year: "numeric",
       hour: "2-digit",
       minute: "2-digit",
     });
   }
   ```

3. **Buat `apps/frontend/src/types/product.ts`:**
   - Definisikan TypeScript interfaces yang mirror dengan backend types

4. **Commit:**
   ```
   feat: implement API client and utility functions for frontend
   ```

---

### Step 8 — Frontend: Komponen Reusable

**Tujuan:** Buat komponen-komponen yang akan digunakan di halaman produk.

**Detail tugas:**

1. **Buat `apps/frontend/src/components/products/RupiahInput.tsx`:**
   - Input angka dengan format Rupiah otomatis
   - Saat user mengetik, tampilkan "Rp 150.000"
   - Gunakan `NumberInput` dari Mantine dengan custom formatter
   - Prefix "Rp" dan thousand separator "."

2. **Buat `apps/frontend/src/components/products/ProductImageSlider.tsx`:**
   - Gunakan `@mantine/carousel` (Carousel dari Embla)
   - Tampilkan array gambar produk dalam slider
   - Tampilkan dots indicator dan arrow navigation
   - Jika tidak ada gambar, tampilkan placeholder
   - Klik gambar → buka modal preview (opsional)

3. **Buat `apps/frontend/src/components/products/VariationFormSection.tsx`:**
   - Section form untuk mengelola variasi produk
   - Tombol "Tambah Variasi"
   - Tiap variasi berisi:
     - Input Warna (TextInput)
     - Input SKU (TextInput)
     - Input Stok (NumberInput)
     - Upload foto variasi (Dropzone, max 1 file, JPG/PNG only)
   - Tombol hapus variasi (per-row)
   - Gunakan `useForm` list management dari Mantine

4. **Buat komponen Markdown Editor:**
   - Gunakan `@mantine/tiptap` dengan `RichTextEditor`
   - Toolbar: Bold, Italic, Underline, Heading, BulletList, OrderedList, Link, Code
   - Content disimpan sebagai Markdown string
   - Atau alternatif sederhana: gunakan `Textarea` biasa dengan preview Markdown

5. **Commit:**
   ```
   feat: build reusable product components (RupiahInput, ImageSlider, VariationForm)
   ```

---

### Step 9 — Frontend: Halaman Daftar Produk

**Tujuan:** Implementasi halaman utama yang menampilkan daftar produk.

**Detail tugas:**

1. **Implementasi `apps/frontend/src/pages/ProductListPage.tsx`:**
   - Fetch data dari `GET /api/products`
   - Tampilkan dalam tabel Mantine (`Table`) dengan kolom:
     - Foto (thumbnail gambar pertama)
     - Nama Produk
     - SKU Utama
     - Kategori
     - Harga Jual (format Rupiah)
     - Status (Badge: hijau untuk Active, merah untuk Non Active)
     - Aksi (View, Edit, Delete — icon buttons)
   - Search bar di atas tabel (cari berdasar nama/SKU)
   - Filter status (Active / Non Active / Semua)
   - Pagination di bawah tabel
   - Tombol "Tambah Produk Baru" (navigasi ke /products/new)
   - Empty state: tampilkan pesan jika belum ada produk
   - Konfirmasi dialog saat delete (Modal Mantine)

2. **UI/UX:**
   - Label dan teks dalam Bahasa Indonesia
   - Animasi hover pada row tabel
   - Loading skeleton saat fetch data
   - Notifications (toast) saat berhasil/gagal delete

3. **Commit:**
   ```
   feat: implement product list page with search, filter, and pagination
   ```

---

### Step 10 — Frontend: Halaman Buat & Edit Produk

**Tujuan:** Implementasi form untuk membuat dan mengedit produk.

**Detail tugas:**

1. **Buat `apps/frontend/src/components/products/ProductForm.tsx`:**
   - Form komponen yang digunakan bersama oleh Create dan Edit page
   - Gunakan `@mantine/form` (`useForm`) untuk state management
   - Field-field:
     - Nama Produk → `TextInput` (wajib)
     - SKU Utama → `TextInput` (wajib)
     - Deskripsi Produk → `RichTextEditor` / `Textarea` (Markdown)
     - HPP → `RupiahInput` (wajib)
     - Harga Jual → `RupiahInput` (wajib)
     - Harga Kampanye → `RupiahInput` (opsional)
     - Harga Flash Sale → `RupiahInput` (opsional)
     - Kategori Produk → `TextInput` atau `Select`
     - Status Produk → `Select` (Active / Non Active)
     - Komisi Affiliate → `NumberInput` dengan suffix "%"
     - Foto Produk → `Dropzone` (multi-file, JPG/PNG)
       - Preview thumbnail foto yang di-upload
       - Tombol hapus per-foto
       - Saat edit: tampilkan foto existing + bisa tambah baru
     - Variasi → `VariationFormSection`
   - Validasi form:
     - Nama Produk wajib diisi
     - SKU Utama wajib diisi
     - HPP wajib diisi, tidak boleh negatif
     - Harga Jual wajib diisi, tidak boleh negatif
     - Komisi Affiliate: 0-100
   - Submit: kirim sebagai `FormData` (karena ada file upload)

2. **Implementasi `apps/frontend/src/pages/ProductCreatePage.tsx`:**
   - Title: "Tambah Produk Baru"
   - Render `ProductForm` dengan mode create
   - On submit: panggil `createProduct()`, redirect ke list on success
   - Tampilkan notification sukses/error

3. **Implementasi `apps/frontend/src/pages/ProductEditPage.tsx`:**
   - Title: "Edit Produk"
   - Fetch data produk existing (useEffect + fetchProduct)
   - Loading state saat fetch
   - Render `ProductForm` dengan mode edit, pre-fill data
   - On submit: panggil `updateProduct()`, redirect ke detail on success
   - Tampilkan notification sukses/error

4. **Commit:**
   ```
   feat: implement product create and edit pages with form validation
   ```

---

### Step 11 — Frontend: Halaman Detail Produk

**Tujuan:** Halaman untuk melihat detail lengkap produk.

**Detail tugas:**

1. **Implementasi `apps/frontend/src/pages/ProductDetailPage.tsx`:**
   - Fetch data produk dari `GET /api/products/:id`
   - Layout:
     - Baris atas: Nama Produk + Badge Status + tombol Edit & Delete
     - Kiri: Image Slider (`ProductImageSlider`)
     - Kanan: Info produk dalam grid/card:
       - SKU Utama
       - Kategori
       - HPP (format Rupiah)
       - Harga Jual (format Rupiah)
       - Harga Kampanye (format Rupiah, jika ada)
       - Harga Flash Sale (format Rupiah, jika ada)
       - Komisi Affiliate (%)
     - Bawah: Deskripsi (render Markdown → HTML)
     - Bawah: Tabel Variasi
       - Warna | SKU | Stok | Foto
       - Foto variasi ditampilkan sebagai small thumbnail
     - Footer: Dibuat Pada, Diperbarui Pada (format tanggal Indonesia)
   - Loading skeleton saat fetch
   - 404 state jika produk tidak ditemukan
   - Konfirmasi dialog saat delete

2. **Untuk render Markdown:**
   - Gunakan library ringan seperti `marked` atau `react-markdown`
   - Install: `bun add react-markdown`
   - Render `<ReactMarkdown>{product.description}</ReactMarkdown>`

3. **Commit:**
   ```
   feat: implement product detail page with image slider and markdown rendering
   ```

---

### Step 12 — Polish & Final Testing

**Tujuan:** Penyempurnaan UI/UX dan testing end-to-end.

**Detail tugas:**

1. **UI Polish:**
   - Pastikan semua teks tampilan dalam Bahasa Indonesia
   - Pastikan dark mode berfungsi dengan baik di semua halaman
   - Tambahkan micro-animations (hover effect, transition)
   - Responsive design: test di berbagai ukuran layar
   - Empty state yang informatif di setiap halaman
   - Loading states yang smooth (skeleton, spinner)

2. **Error Handling:**
   - Tampilkan error notification (toast) jika API gagal
   - Form validation error messages dalam Bahasa Indonesia
   - Handle network error (backend mati)

3. **Testing End-to-End (Manual):**
   - [ ] Buat produk baru dengan semua field terisi
   - [ ] Upload beberapa foto produk
   - [ ] Tambah variasi dengan foto
   - [ ] Lihat detail produk — pastikan slider & semua data tampil benar
   - [ ] Edit produk — ubah beberapa field, tambah/hapus foto
   - [ ] Hapus foto produk individu
   - [ ] Filter dan search di halaman daftar
   - [ ] Pagination berfungsi
   - [ ] Hapus produk — pastikan foto ikut terhapus
   - [ ] Test dengan status Active dan Non Active

4. **Commit:**
   ```
   feat: polish UI/UX and complete product knowledge sub-application
   ```

---

## Masukan & Rekomendasi

1. **Kategori Produk sebagai Master Data:** Saat ini kategori disimpan sebagai `TEXT` bebas di tabel products. Ke depan, disarankan membuat tabel `categories` terpisah agar kategori bisa dikelola (CRUD) dan konsisten. Untuk MVP ini, menggunakan `TextInput` atau `Select` dengan opsi statis sudah cukup.

2. **Keamanan Upload File:** Saat ini tidak ada autentikasi. Karena hanya digunakan 5 orang internal, ini aman untuk awal. Tapi pertimbangkan menambahkan autentikasi (login sederhana) di iterasi berikutnya.

3. **Backup Database:** SQLite menyimpan data dalam 1 file (`data/albain.db`). Mudah untuk backup — cukup copy file tersebut. Pertimbangkan setup backup otomatis (cron job/scheduled task).

4. **Optimisasi Gambar:** Untuk MVP, gambar disimpan as-is. Ke depan, bisa ditambahkan kompresi gambar saat upload (menggunakan `sharp` atau library sejenis) untuk menghemat storage.

5. **Pencarian Full-Text:** SQLite mendukung FTS5 (Full-Text Search). Jika data produk membesar, pertimbangkan migrasi pencarian ke FTS5 untuk performa lebih baik.

---

## Cara Menjalankan Aplikasi

```bash
# Install semua dependencies
bun install

# Terminal 1: Jalankan backend
cd apps/backend && bun run dev

# Terminal 2: Jalankan frontend
cd apps/frontend && bun run dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Frontend sudah dikonfigurasi proxy ke backend, jadi akses API dari frontend berjalan otomatis.