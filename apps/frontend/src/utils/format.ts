// Format angka ke format Rupiah: 150000 → "Rp 150.000"
export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
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

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
