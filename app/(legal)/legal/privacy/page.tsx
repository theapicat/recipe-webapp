"use client";

import { Title, Text, Paper, Stack, Badge, ThemeIcon, Group, SimpleGrid, Card } from "@mantine/core";
import {
  IconShieldCheck,
  IconLock,
  IconTrash,
  IconUserCheck,
  IconDownload,
} from "@tabler/icons-react";

export default function PrivacyPage() {
  return (
    <Paper p="xl" radius="md" withBorder shadow="xs">
      <Stack gap="lg">
        <div>
          <Badge color="sage" variant="light" mb="xs">
            Sist oppdatert: 5. september 2026
          </Badge>
          <Title order={2} size="h2">
            Personvernerklæring for Kjøkkenhylla
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Kjøkkenhylla tar ditt personvern på alvor. Vi praktiserer <b>dataminimering</b>, noe som betyr at vi kun samler inn og behandler informasjon som er absolutt nødvendig.
          </Text>
        </div>

        <Stack gap="md">
          {/* Opplysninger */}
          <div>
            <Title order={3} size="h4" mb={6}>
              1. Hvilke personopplysninger vi samler inn
            </Title>
            <Text size="sm" lh={1.6} mb="xs">
              Vi samler kun inn følgende opplysninger når du registrerer en konto:
            </Text>
            <Paper p="sm" radius="sm" withBorder>
              <Stack gap={4}>
                <Text size="xs">
                  • <b>E-postadresse:</b> Brukes som din unike identifikator for innlogging, kontogjenoppretting og viktige systemmeldinger.
                </Text>
                <Text size="xs">
                  • <b>Navn (Fornavn og etternavn):</b> Brukes for å gi deg en personlig brukeropplevelse.
                </Text>
                <Text size="xs">
                  • <b>Innloggingsinformasjon fra Google (OAuth):</b> Dersom du benytter Google-innlogging, henter vi kun e-postadresse og navn fra Google-profilen din.
                </Text>
              </Stack>
            </Paper>
          </div>

          {/* Privatliv & Tredjeparter */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card withBorder padding="md" radius="md">
              <Group gap="xs" mb="xs">
                <ThemeIcon color="sage" variant="light" size="sm">
                  <IconLock size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm">
                  100 % Privat
                </Text>
              </Group>
              <Text size="xs" c="dimmed" lh={1.5}>
                Egne og skrapte oppskrifter, måltidsplaner, handlelister og ernæringsmål er helt skjermet. Ingen andre brukere har tilgang til dine data.
              </Text>
            </Card>

            <Card withBorder padding="md" radius="md">
              <Group gap="xs" mb="xs">
                <ThemeIcon color="sage" variant="light" size="sm">
                  <IconShieldCheck size={16} />
                </ThemeIcon>
                <Text fw={600} size="sm">
                  Ingen Sporing eller Salg
                </Text>
              </Group>
              <Text size="xs" c="dimmed" lh={1.5}>
                Vi selger eller deler aldri personopplysninger. Vi benytter ingen sporingsteknologier fra tredjepart (som Google Analytics eller Facebook Pixel).
              </Text>
            </Card>
          </SimpleGrid>

          {/* Datasikkerhet & GDPR */}
          <div>
            <Title order={3} size="h4" mb={6}>
              2. Datasikkerhet og Rettigheter (GDPR)
            </Title>
            <Text size="sm" lh={1.6} mb="xs">
              Passord lagres kryptert via vår .NET Identity-backend, og all kommunikasjon sikres med SSL/TLS. I henhold til GDPR har du følgende rettigheter:
            </Text>
            <Stack gap="xs">
              {/* Datainnsyn og dataportabilitet */}
              <Paper p="sm" radius="sm" withBorder>
                <Group align="flex-start" gap="sm">
                  <IconDownload size={20} color="var(--mantine-color-sage-filled)" />
                  <div>
                    <Text fw={600} size="sm">
                      Rett til innsyn og dataportabilitet (Selvbetjent eksport)
                    </Text>
                    <Text size="xs" c="dimmed">
                      Du har rett til fullt innsyn i alle personopplysninger og brukerdata vi har registrert om deg. Du kan når som helst hente ut og laste ned en komplett kopi av dine data direkte fra profilinnstillingene dine (`/user/profile`).
                    </Text>
                  </div>
                </Group>
              </Paper>

              {/* Sletting */}
              <Paper p="sm" radius="sm" withBorder>
                <Group align="flex-start" gap="sm">
                  <IconTrash size={20} color="var(--mantine-color-red-filled)" />
                  <div>
                    <Text fw={600} size="sm">
                      Rett til sletting ("Rett til å bli glemt")
                    </Text>
                    <Text size="xs" c="dimmed">
                      Du kan når som helst slette kontoen din permanent under profilsiden din (`/user/profile`). Dette utfører en umiddelbar kaskadesletting av alle dine oppskrifter, ukeplaner og personalia fra databasen.
                    </Text>
                  </div>
                </Group>
              </Paper>

              {/* Retting & Kontakt */}
              <Paper p="sm" radius="sm" withBorder>
                <Group align="flex-start" gap="sm">
                  <IconUserCheck size={20} color="var(--mantine-color-sage-filled)" />
                  <div>
                    <Text fw={600} size="sm">
                      Rett til retting og øvrige henvendelser
                    </Text>
                    <Text size="xs" c="dimmed">
                      Du kan selv oppdatere din profilinformasjon i applikasjonen. Dersom du har spørsmål om denne personvernerklæringen eller dine rettigheter som ikke løses på profilsiden, kan du kontakte oss via kontaktskjemaet på nettstedet.
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Stack>
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
}