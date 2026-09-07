"use client";

import { Title, Text, Paper, Stack, Badge, Table, Alert } from "@mantine/core";
import { IconCookie } from "@tabler/icons-react";

export default function CookiesPage() {
  return (
    <Paper p="xl" radius="md" withBorder shadow="xs">
      <Stack gap="lg">
        <div>
          <Badge color="sage" variant="light" mb="xs">
            Sist oppdatert: 25. august 2026
          </Badge>
          <Title order={2} size="h2">
            Informasjon om informasjonskapsler (Cookies)
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Kjøkkenhylla benytter informasjonskapsler og lignende teknologi kun for at tjenesten skal fungere trygt og effektivt.
          </Text>
        </div>

        <Stack gap="md">
          <div>
            <Title order={3} size="h4" mb={6}>
              1. Hva er informasjonskapsler?
            </Title>
            <Text size="sm" lh={1.6}>
              En informasjonskapsel er en liten tekstfil som lagres på din enhet når du besøker et nettsted. Kapslene gjør det mulig for nettstedet å kjenne igjen enheten din og huske om du er innlogget eller hvilke innstillinger du har valgt.
            </Text>
          </div>

          <div>
            <Title order={3} size="h4" mb={6}>
              2. Kapsler vi benytter
            </Title>
            <Text size="sm" lh={1.6} mb="xs">
              Vi benytter utelukkende <b>nødvendige og funksjonelle kapsler</b> fra første part (Kjøkkenhylla):
            </Text>

            <Table highlightOnHover withTableBorder verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kategori</Table.Th>
                  <Table.Th>Formål</Table.Th>
                  <Table.Th>Type</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td><Text fw={600} size="xs">Autentisering</Text></Table.Td>
                  <Table.Td><Text size="xs">Husker at du er innlogget gjennom økten.</Text></Table.Td>
                  <Table.Td><Badge size="xs" color="sage">Nødvendig</Badge></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text fw={600} size="xs">Sikkerhet</Text></Table.Td>
                  <Table.Td><Text size="xs">Sikrer at forespørsler kommer fra din gyldige økt.</Text></Table.Td>
                  <Table.Td><Badge size="xs" color="sage">Nødvendig</Badge></Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Text fw={600} size="xs">Preferanser</Text></Table.Td>
                  <Table.Td><Text size="xs">Lagring av visningsinnstillinger (mørk/lys modus).</Text></Table.Td>
                  <Table.Td><Badge size="xs" color="sage" variant="outline">Funksjonell</Badge></Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </div>

          <Alert color="sage" title="Ingen Tredjepartskapsler" icon={<IconCookie size={20} />}>
            Kjøkkenhylla benytter <b>ingen tredjepartskapsler</b>. Vi plasserer ikke kapsler fra eksterne annonsører, sosiale medier eller sporingstjenester (som Google Analytics) på din enhet.
          </Alert>

          <div>
            <Title order={3} size="h4" mb={6}>
              3. Administrere kapsler
            </Title>
            <Text size="sm" lh={1.6}>
              Du kan selv velge å blokkere eller slette informasjonskapsler i innstillingene til din nettleser. Merk at dersom du deaktiverer strengt nødvendige kapsler, vil du ikke lenger kunne logge inn i Kjøkkenhylla.
            </Text>
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
}