import {
  Box,
  Button,
  Card,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Image,
  FileInput,
  Badge,
} from "@mantine/core";
import { IconPlus, IconTrash, IconPhoto } from "@tabler/icons-react";

export interface VariationFormValue {
  color: string;
  sku: string;
  stock: number;
  image_path?: string | null;    // existing image path (from server)
  imageFile?: File | null;        // new file to upload
}

interface VariationFormSectionProps {
  variations: VariationFormValue[];
  onChange: (variations: VariationFormValue[]) => void;
}

export function VariationFormSection({
  variations,
  onChange,
}: VariationFormSectionProps) {
  const addVariation = () => {
    onChange([
      ...variations,
      { color: "", sku: "", stock: 0, image_path: null, imageFile: null },
    ]);
  };

  const removeVariation = (index: number) => {
    onChange(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (
    index: number,
    field: keyof VariationFormValue,
    value: unknown
  ) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <Box>
      <Group justify="space-between" mb="sm">
        <Text fw={500} size="sm">
          Variasi Produk
        </Text>
        <Badge variant="light" size="sm">
          {variations.length} variasi
        </Badge>
      </Group>

      <Stack gap="sm">
        {variations.map((variation, index) => (
          <Card key={index} withBorder padding="sm" radius="md">
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Variasi #{index + 1}
              </Text>
              <ActionIcon
                color="red"
                variant="subtle"
                size="sm"
                onClick={() => removeVariation(index)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>

            <Group grow gap="xs" mb="xs">
              <TextInput
                label="Warna"
                placeholder="cth: Merah, Biru"
                value={variation.color}
                onChange={(e) =>
                  updateVariation(index, "color", e.currentTarget.value)
                }
                size="sm"
              />
              <TextInput
                label="SKU Variasi"
                placeholder="cth: SKU001-RED"
                value={variation.sku}
                onChange={(e) =>
                  updateVariation(index, "sku", e.currentTarget.value)
                }
                size="sm"
              />
              <NumberInput
                label="Stok"
                placeholder="0"
                value={variation.stock}
                onChange={(val) =>
                  updateVariation(index, "stock", Number(val) || 0)
                }
                min={0}
                size="sm"
              />
            </Group>

            {/* Foto Variasi */}
            <Group gap="sm" align="flex-end">
              {variation.image_path && !variation.imageFile && (
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    Foto saat ini
                  </Text>
                  <Image
                    src={`/uploads/${variation.image_path}`}
                    width={52}
                    height={52}
                    fit="cover"
                    radius="sm"
                    style={{ border: "1px solid var(--mantine-color-dark-4)" }}
                  />
                </Box>
              )}
              {variation.imageFile && (
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    Foto baru
                  </Text>
                  <Image
                    src={URL.createObjectURL(variation.imageFile)}
                    width={52}
                    height={52}
                    fit="cover"
                    radius="sm"
                    style={{ border: "1px solid var(--mantine-color-brand-5)" }}
                  />
                </Box>
              )}
              <FileInput
                label="Foto Variasi"
                placeholder="Pilih foto (JPG/PNG)"
                accept="image/jpeg,image/png"
                leftSection={<IconPhoto size={14} />}
                value={variation.imageFile ?? null}
                onChange={(file) => updateVariation(index, "imageFile", file)}
                size="sm"
                clearable
                style={{ flex: 1 }}
              />
            </Group>
          </Card>
        ))}
      </Stack>

      <Button
        variant="light"
        leftSection={<IconPlus size={16} />}
        onClick={addVariation}
        mt="sm"
        size="sm"
        fullWidth
      >
        Tambah Variasi
      </Button>
    </Box>
  );
}
