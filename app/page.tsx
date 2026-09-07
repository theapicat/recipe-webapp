"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconBook,
  IconCalendarEvent,
  IconDownload,
  IconLock,
  IconSparkles,
} from "@tabler/icons-react";
import { useSession } from "@/lib/session/SessionProvider";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

export default function Home() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session || !session.role) return;

    const role = session.role.toLowerCase();
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "user") {
      router.push("/dashboard");
    }
  }, [session?.role, router]);

  const isRedirecting = Boolean(session?.role);

  return (
    <AsyncMainContainer size="lg" py="xl" loading={isRedirecting}>
      <Stack gap="xl" py="md">
        {/* Hero Section */}
        <Stack align="center" my="lg" gap="md">
          <Badge
            variant="light"
            color="sage"
            size="lg"
            leftSection={<IconSparkles size={14} />}
          >
            Din private digitale kokebok
          </Badge>

          <Title order={1} ta="center" fw={900} style={{ fontSize: "2.75rem" }}>
            Samle, planlegg og kos deg med maten –{" "}
            <Text component="span" c="sage" inherit>
              helt uten støy
            </Text>
          </Title>

          <Text c="dimmed" size="lg" ta="center" style={{ maxWidth: 650 }}>
            Kjøkkenhylla samler dine favorittoppskrifter på ett sted. Importer fra
            godkjente nettsteder, planlegg ukens måltider og generer ferdige
            handlelister – 100 % privat og reklamefritt.
          </Text>

          <Group justify="center" mt="md">
            <Button component={Link} href="/register" size="md" color="sage">
              Kom i gang
            </Button>
            <Button component={Link} href="/login" size="md" variant="default">
              Logg inn
            </Button>
          </Group>
        </Stack>

        {/* Feature Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="xl">
          <Card radius="md" p="lg" withBorder>
            <ThemeIcon radius="md" size="xl" color="sage" variant="light" mb="md">
              <IconBook size={24} />
            </ThemeIcon>

            <Text fw={600} size="lg" mb="xs">
              Privat oppskriftssamling
            </Text>

            <Text size="sm" c="dimmed">
              Dine oppskrifter tilhører deg. Ingen vurderinger, støy eller
              sosiale innslag fra andre brukere.
            </Text>
          </Card>

          <Card radius="md" p="lg" withBorder>
            <ThemeIcon radius="md" size="xl" color="sage" variant="light" mb="md">
              <IconDownload size={24} />
            </ThemeIcon>

            <Text fw={600} size="lg" mb="xs">
              Importer fra nett
            </Text>

            <Text size="sm" c="dimmed">
              Lim inn lenker fra godkjente matblogger. Vi skreller bort lange
              innledningstekster og reklame for deg.
            </Text>
          </Card>

          <Card radius="md" p="lg" withBorder>
            <ThemeIcon radius="md" size="xl" color="terracotta" variant="light" mb="md">
              <IconCalendarEvent size={24} />
            </ThemeIcon>

            <Text fw={600} size="lg" mb="xs">
              Ukesplan & Handleliste
            </Text>

            <Text size="sm" c="dimmed">
              Strukturering av ukens middager og automatisk sammenslåing av
              ingredienser til en ferdig handleliste.
            </Text>
          </Card>
        </SimpleGrid>

        {/* Info Banner */}
        <Card radius="md" p="xl" withBorder mt="lg">
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Stack gap={4}>
              <Group gap="xs">
                <IconLock size={18} color="var(--mantine-color-sage-filled)" />
                <Text fw={700} size="md">
                  100 % Privat & Eierskapsbasert
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                Bruk råvarene du har i kjøleskapet til å finne retter og redusere matsvinn.
              </Text>
            </Stack>

            <Button
              component={Link}
              href="/about"
              variant="subtle"
              color="sage"
              size="sm"
            >
              Les mer om prosjektet →
            </Button>
          </Group>
        </Card>
      </Stack>
    </AsyncMainContainer>
  );
}