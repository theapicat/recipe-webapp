"use client";

import { Button, Drawer, NavLink, Stack } from "@mantine/core";
import Link from "next/link";
import { NavItem } from "@/components/layout/header/navlinks";

interface MobileNavDrawerProps {
  opened: boolean;
  onClose: () => void;
  links: NavItem[];
  isGuest: boolean;
}

export const MobileNavDrawer = ({
                                  opened,
                                  onClose,
                                  links,
                                  isGuest,
                                }: MobileNavDrawerProps) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      size="xs"
      padding="md"
      title="Meny"
      hiddenFrom="md"
    >
      <Stack gap="xs" mt="md">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.href}
              component={Link}
              href={link.href}
              label={link.label}
              leftSection={Icon ? <Icon size={18} /> : undefined}
              onClick={onClose}
            />
          );
        })}

        {isGuest && (
          <Stack gap="xs" mt="lg">
            <Button
              variant="subtle"
              color="gray"
              component={Link}
              href="/login"
              onClick={onClose}
              fullWidth
            >
              Logg inn
            </Button>
            <Button
              variant="filled"
              color="sage"
              component={Link}
              href="/register"
              onClick={onClose}
              fullWidth
            >
              Opprett konto
            </Button>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
};