import { useEffect, useState } from "react";
import {
  Box,
  Title,
  Text,
  Breadcrumbs,
  Anchor,
  Skeleton,
  Alert,
  Stack,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { IconAlertCircle } from "@tabler/icons-react";
import { fetchProduct } from "../api/products";
import { ProductForm } from "../components/products/ProductForm";
import type { ProductWithRelations } from "../types/product";

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProduct(productId);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Produk tidak ditemukan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={24} width={200} />
        <Skeleton height={36} width={300} />
        <Skeleton height={300} radius="md" />
        <Skeleton height={200} radius="md" />
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
      <Breadcrumbs mb="md" separator="›">
        <Anchor component={Link} to="/products" size="sm">
          Product Knowledge
        </Anchor>
        <Anchor component={Link} to={`/products/${productId}`} size="sm">
          {product.name}
        </Anchor>
        <Text size="sm" c="dimmed">
          Edit
        </Text>
      </Breadcrumbs>

      <Title order={2} mb={4}>
        Edit Produk
      </Title>
      <Text c="dimmed" size="sm" mb="xl">
        Perbarui informasi produk{" "}
        <Text span fw={600} c="inherit">
          {product.name}
        </Text>
      </Text>

      <ProductForm mode="edit" initialData={product} productId={productId} />
    </Box>
  );
}
