import { join } from "path";
import { mkdirSync, unlinkSync, existsSync } from "fs";

// Resolve uploads dir relative to this file (4 levels up = project root)
const UPLOAD_DIR = join(import.meta.dir, "../../../../uploads");

// Validasi tipe file (hanya JPG/PNG)
export function isValidImageType(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  return allowedTypes.includes(file.type);
}

// Generate nama file unik
export function generateFileName(originalName: string): string {
  const parts = originalName.split(".");
  const ext = parts.length > 1 ? parts.pop() : "jpg";
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

  return `${subDir}/${fileName}`; // Return relative path
}

// Hapus file dari disk
export function deleteFile(relativePath: string): void {
  const fullPath = join(UPLOAD_DIR, relativePath);
  if (existsSync(fullPath)) {
    try {
      unlinkSync(fullPath);
    } catch {
      // Ignore errors if file already deleted
    }
  }
}
