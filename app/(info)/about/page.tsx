"use client";

import React from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Alert,
  Card,
  Anchor,
  Badge,
} from "@mantine/core";
import {
  IconBook,
  IconFridge,
  IconCalendarCheck,
  IconChartBar,
  IconLock,
  IconEdit,
  IconUserCheck,
  IconHeart,
  IconInfoCircle,
  IconFileText,
  IconShield,
  IconCookie,
  IconEyeglass,
  IconArrowRight, IconWheel, IconWheelchair,
} from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

export default function AboutPage() {
  return (
    <AsyncMainContainer size="md" py={40}>
      <Stack gap={40}>
        {/* --- HERO / TOPPSEKSJON --- */}
        <Stack gap="md" ta="center" align="center">
          <Badge color="teal" variant="light" size="lg" radius="sm">
            Et støyfritt og personlig verktøy
          </Badge>
          <Title order={1} size="h1" style={{ fontSize: "2.5rem", fontWeight: 800 }}>
            Om Kjøkkenhylla
          </Title>
          <Text size="lg" c="dimmed" style={{ maxWidth: 680, lineHeight: 1.6 }}>
            Kjøkkenhylla ble skapt ut fra et ønske om enklere måltidsplanlegging, mindre matsvinn og én samlet, digital kokebok – helt fri for reklamestøy, algoritmer og sosiale medier.
          </Text>
        </Stack>

        <Divider />

        {/* --- VISJON OG IDÉ (4 KORT INNENFOR GRID) --- */}
        <Stack gap="lg">
          <div>
            <Title order={2} size="h3" mb={4}>
              Visjon og idé
            </Title>
            <Text size="sm" c="dimmed">
              De fleste av oss har favorittoppskrifter spredt utover nettleserbokmerker, papirlapper og ulike matblogger. Kjøkkenhylla samler alt dette på én oversiktlig plass – tilpasset din måte å lage mat på.
            </Text>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Paper p="lg" radius="md" withBorder shadow="xs">
              <ThemeIcon color="teal" variant="light" size={42} radius="md" mb="md">
                <IconBook size={24} />
              </ThemeIcon>
              <Text fw={600} size="md" mb={4}>
                Din egne samling
              </Text>
              <Text size="sm" c="dimmed" lh={1.5}>
                Kjøkkenhylla leveres uten et fast oppskriftsregister. Du bygger din egen kokebok ved å importere enkelt fra dine favorittsider på nett, opprette egne retter eller ta imot delte oppskrifter fra venner og familie.
              </Text>
            </Paper>

            <Paper p="lg" radius="md" withBorder shadow="xs">
              <ThemeIcon color="teal" variant="light" size={42} radius="md" mb="md">
                <IconFridge size={24} />
              </ThemeIcon>
              <Text fw={600} size="md" mb={4}>
                Tøm kjøleskapet
              </Text>
              <Text size="sm" c="dimmed" lh={1.5}>
                Søk etter oppskrifter i din samling basert på ingrediensene og restene du allerede har liggende, slik at du sparer penger og reduserer matsvinn.
              </Text>
            </Paper>

            <Paper p="lg" radius="md" withBorder shadow="xs">
              <ThemeIcon color="teal" variant="light" size={42} radius="md" mb="md">
                <IconCalendarCheck size={24} />
              </ThemeIcon>
              <Text fw={600} size="md" mb={4}>
                Forenkle hverdagen
              </Text>
              <Text size="sm" c="dimmed" lh={1.5}>
                Sett sammen en visuell ukesmeny fra mandag til søndag, og la appen generere en ferdig, sammenslått handleliste for deg.
              </Text>
            </Paper>

            <Paper p="lg" radius="md" withBorder shadow="xs">
              <ThemeIcon color="teal" variant="light" size={42} radius="md" mb="md">
                <IconChartBar size={24} />
              </ThemeIcon>
              <Text fw={600} size="md" mb={4}>
                Oversikt over kostholdet
              </Text>
              <Text size="sm" c="dimmed" lh={1.5}>
                Få beregnet næringsinnhold per ingrediens, per måltid og akkumulert for hele uken.
              </Text>
            </Paper>
          </SimpleGrid>
        </Stack>

        {/* --- PRIVATLIV & STØYFRITT VERKTØY --- */}
        <Paper p="xl" radius="md" withBorder bg="var(--mantine-color-gray-0)">
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon color="dark" variant="filled" size={32} radius="md">
                <IconLock size={18} />
              </ThemeIcon>
              <Title order={2} size="h3">
                Et støyfritt og privat verktøy
              </Title>
            </Group>
            <Text size="sm" c="dimmed">
              Kjøkkenhylla er designet for å være et effektivt og personlig verktøy for kjøkkenet ditt – ikke et sosialt nettverk.
            </Text>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mt="xs">
              <Stack gap={4}>
                <Group gap={6}>
                  <IconUserCheck size={18} color="var(--mantine-color-teal-6)" />
                  <Text fw={600} size="sm">
                    Fullstendig privat
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" lh={1.5}>
                  Ingen kommentarfelter, offentlige vurderinger eller støy. Stjernemerking er kun for din egen del.
                </Text>
              </Stack>

              <Stack gap={4}>
                <Group gap={6}>
                  <IconEdit size={18} color="var(--mantine-color-teal-6)" />
                  <Text fw={600} size="sm">
                    Full redigeringsfrihet
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" lh={1.5}>
                  Tilpass oppskrifter fritt. Endre ingredienser og notater – kilden du importerte fra påvirkes aldri.
                </Text>
              </Stack>

              <Stack gap={4}>
                <Group gap={6}>
                  <IconLock size={18} color="var(--mantine-color-teal-6)" />
                  <Text fw={600} size="sm">
                    Fullt eierskap
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" lh={1.5}>
                  Oppskriftene dine tilhører deg. Du har alltid full kontroll over å legge til, redigere eller slette data.
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>
        </Paper>

        {/* --- ET PERSONLIG HJERTEBARN --- */}
        <Paper p="lg" radius="md" withBorder style={{ borderColor: "var(--mantine-color-teal-3)" }}>
          <Group align="flex-start" wrap="nowrap" gap="md">
            <ThemeIcon color="teal" size={40} radius="xl" variant="light">
              <IconHeart size={22} />
            </ThemeIcon>
            <div>
              <Title order={3} size="h4" mb={4}>
                Et personlig hjertebarn
              </Title>
              <Text size="sm" lh={1.6}>
                Kjøkkenhylla er et personlig prosjekt utviklet av én enkelt utvikler ut fra et brennende ønske om en bedre mat- og planleggingshverdag. Prosjektet drives av en ambisjon om å tilby et ryddig, funksjonelt og støyfritt verktøy for alle som er glade i god mat.
              </Text>
            </div>
          </Group>
        </Paper>

        {/* --- HELSEFORBEHOLD (ALERT) --- */}
        <Alert
          color="blue"
          title="Næringsinnhold og helseforbehold"
          icon={<IconInfoCircle size={22} />}
          radius="md"
        >
          <Text size="xs" mb="xs">
            Kjøkkenhylla viser beregnede verdier for energi, proteiner, fett, karbohydrater, fiber, sukker og valgte vitaminer. Viktig å merke seg:
          </Text>
          <Stack gap={4}>
            <Text size="xs">
              • <b>Kun veiledende:</b> Næringsberegninger er automatisk beregnet og utgjør ikke medisinsk eller ernæringsfysiologisk rådgivning.
            </Text>
            <Text size="xs">
              • <b>Offentlige kilder:</b> Beregningene benytter referansedata fra Matvaretabellen (Helsedirektoratet og Mattilsynet).
            </Text>
            <Text size="xs">
              • <b>Allergier:</b> Ved allergier eller spesielle helsebehov må du alltid kontrollere emballasjen på den fysiske matvaren.
            </Text>
            <Text size="xs">
              • <b>Helsefaglig rådgivning:</b> Rådfør deg med helsepersonell dersom du har behov for individuelt tilpasset kostholdsoppfølging.
            </Text>
          </Stack>
        </Alert>

        <Divider />

        {/* --- JURIDISKE DOKUMENTER (SNARVEIER) --- */}
        <Stack gap="md">
          <div>
            <Title order={2} size="h3" mb={2}>
              Juridisk informasjon
            </Title>
            <Text size="sm" c="dimmed">
              Ytterligere informasjon om rettigheter, personopplysninger, informasjonskapsler og tilgjengelighet:
            </Text>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <Card
              component={Link}
              href="/legal/terms"
              withBorder
              padding="md"
              radius="md"
              style={{ cursor: "pointer" }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon color="gray" variant="light" size="md">
                    <IconFileText size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">
                      Brukervilkår
                    </Text>
                    <Text size="xs" c="dimmed">
                      /terms
                    </Text>
                  </div>
                </Group>
                <IconArrowRight size={16} color="gray" />
              </Group>
            </Card>

            <Card
              component={Link}
              href="/legal/privacy"
              withBorder
              padding="md"
              radius="md"
              style={{ cursor: "pointer" }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon color="gray" variant="light" size="md">
                    <IconShield size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">
                      Personvernerklæring
                    </Text>
                    <Text size="xs" c="dimmed">
                      /privacy
                    </Text>
                  </div>
                </Group>
                <IconArrowRight size={16} color="gray" />
              </Group>
            </Card>

            <Card
              component={Link}
              href="/legal/cookies"
              withBorder
              padding="md"
              radius="md"
              style={{ cursor: "pointer" }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon color="gray" variant="light" size="md">
                    <IconCookie size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">
                      Informasjonskapsler
                    </Text>
                    <Text size="xs" c="dimmed">
                      /cookies
                    </Text>
                  </div>
                </Group>
                <IconArrowRight size={16} color="gray" />
              </Group>
            </Card>

            <Card
              component={Link}
              href="/legal/accessibility"
              withBorder
              padding="md"
              radius="md"
              style={{ cursor: "pointer" }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <ThemeIcon color="gray" variant="light" size="md">
                    <IconWheelchair size={18} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600} size="sm">
                      Tilgjengelighetserklæring
                    </Text>
                    <Text size="xs" c="dimmed">
                      /accessibility
                    </Text>
                  </div>
                </Group>
                <IconArrowRight size={16} color="gray" />
              </Group>
            </Card>
          </SimpleGrid>
        </Stack>
      </Stack>
    </AsyncMainContainer>
  );
}