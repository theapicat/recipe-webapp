"use client";

import { Title, Text, Paper, Stack, Badge, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

export default function AccessibilityPage() {
    return (
      <Paper p="xl" radius="md" withBorder shadow="xs">
          <Stack gap="lg">
              <div>
                  <Badge color="sage" variant="light" mb="xs">
                      Sist oppdatert: 25. august 2026
                  </Badge>
                  <Title order={2} size="h2">
                      Tilgjengelighetserklæring
                  </Title>
                  <Text size="sm" c="dimmed" mt={4}>
                      Kjøkkenhylla har som mål å være et oversiktlig og tilgjengelig verktøy for flest mulig brukere.
                  </Text>
              </div>

              <Stack gap="md">
                  <div>
                      <Title order={3} size="h4" mb={6}>
                          1. Status for tilgjengelighet
                      </Title>
                      <Text size="sm" lh={1.6}>
                          Kjøkkenhylla er per i dag <b>ikke formelt auditert eller i fullstendig samsvar</b> med etablerte retningslinjer for universell utforming av IKT (WCAG 2.1). Applikasjonen bygger på Mantine UI som gir grunnleggende støtte for semantisk HTML, tastaturnavigasjon og skjermlesere out-of-the-box.
                      </Text>
                  </div>

                  <Alert
                    color="terracotta"
                    title="2. Kjente utfordringer og områder for forbedring"
                    icon={<IconInfoCircle size={20} />}
                    radius="md"
                  >
                      <Text size="xs" mb="xs">
                          Vi er oppmerksomme på følgende områder som krever forbedring:
                      </Text>
                      <Stack gap={4}>
                          <Text size="xs">
                              • <b>Skjermlesere:</b> Enkelte dynamiske komponenter eller skjemaer kan mangle optimale ARIA-etiketter.
                          </Text>
                          <Text size="xs">
                              • <b>Kontraster:</b> Enkelte fargekombinasjoner kan ha utilstrekkelig kontrast i spesifikke visningsmoduser.
                          </Text>
                          <Text size="xs">
                              • <b>Tastaturbetjening:</b> Avansert interaksjon (som drag-and-drop i måltidsplanleggeren) har begrenset støtte for ren tastaturbetjening.
                          </Text>
                      </Stack>
                  </Alert>

                  <div>
                      <Title order={3} size="h4" mb={6}>
                          3. Vårt videre arbeid & Tilbakemeldinger
                      </Title>
                      <Text size="sm" lh={1.6}>
                          Etter hvert som kjernefunksjonaliteten i applikasjonen modnes, vil vi fortløpende utbedre universell utforming. Opplever du at innhold ikke er tilgjengelig for deg? Ta gjerne kontakt med oss via kontaktskjemaet.
                      </Text>
                  </div>
              </Stack>
          </Stack>
      </Paper>
    );
}