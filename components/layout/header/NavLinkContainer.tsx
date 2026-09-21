"use client";

import { Button, Group } from "@mantine/core";
import Link from "next/link";
import { NavItem } from "@/components/layout/header/navlinks";

interface NavLinksContainerProps {
  links: NavItem[];
  /** Fra hvilket bruddpunkt lenkene vises i headeren (under det brukes burger-menyen). */
  visibleFrom?: "md" | "lg";
}

export const NavLinksContainer = ({ links, visibleFrom = "md" }: NavLinksContainerProps) => {
  return (
    <Group gap="xs" visibleFrom={visibleFrom} wrap="nowrap">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            key={link.href}
            component={Link}
            href={link.href}
            variant="subtle"
            color="gray"
            size="sm"
            radius="md"
            fw={500}
            leftSection={Icon ? <Icon size={18} /> : undefined}
          >
            {link.label}
          </Button>
        );
      })}
    </Group>
  );
};
