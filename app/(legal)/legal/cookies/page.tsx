"use client";

import {
  Title,
  Text,
  Paper,
  Stack,
  Badge,
  Table,
  Alert,
  Divider,
} from "@mantine/core";
import { IconShieldCheck } from "@tabler/icons-react";

export default function CookiesPage() {
  return (
    <Paper p="xl" radius="md" withBorder shadow="xs">
      <Stack gap="lg">
        <div>
          <Badge color="sage" variant="light" mb="xs">
            Sist oppdatert: 9. september 2026
          </Badge>
          <Title order={2} size="h2">
            Informasjon om informasjonskapsler (Cookies)
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Kjøkkenhylla benytter informasjonskapsler utelukkende for at tjenesten skal fungere trygt og sikkert.
          </Text>
        </div>

        <Stack gap="xl">
          {/* Seksjon 1 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              1. Hva er informasjonskapsler?
            </Title>
            <Text size="sm" lh={1.6}>
              En informasjonskapsel er en liten tekstfil som lagres på din enhet (smarttelefon, nettbrett eller datamaskin) når du besøker et nettsted. Kapslene gjør det mulig for nettstedet å kjenne igjen enheten din og huske at du er innlogget.
            </Text>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 2 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              2. Informasjonskapsler vi bruker
            </Title>
            <Text size="sm" lh={1.6} mb="xs">
              Vi praktiserer dataminimering og benytter <b>utelukkende strengt nødvendige kapsler</b> fra første part (Kjøkkenhylla):
            </Text>

            <Table highlightOnHover withTableBorder verticalSpacing="sm" mb="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kategori</Table.Th>
                  <Table.Th>Formål</Table.Th>
                  <Table.Th>Type</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>
                    <Text fw={600} size="xs">Autentisering og innlogging</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">
                      Husker at du er innlogget, håndterer utløpstider for din økt, og gjør at du slipper å oppgi passord for hver side du navigerer til.
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color="sage">Nødvendig</Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Text fw={600} size="xs">Sesjonshåndtering og sikkerhet</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">
                      Sikrer at forespørsler som sendes til serveren faktisk kommer fra din gyldige økt, noe som beskytter mot uautorisert tilgang.
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color="sage">Nødvendig</Badge>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            <Text size="xs" c="dimmed" fs="italic">
              *(Visningsinnstillinger som for eksempel lyst eller mørkt tema lagres direkte lokalt på din enhet via nettleseren, og sendes ikke til våre servere som informasjonskapsler).*
            </Text>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 3 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              3. Tredjepartskapsler
            </Title>
            <Alert color="sage" variant="light" title="Ingen tredjepartskapsler" icon={<IconShieldCheck size={20} />}>
              Per i dag benytter Kjøkkenhylla <b>ingen tredjepartskapsler</b>. Det betyr at vi ikke plasserer kapsler fra eksterne annonsører, sosiale medier eller sporingstjenester (som Google Analytics eller Facebook Pixel) på din enhet.
            </Alert>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 4 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              4. Endringer i bruk av kapsler
            </Title>
            <Text size="sm" lh={1.6}>
              Dersom vi i fremtiden introduserer nye funksjoner eller tjenester som krever andre typer informasjonskapsler (for eksempel valgfrie analysetjenester), vil denne erklæringen oppdateres. Om det blir påkrevd etter lovverket, vil vi selvsagt innhente samtykke før slike kapsler tas i bruk.
            </Text>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 5 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              5. Kontakt oss
            </Title>
            <Text size="sm" lh={1.6}>
              Har du spørsmål om vår bruk av informasjonskapsler, kan du kontakte oss via kontaktskjemaet på nettstedet.
            </Text>
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
}