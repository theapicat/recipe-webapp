"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Paper,
  Stack,
  Title,
  Text,
  Group,
  NavLink,
  Grid,
  Divider,
} from "@mantine/core";
import {
  IconFileText,
  IconShield,
  IconCookie,
  IconChevronRight,
  IconScale,
  IconWheelchair,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

const LEGAL_NAV_ITEMS = [
  {
    label: "Brukervilkår",
    href: "/legal/terms",
    icon: IconFileText,
    description: "Vilkår for bruk og rettigheter",
  },
  {
    label: "Personvernerklæring",
    href: "/legal/privacy",
    icon: IconShield,
    description: "Behandling av personopplysninger",
  },
  {
    label: "Informasjonskapsler",
    href: "/legal/cookies",
    icon: IconCookie,
    description: "Bruk av cookies på nettstedet",
  },
  {
    label: "Tilgjengelighet",
    href: "/legal/accessibility",
    icon: IconWheelchair,
    description: "Universell utforming (WCAG)",
  },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AsyncMainContainer size="lg" py={40}>
      <Stack gap="xl">
        {/* Header-banner for Legal-seksjonen */}
        <div>
          <Group gap="xs" mb={4}>
            <IconScale size={20} color="var(--mantine-color-sage-filled)" />
            <Text fw={600} size="sm" c="sage">
              Juridisk informasjon & Vilkår
            </Text>
          </Group>
          <Title order={1} size="h2">
            Dokumentsenter
          </Title>
          <Text size="sm" c="dimmed">
            Oversikt over Kjøkkenhyllas retningslinjer, personvern og brukervilkår.
          </Text>
        </div>

        <Divider />

        {/* Grid med Sidemeny og Hovedinnhold */}
        <Grid gap="md">
          {/* Sidemeny (Col 4 av 12) */}
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Paper p="sm" radius="md" withBorder style={{ position: "sticky", top: 20 }}>
              <Stack gap={4}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" py={6}>
                  Navigasjon
                </Text>

                {LEGAL_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <NavLink
                      key={item.href}
                      component={Link}
                      href={item.href}
                      label={item.label}
                      description={item.description}
                      leftSection={<Icon size={18} />}
                      rightSection={<IconChevronRight size={14} />}
                      active={isActive}
                      color="sage"
                      variant="light"
                    />
                  );
                })}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Hovedinnhold (Col 8 av 12) */}
          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            {children}
          </Grid.Col>
        </Grid>
      </Stack>
    </AsyncMainContainer>
  );
}