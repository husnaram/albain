import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Badge,
  Group,
  Text,
  TextInput,
  Select,
  Table,
  Pagination,
  ActionIcon,
  Skeleton,
  Stack,
  Title,
  Modal,
  Tooltip,
  Center,
  Paper,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import {
  IconSearch,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconPackage,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { fetchProducts, deleteProduct } from "../api/products";
import { ImageThumbnailGrid } from "../components/products/ProductImageSlider";
import { formatRupiah } from "../utils/format";
import type { Product } from "../types/product";
import type { ProductImage } from "../types/product";

// Extended product with images for list view
interface ProductListItem extends Product {
  images?: ProductImage[];
}

export function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const limit = 10;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchProducts({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setProducts(result.data as ProductListItem[]);
      setTotal(result.total);
    } catch {
      notifications.show({
        title: "Gagal memuat data",
        message: "Terjadi kesalahan saat mengambil data produk",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleteId);
      notifications.show({
        title: "Berhasil",
        message: "Produk berhasil dihapus",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      setDeleteId(null);
      loadProducts();
    } catch (err) {
      notifications.show({
        title: "Gagal menghapus",
        message: err instanceof Error ? err.message : "Terjadi kesalahan",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const rows = loading
    ? Array.from({ length: 5 }).map((_, i) => (
        <Table.Tr key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <Table.Td key={j}>
              <Skeleton height={16} radius="sm" />
            </Table.Td>
          ))}
        </Table.Tr>
      ))
    : products.map((product) => (
        <Table.Tr
          key={product.id}
          style={{
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--mantine-color-dark-6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "";
          }}
        >
          <Table.Td>
            <ImageThumbnailGrid images={(product as any).images ?? []} size={48} />
          </Table.Td>
          <Table.Td>
            <Text fw={500} size="sm" lineClamp={1}>
              {product.name}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm" ff="monospace" c="dimmed">
              {product.main_sku}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm" c="dimmed">
              {product.category || "-"}
            </Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm" fw={500}>
              {formatRupiah(product.selling_price)}
            </Text>
          </Table.Td>
          <Table.Td>
            <Badge
              color={product.status === "active" ? "green" : "red"}
              variant="light"
              size="sm"
            >
              {product.status === "active" ? "Aktif" : "Non Aktif"}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Group gap={4} wrap="nowrap">
              <Tooltip label="Lihat Detail" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="sm"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Edit" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="yellow"
                  size="sm"
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Hapus" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() => setDeleteId(product.id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        </Table.Tr>
      ));

  return (
    <Box>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <Box>
          <Title order={2} mb={4}>
            Product Knowledge
          </Title>
          <Text c="dimmed" size="sm">
            Kelola data produk perusahaan
          </Text>
        </Box>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => navigate("/products/new")}
          size="md"
          radius="md"
        >
          Tambah Produk
        </Button>
      </Group>

      {/* Filters */}
      <Paper withBorder p="sm" radius="md" mb="md">
        <Group gap="sm">
          <TextInput
            placeholder="Cari nama produk atau SKU..."
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ flex: 1 }}
            size="sm"
          />
          <Select
            placeholder="Semua Status"
            data={[
              { value: "", label: "Semua Status" },
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Non Aktif" },
            ]}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            clearable
            size="sm"
            w={160}
          />
          <Button onClick={handleSearch} size="sm" variant="light">
            Cari
          </Button>
          {(search || statusFilter) && (
            <Button
              size="sm"
              variant="subtle"
              color="gray"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setStatusFilter(null);
                setPage(1);
              }}
            >
              Reset
            </Button>
          )}
        </Group>
      </Paper>

      {/* Table */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Table highlightOnHover striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>Foto</Table.Th>
              <Table.Th>Nama Produk</Table.Th>
              <Table.Th>SKU Utama</Table.Th>
              <Table.Th>Kategori</Table.Th>
              <Table.Th>Harga Jual</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th w={100}>Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!loading && products.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Center py={60}>
                    <Stack align="center" gap="xs">
                      <IconPackage size={48} color="var(--mantine-color-dimmed)" />
                      <Text c="dimmed" fw={500}>
                        Belum ada produk
                      </Text>
                      <Text c="dimmed" size="sm">
                        {search || statusFilter
                          ? "Tidak ada produk yang sesuai filter"
                          : "Klik tombol Tambah Produk untuk mulai"}
                      </Text>
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Pagination + Info */}
      {total > 0 && (
        <Group justify="space-between" mt="md">
          <Text size="sm" c="dimmed">
            Menampilkan {(page - 1) * limit + 1}–
            {Math.min(page * limit, total)} dari {total} produk
          </Text>
          {totalPages > 1 && (
            <Pagination
              value={page}
              onChange={setPage}
              total={totalPages}
              size="sm"
            />
          )}
        </Group>
      )}

      {/* Delete Confirm Modal */}
      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Konfirmasi Hapus Produk"
        centered
        size="sm"
      >
        <Text size="sm" mb="lg">
          Apakah Anda yakin ingin menghapus produk ini? Semua foto dan data
          variasi juga akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteId(null)}>
            Batal
          </Button>
          <Button
            color="red"
            loading={deleteLoading}
            onClick={handleDeleteConfirm}
          >
            Hapus Produk
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
