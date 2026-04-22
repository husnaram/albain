import { Box, Title, Text, Breadcrumbs, Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { ProductForm } from "../components/products/ProductForm";

export function ProductCreatePage() {
  return (
    <Box>
      <Breadcrumbs mb="md" separator="›">
        <Anchor component={Link} to="/products" size="sm">
          Product Knowledge
        </Anchor>
        <Text size="sm" c="dimmed">
          Tambah Produk Baru
        </Text>
      </Breadcrumbs>

      <Title order={2} mb={4}>
        Tambah Produk Baru
      </Title>
      <Text c="dimmed" size="sm" mb="xl">
        Isi semua informasi produk yang diperlukan
      </Text>

      <ProductForm mode="create" />
    </Box>
  );
}
