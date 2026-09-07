"use client";

import { useEffect } from "react";
import { Title, Text, Button, Stack, Alert } from "@mantine/core";
import { IconAlertTriangle, IconRefresh, IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Logg feilen til en feilrapporteringstjeneste om ønskelig
    console.error("Applikasjonsfeil fanget:", error);
  }, [error]);

  return (
    <AsyncMainContainer size="xs" py={80}>
      <Stack align="center" ta="center" gap="md">
        <IconAlertTriangle
          size={80}
          stroke={1.5}
          color="var(--mantine-color-red-6)"
        />

        <Title order={2}>Noe gikk galt!</Title>

        <Text size="sm" c="dimmed" maw={360}>
          Det oppstod en uventet feil under lasting av denne siden. Du kan prøve å laste siden på nytt eller gå tilbake til oversikten.
        </Text>

        {process.env.NODE_ENV === "development" && error.message && (
          <Alert color="red" variant="light" radius="md" ta="left" w="100%">
            <Text size="xs" ff="monospace">
              {error.message}
            </Text>
          </Alert>
        )}

        <Stack gap="xs" w="100%" mt="sm">
          <Button
            onClick={reset}
            variant="light"
            color="sage"
            leftSection={<IconRefresh size={16} />}
          >
            Prøv igjen
          </Button>

          <Button
            component={Link}
            href="/dashboard"
            variant="subtle"
            color="gray"
            leftSection={<IconHome size={16} />}
          >
            Tilbake til oversikten
          </Button>
        </Stack>
      </Stack>
    </AsyncMainContainer>
  );
}