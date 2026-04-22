import { createTheme } from "@mantine/core";
import type { MantineColorsTuple } from "@mantine/core";

const brand: MantineColorsTuple = [
  "#eef3ff",
  "#dce4f5",
  "#b9c7e2",
  "#94a8d0",
  "#748dc1",
  "#5f7cb8",
  "#5474b4",
  "#44639f",
  "#39588f",
  "#2d4b81",
];

export const theme = createTheme({
  primaryColor: "brand",
  colors: { brand },
  fontFamily: "Inter, system-ui, sans-serif",
  fontFamilyMonospace: "JetBrains Mono, monospace",
  headings: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: "700",
  },
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    NumberInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
