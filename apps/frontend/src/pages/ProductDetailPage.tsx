import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Badge,
  Grid,
  Group,
  Text,
  Title,
  Breadcrumbs,
  Anchor,
  Skeleton,
  Alert,
  Card,
  SimpleGrid,
  Divider,
  Stack,
  Modal,
  Table,
  Image,
  Center,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
  IconPhoto,
  IconCurrencyDollar,
  IconTag,
  IconBarcode,
  IconPercentage,
} from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import { fetchProduct, deleteProduct, deleteProductImage } from "../api/products";
import { ProductImageSlider } from "../components/products/ProductImageSlider";
import { formatRupiah, formatDate } from "../utils/format";
import type { ProductWithRelations } from "../types/product";

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Group gap="xs" mb={4}>
        {icon && (
          <ThemeIcon size="sm" variant="light" radius="sm">
            {icon}
          </ThemeIcon>
        )}
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          {label}
        </Text>
      </Group>
      <Text size="sm" fw={500}>
        {value}
      </Text>
    </Paper>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await fetchProduct(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Produk tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleDeleteImage = async (imageId: number) => {
    if (!product) return;
    try {
      await deleteProductImage(productId, imageId);
      setProduct((prev) =>
        prev
          ? { ...prev, images: prev.images.filter((img) => img.id !== imageId) }
          : prev
      );
      notifications.show({
        message: "Foto berhasil dihapus",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch {
      notifications.show({
        message: "Gagal menghapus foto",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteProduct(productId);
      notifications.show({
        title: "Berhasil",
        message: "Produk berhasil dihapus",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      navigate("/products");
    } catch (err) {
      notifications.show({
        title: "Gagal",
        message: err instanceof Error ? err.message : "Terjadi kesalahan",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={24} width={250} />
        <Skeleton height={40} width={400} />
        <Grid>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Skeleton height={320} radius="md" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <SimpleGrid cols={2} spacing="sm">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={72} radius="md" />
              ))}
            </SimpleGrid>
          </Grid.Col>
        </Grid>
        <Skeleton height={120} radius="md" />
      </Stack>
    );
  }

  if (error || !product) {
    return (
      <Alert
        icon={<IconAlertCircle size={18} />}
        title="Produk tidak ditemukan"
        color="red"
        variant="light"
      >
        {error ?? "Produk yang Anda cari tidak ditemukan."}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs mb="md" separator="›">
        <Anchor component={Link} to="/products" size="sm">
          Product Knowledge
        </Anchor>
        <Text size="sm" c="dimmed">
          {product.name}
        </Text>
      </Breadcrumbs>

      {/* Title Row */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <Box>
          <Group gap="sm" mb={4}>
            <Title order={2}>{product.name}</Title>
            <Badge
              color={product.status === "active" ? "green" : "red"}
              variant="light"
              size="lg"
            >
              {product.status === "active" ? "Aktif" : "Non Aktif"}
            </Badge>
          </Group>
          <Text c="dimmed" size="sm" ff="monospace">
            SKU: {product.main_sku}
          </Text>
        </Box>
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconEdit size={16} />}
            onClick={() => navigate(`/products/${productId}/edit`)}
          >
            Edit
          </Button>
          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={() => setDeleteModal(true)}
          >
            Hapus
          </Button>
        </Group>
      </Group>

      {/* Main Content */}
      <Grid gap="lg" mb="xl">
        {/* Image Slider */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <ProductImageSlider
            images={product.images}
            onDelete={handleDeleteImage}
            height={320}
          />
        </Grid.Col>

        {/* Info Cards */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <InfoCard
              label="Kategori"
              value={product.category || "-"}
              icon={<IconTag size={12} />}
            />
            <InfoCard
              label="SKU Utama"
              value={product.main_sku}
              icon={<IconBarcode size={12} />}
            />
            <InfoCard
              label="HPP"
              value={formatRupiah(product.cost_price)}
              icon={<IconCurrencyDollar size={12} />}
            />
            <InfoCard
              label="Harga Jual"
              value={formatRupiah(product.selling_price)}
              icon={<IconCurrencyDollar size={12} />}
            />
            {product.campaign_price !== null && (
              <InfoCard
                label="Harga Kampanye"
                value={formatRupiah(product.campaign_price)}
                icon={<IconCurrencyDollar size={12} />}
              />
            )}
            {product.flash_sale_price !== null && (
              <InfoCard
                label="Harga Flash Sale"
                value={formatRupiah(product.flash_sale_price)}
                icon={<IconCurrencyDollar size={12} />}
              />
            )}
            <InfoCard
              label="Komisi Affiliate"
              value={`${product.affiliate_commission}%`}
              icon={<IconPercentage size={12} />}
            />
          </SimpleGrid>
        </Grid.Col>
      </Grid>

      {/* Description */}
      {product.description && (
        <Paper withBorder p="lg" radius="md" mb="lg">
          <Text fw={600} mb="sm" size="sm" c="dimmed" tt="uppercase">
            Deskripsi Produk
          </Text>
          <Box
            style={{
              lineHeight: 1.7,
              "& h1, & h2, & h3": { marginBottom: 8 },
              "& p": { marginBottom: 8 },
              "& ul, & ol": { paddingLeft: 20 },
            }}
          >
            <ReactMarkdown>{product.description}</ReactMarkdown>
          </Box>
        </Paper>
      )}

      {/* Variations Table */}
      {product.variations.length > 0 && (
        <Paper withBorder radius="md" mb="lg">
          <Box p="md" pb="xs">
            <Text fw={600} size="sm" c="dimmed" tt="uppercase">
              Variasi Produk ({product.variations.length})
            </Text>
          </Box>
          <Divider />
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Foto</Table.Th>
                <Table.Th>Warna</Table.Th>
                <Table.Th>SKU Variasi</Table.Th>
                <Table.Th>Stok</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {product.variations.map((v) => (
                <Table.Tr key={v.id}>
                  <Table.Td>
                    {v.image_path ? (
                      <Image
                        src={`/uploads/${v.image_path}`}
                        width={40}
                        height={40}
                        fit="cover"
                        radius="sm"
                        style={{ border: "1px solid var(--mantine-color-dark-4)" }}
                      />
                    ) : (
                      <Center
                        style={{
                          width: 40,
                          height: 40,
                          background: "var(--mantine-color-dark-6)",
                          borderRadius: 6,
                        }}
                      >
                        <IconPhoto size={18} color="var(--mantine-color-dimmed)" />
                      </Center>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Box
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: v.color.toLowerCase(),
                          border: "1px solid var(--mantine-color-dark-3)",
                        }}
                      />
                      <Text size="sm">{v.color}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" ff="monospace" c="dimmed">
                      {v.sku}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={v.stock === 0 ? "red" : v.stock < 10 ? "orange" : "green"}
                    >
                      {v.stock} pcs
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {/* Footer: timestamps */}
      <Card withBorder radius="md" p="md">
        <Group gap="xl">
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>
              Dibuat Pada
            </Text>
            <Text size="sm">{formatDate(product.created_at)}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>
              Diperbarui Pada
            </Text>
            <Text size="sm">{formatDate(product.updated_at)}</Text>
          </Box>
        </Group>
      </Card>

      {/* Delete Confirm Modal */}
      <Modal
        opened={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Konfirmasi Hapus Produk"
        centered
        size="sm"
      >
        <Text size="sm" mb="lg">
          Apakah Anda yakin ingin menghapus produk{" "}
          <Text span fw={700}>
            {product.name}
          </Text>
          ? Semua foto dan variasi juga akan ikut terhapus. Tindakan ini tidak
          dapat dibatalkan.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModal(false)}>
            Batal
          </Button>
          <Button color="red" loading={deleteLoading} onClick={handleDelete}>
            Hapus Produk
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
