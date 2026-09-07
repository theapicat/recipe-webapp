"use client";

import {
  Anchor,
  Badge,
  Box,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  ThemeIcon,
} from "@mantine/core";
import Link from "next/link";
import {
  IconChefHat,
  IconLock,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useSession } from "@/lib/session/SessionProvider";

export const Footer = () => {
  const session = useSession();
  const userActive = Boolean(session?.user);

  return (
    <Box component="footer" mt={100} bg="var(--mantine-color-body)">
      <Divider color="var(--mantine-color-gray-3)" />

      <Container size="lg" py={50}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={30} mb={40}>
          {/* Kolonne 1: Brand & Visjon */}
          <Stack gap="sm">
            <Group gap="xs">
              <ThemeIcon size={34} radius="md" color="sage" variant="light">
                <IconChefHat size={20} />
              </ThemeIcon>
              <div>
                <Title order={3} size="h4" lh={1}>
                  Kjøkkenhylla
                </Title>
              </div>
            </Group>

            <Text size="xs" c="dimmed" lh={1.6}>
              Din personlige, digitale kokebok. Samle egne oppskrifter, importer fra favorittblogger, planlegg ukesmenyen og generer handlelister – helt støyfritt og privat.
            </Text>

            <Group gap={6} mt={4}>
              <Badge variant="dot" color="sage" size="xs">
                100% Privat
              </Badge>
              <Badge variant="dot" color="blue" size="xs">
                Ingen reklame
              </Badge>
            </Group>
          </Stack>

          {/* Kolonne 2: Medlemsfunksjoner */}
          <Stack gap="xs">
            <Group gap={6} mb={4}>
              <Text fw={600} size="sm">
                Min Kjøkkenhylle
              </Text>
              {!userActive && (
                <Badge size="xs" color="gray" variant="outline" leftSection={<IconLock size={10} />}>
                  Krever konto
                </Badge>
              )}
            </Group>

            <Anchor component={Link} href="/user/recipes" size="sm" c="dimmed" underline="hover">
              Mine oppskrifter
            </Anchor>
            <Anchor component={Link} href="/user/import" size="sm" c="dimmed" underline="hover">
              Importer oppskrift
            </Anchor>
            <Anchor component={Link} href="/user/mealplan" size="sm" c="dimmed" underline="hover">
              Måltidsplanlegger
            </Anchor>
            <Anchor component={Link} href="/user/shoppinglist" size="sm" c="dimmed" underline="hover">
              Handleliste
            </Anchor>
          </Stack>

          {/* Kolonne 3: Informasjon & Hjelp */}
          <Stack gap="xs">
            <Text fw={600} size="sm" mb={4}>
              Informasjon
            </Text>

            <Anchor component={Link} href="/about" size="sm" c="dimmed" underline="hover">
              Om Kjøkkenhylla
            </Anchor>
            <Anchor component={Link} href="/faq" size="sm" c="dimmed" underline="hover">
              Hjelp & FAQ
            </Anchor>
            <Anchor component={Link} href="/status" size="sm" c="dimmed" underline="hover">
              Systemstatus
            </Anchor>
            <Anchor component={Link} href="/contact" size="sm" c="dimmed" underline="hover">
              Kontakt oss
            </Anchor>
          </Stack>

          {/* Kolonne 4: Juridisk & Personvern */}
          <Stack gap="xs">
            <Text fw={600} size="sm" mb={4}>
              Juridisk
            </Text>

            <Anchor component={Link} href="/legal/terms" size="sm" c="dimmed" underline="hover">
              Brukervilkår
            </Anchor>
            <Anchor component={Link} href="/legal/privacy" size="sm" c="dimmed" underline="hover">
              Personvernerklæring
            </Anchor>
            <Anchor component={Link} href="/legal/cookies" size="sm" c="dimmed" underline="hover">
              Informasjonskapsler
            </Anchor>
            <Anchor component={Link} href="/legal/accessibility" size="sm" c="dimmed" underline="hover">
              Tilgjengelighet
            </Anchor>
          </Stack>
        </SimpleGrid>

        <Divider my="md" variant="dashed" />

        {/* Binnlinje: Copyright & Status */}
        <Group justify="space-between" align="center" pt="xs">
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              © {new Date().getFullYear()} Kjøkkenhylla. Utviklet som et støyfritt og personlig verktøy.
            </Text>
          </Group>

          <Group gap="md">
            {userActive ? (
              <Badge variant="light" color="sage" size="xs" leftSection={<IconCircleCheck size={12} />}>
                Innlogget som {session.user?.firstName || "bruker"}
              </Badge>
            ) : (
              <Text size="xs" c="dimmed">
                Gjester viderekobles til innlogging for medlemsfunksjoner.
              </Text>
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
};