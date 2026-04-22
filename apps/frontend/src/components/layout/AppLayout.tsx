import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  ActionIcon,
  useMantineColorScheme,
  Box,
  Text,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  IconSun,
  IconMoon,
  IconPackage,
  IconHome,
} from "@tabler/icons-react";

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Beranda", icon: IconHome, href: "/" },
    { label: "Product Knowledge", icon: IconPackage, href: "/products" },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 220,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group gap="xs">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #5474b4 0%, #2d4b81 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconPackage size={18} color="white" />
              </Box>
              <Title order={4} style={{ letterSpacing: "-0.5px" }}>
                Albain
              </Title>
            </Group>
          </Group>
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="md"
            onClick={() => toggleColorScheme()}
            aria-label="Toggle dark mode"
          >
            {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <Stack gap="xs" mt="sm">
          <Text size="xs" fw={600} c="dimmed" px="sm" tt="uppercase" mb={4}>
            Menu
          </Text>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.href);
            return (
              <NavLink
                key={item.href}
                label={item.label}
                leftSection={<item.icon size={18} />}
                active={isActive}
                onClick={() => {
                  navigate(item.href);
                  if (opened) toggle();
                }}
                style={{ borderRadius: 8 }}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
