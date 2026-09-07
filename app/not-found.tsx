"use client";

import { Title, Text, Button, Stack } from "@mantine/core";
import { IconError404 } from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

export default function NotFound() {
  return (
    <AsyncMainContainer size="xs" py={80}>
      <Stack align="center" ta="center" gap="md">
        <IconError404 size={80} stroke={1.5} color="var(--mantine-color-dimmed)" />

        <Title order={2}>Side ikke funnet</Title>

        <Text size="sm" c="dimmed" maw={360}>
          Beklager, siden du leter etter eksisterer ikke, har blitt flyttet eller er midlertidig utilgjengelig.
        </Text>

        <Button
          component={Link}
          href="/dashboard"
          variant="light"
          color="sage"
          mt="sm"
        >
          Tilbake til oversikten
        </Button>
      </Stack>
    </AsyncMainContainer>
  );
}