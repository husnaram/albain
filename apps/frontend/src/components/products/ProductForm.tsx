import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Divider,
  Paper,
  Image,
  ActionIcon,
  rem,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { IconUpload, IconPhoto, IconX, IconCheck } from "@tabler/icons-react";
import { RupiahInput } from "./RupiahInput";
import {
  VariationFormSection,
  type VariationFormValue,
} from "./VariationFormSection";
import type { ProductWithRelations } from "../../types/product";
import { createProduct, updateProduct, deleteProductImage } from "../../api/products";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: ProductWithRelations;
  productId?: number;
}

interface FormValues {
  name: string;
  main_sku: string;
  description: string;
  cost_price: number | string;
  selling_price: number | string;
  campaign_price: number | string;
  flash_sale_price: number | string;
  category: string;
  status: string;
  affiliate_commission: number | string;
}

export function ProductForm({ mode, initialData, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<FormValues>({
    name: initialData?.name ?? "",
    main_sku: initialData?.main_sku ?? "",
    description: initialData?.description ?? "",
    cost_price: initialData?.cost_price ?? 0,
    selling_price: initialData?.selling_price ?? 0,
    campaign_price: initialData?.campaign_price ?? "",
    flash_sale_price: initialData?.flash_sale_price ?? "",
    category: initialData?.category ?? "",
    status: initialData?.status ?? "active",
    affiliate_commission: initialData?.affiliate_commission ?? 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  // New images to upload
  const [newImages, setNewImages] = useState<File[]>([]);
  // Existing images (edit mode)
  const [existingImages, setExistingImages] = useState(
    initialData?.images ?? []
  );

  // Variations
  const [variations, setVariations] = useState<VariationFormValue[]>(
    initialData?.variations?.map((v) => ({
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      image_path: v.image_path,
      imageFile: null,
    })) ?? []
  );

  const set = (field: keyof FormValues) => (value: unknown) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.name.trim()) newErrors.name = "Nama produk wajib diisi";
    if (!values.main_sku.trim()) newErrors.main_sku = "SKU utama wajib diisi";
    if (!values.cost_price || Number(values.cost_price) < 0)
      newErrors.cost_price = "HPP wajib diisi dan tidak boleh negatif";
    if (!values.selling_price || Number(values.selling_price) < 0)
      newErrors.selling_price = "Harga jual wajib diisi dan tidak boleh negatif";
    const commission = Number(values.affiliate_commission);
    if (commission < 0 || commission > 100)
      newErrors.affiliate_commission = "Komisi harus antara 0 dan 100";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!productId) return;
    try {
      await deleteProductImage(productId, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
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

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("main_sku", values.main_sku.trim());
      formData.append("description", values.description);
      formData.append("cost_price", String(Number(values.cost_price) || 0));
      formData.append("selling_price", String(Number(values.selling_price) || 0));
      formData.append(
        "campaign_price",
        values.campaign_price !== "" && values.campaign_price !== null
          ? String(Number(values.campaign_price))
          : ""
      );
      formData.append(
        "flash_sale_price",
        values.flash_sale_price !== "" && values.flash_sale_price !== null
          ? String(Number(values.flash_sale_price))
          : ""
      );
      formData.append("category", values.category);
      formData.append("status", values.status);
      formData.append(
        "affiliate_commission",
        String(Number(values.affiliate_commission) || 0)
      );

      // Variations JSON (without imageFile objects)
      const variationsPayload = variations.map(({ imageFile: _f, ...rest }) => rest);
      formData.append("variations", JSON.stringify(variationsPayload));

      // Variation images
      variations.forEach((v, i) => {
        if (v.imageFile) {
          formData.append(`variation_image_${i}`, v.imageFile);
        }
      });

      // Product images
      newImages.forEach((img) => {
        formData.append("images", img);
      });

      if (mode === "create") {
        const result = await createProduct(formData);
        notifications.show({
          title: "Berhasil!",
          message: "Produk berhasil dibuat",
          color: "green",
          icon: <IconCheck size={16} />,
        });
        navigate(`/products/${result.id}`);
      } else if (productId) {
        await updateProduct(productId, formData);
        notifications.show({
          title: "Berhasil!",
          message: "Produk berhasil diperbarui",
          color: "green",
          icon: <IconCheck size={16} />,
        });
        navigate(`/products/${productId}`);
      }
    } catch (err) {
      notifications.show({
        title: "Gagal menyimpan",
        message: err instanceof Error ? err.message : "Terjadi kesalahan",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="lg">
      {/* Informasi Dasar */}
      <Paper withBorder p="lg" radius="md">
        <Title order={5} mb="md" c="dimmed" tt="uppercase" size="xs">
          Informasi Dasar
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 8 }}>
            <TextInput
              label="Nama Produk"
              placeholder="cth: Kemeja Batik Premium"
              required
              value={values.name}
              onChange={(e) => set("name")(e.currentTarget.value)}
              error={errors.name}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextInput
              label="SKU Utama"
              placeholder="cth: KBP-001"
              required
              value={values.main_sku}
              onChange={(e) => set("main_sku")(e.currentTarget.value)}
              error={errors.main_sku}
              ff="monospace"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Kategori Produk"
              placeholder="cth: Pakaian, Elektronik"
              value={values.category}
              onChange={(e) => set("category")(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Status Produk"
              data={[
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Non Aktif" },
              ]}
              value={values.status}
              onChange={(val) => set("status")(val ?? "active")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Deskripsi Produk"
              placeholder="Tulis deskripsi produk (mendukung format Markdown)..."
              minRows={4}
              autosize
              value={values.description}
              onChange={(e) => set("description")(e.currentTarget.value)}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Harga */}
      <Paper withBorder p="lg" radius="md">
        <Title order={5} mb="md" c="dimmed" tt="uppercase" size="xs">
          Harga
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <RupiahInput
            label="HPP (Harga Pokok Produksi)"
            value={values.cost_price}
            onChange={set("cost_price")}
            required
            error={errors.cost_price}
          />
          <RupiahInput
            label="Harga Jual"
            value={values.selling_price}
            onChange={set("selling_price")}
            required
            error={errors.selling_price}
          />
          <RupiahInput
            label="Harga Kampanye"
            value={values.campaign_price}
            onChange={set("campaign_price")}
            placeholder="Kosongkan jika tidak ada"
          />
          <RupiahInput
            label="Harga Flash Sale"
            value={values.flash_sale_price}
            onChange={set("flash_sale_price")}
            placeholder="Kosongkan jika tidak ada"
          />
          <NumberInput
            label="Komisi Affiliate (%)"
            placeholder="0"
            value={values.affiliate_commission}
            onChange={set("affiliate_commission")}
            suffix="%"
            min={0}
            max={100}
            decimalScale={2}
            error={errors.affiliate_commission}
          />
        </SimpleGrid>
      </Paper>

      {/* Foto Produk */}
      <Paper withBorder p="lg" radius="md">
        <Title order={5} mb="md" c="dimmed" tt="uppercase" size="xs">
          Foto Produk
        </Title>

        {/* Existing images (edit mode) */}
        {existingImages.length > 0 && (
          <Box mb="md">
            <Text size="sm" c="dimmed" mb="xs">
              Foto saat ini
            </Text>
            <Group gap="sm">
              {existingImages.map((img) => (
                <Box key={img.id} style={{ position: "relative" }}>
                  <Image
                    src={`/uploads/${img.file_path}`}
                    width={80}
                    height={80}
                    fit="cover"
                    radius="md"
                    style={{ border: "1px solid var(--mantine-color-dark-4)" }}
                  />
                  <ActionIcon
                    size="xs"
                    color="red"
                    variant="filled"
                    radius="xl"
                    style={{ position: "absolute", top: -6, right: -6 }}
                    onClick={() => handleDeleteExistingImage(img.id)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
            <Divider my="sm" />
          </Box>
        )}

        {/* New images dropzone */}
        <Dropzone
          onDrop={(files) => setNewImages((prev) => [...prev, ...files])}
          onReject={() =>
            notifications.show({
              message: "File tidak valid. Gunakan JPG atau PNG.",
              color: "orange",
            })
          }
          accept={IMAGE_MIME_TYPE}
          multiple
        >
          <Group justify="center" gap="xl" mih={100} style={{ pointerEvents: "none" }}>
            <Dropzone.Accept>
              <IconUpload
                style={{ width: rem(48), height: rem(48), color: "var(--mantine-color-blue-6)" }}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                style={{ width: rem(48), height: rem(48), color: "var(--mantine-color-red-6)" }}
                stroke={1.5}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto
                style={{ width: rem(48), height: rem(48), color: "var(--mantine-color-dimmed)" }}
                stroke={1.5}
              />
            </Dropzone.Idle>
            <Box>
              <Text size="lg" fw={500}>
                Tarik foto ke sini atau klik untuk pilih
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Format JPG/PNG, bisa pilih beberapa foto sekaligus
              </Text>
            </Box>
          </Group>
        </Dropzone>

        {/* New images preview */}
        {newImages.length > 0 && (
          <Box mt="md">
            <Text size="sm" c="dimmed" mb="xs">
              Foto baru ({newImages.length})
            </Text>
            <Group gap="sm">
              {newImages.map((file, i) => (
                <Box key={i} style={{ position: "relative" }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    width={80}
                    height={80}
                    fit="cover"
                    radius="md"
                    style={{ border: "2px solid var(--mantine-color-brand-5)" }}
                  />
                  <ActionIcon
                    size="xs"
                    color="red"
                    variant="filled"
                    radius="xl"
                    style={{ position: "absolute", top: -6, right: -6 }}
                    onClick={() =>
                      setNewImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    <IconX size={10} />
                  </ActionIcon>
                </Box>
              ))}
            </Group>
          </Box>
        )}
      </Paper>

      {/* Variasi */}
      <Paper withBorder p="lg" radius="md">
        <Title order={5} mb="md" c="dimmed" tt="uppercase" size="xs">
          Variasi Produk
        </Title>
        <VariationFormSection variations={variations} onChange={setVariations} />
      </Paper>

      {/* Actions */}
      <Group justify="flex-end">
        <Button
          variant="subtle"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Batal
        </Button>
        <Button onClick={handleSubmit} loading={loading} size="md">
          {mode === "create" ? "Simpan Produk" : "Perbarui Produk"}
        </Button>
      </Group>
    </Stack>
  );
}
