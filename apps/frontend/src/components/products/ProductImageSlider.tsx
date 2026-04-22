import { Carousel } from "@mantine/carousel";
import {
  Image,
  Box,
  Center,
  Text,
  ActionIcon,
  Stack,
} from "@mantine/core";
import { IconPhoto, IconX } from "@tabler/icons-react";
import type { ProductImage } from "../../types/product";

interface ProductImageSliderProps {
  images: ProductImage[];
  onDelete?: (imageId: number) => void;
  height?: number;
}

export function ProductImageSlider({
  images,
  onDelete,
  height = 320,
}: ProductImageSliderProps) {
  if (images.length === 0) {
    return (
      <Box
        style={{
          height,
          border: "2px dashed var(--mantine-color-dimmed)",
          borderRadius: "var(--mantine-radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack align="center" gap="xs">
          <IconPhoto size={48} color="var(--mantine-color-dimmed)" />
          <Text c="dimmed" size="sm">
            Belum ada foto produk
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Carousel
      withIndicators
      height={height}
      style={{ borderRadius: "var(--mantine-radius-md)", overflow: "hidden" }}
    >
      {images.map((img) => (
        <Carousel.Slide key={img.id}>
          <Box style={{ position: "relative", height }}>
            <Image
              src={`/uploads/${img.file_path}`}
              alt="Foto produk"
              height={height}
              fit="contain"
              style={{ background: "var(--mantine-color-dark-7)" }}
            />
            {onDelete && (
              <ActionIcon
                variant="filled"
                color="red"
                size="sm"
                radius="xl"
                style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
                onClick={() => onDelete(img.id)}
              >
                <IconX size={14} />
              </ActionIcon>
            )}
          </Box>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}

// Simple thumbnail grid for read-only display
interface ImageThumbnailGridProps {
  images: ProductImage[];
  size?: number;
}

export function ImageThumbnailGrid({ images, size = 80 }: ImageThumbnailGridProps) {
  if (images.length === 0) {
    return (
      <Center
        style={{
          width: size,
          height: size,
          background: "var(--mantine-color-dark-6)",
          borderRadius: "var(--mantine-radius-sm)",
        }}
      >
        <IconPhoto size={20} color="var(--mantine-color-dimmed)" />
      </Center>
    );
  }

  return (
    <Image
      src={`/uploads/${images[0].file_path}`}
      alt="Thumbnail produk"
      width={size}
      height={size}
      fit="cover"
      radius="sm"
      style={{ border: "1px solid var(--mantine-color-dark-4)" }}
    />
  );
}
