"use client";

import { SimpleGrid, Card, Group, Text, Title } from "@mantine/core";
import {
  IconUserCheck,
  IconUserOff,
  IconUsers,
  IconMailQuestion,
} from "@tabler/icons-react";

interface Props {
  totalItems: number;
  activeFilterSummary?: string;
}

export function AdminUserStatsCards({ totalItems, activeFilterSummary }: Props) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      <Card withBorder padding="md" radius="md">
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Totalt Treff
            </Text>
            <Title order={3}>{totalItems}</Title>
          </div>
          <IconUsers size={32} color="var(--mantine-color-blue-6)" />
        </Group>
      </Card>

      <Card withBorder padding="md" radius="md">
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Aktiv Filtrering
            </Text>
            <Title order={5} c="teal.7" lineClamp={1}>
              {activeFilterSummary || "Alle brukere"}
            </Title>
          </div>
          <IconMailQuestion size={32} color="var(--mantine-color-orange-6)" />
        </Group>
      </Card>

      <Card withBorder padding="md" radius="md">
        <Group justify="space-between">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Status
            </Text>
            <Text size="xs" c="dimmed">
              Synkronisert mot Auth API
            </Text>
          </div>
          <IconUserCheck size={32} color="var(--mantine-color-green-6)" />
        </Group>
      </Card>
    </SimpleGrid>
  );
}