"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Alert,
  ThemeIcon,
  Divider,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
  IconCircleX,
  IconInfoCircle,
  IconCalendarEvent,
  IconShieldCheck,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

// --- TYPER FOR OFFENTLIG STATUS ---
export type PublicStatus = "OPERATIONAL" | "DEGRADED" | "OUTAGE" | "MAINTENANCE";

export interface PublicServiceStatus {
  id: string;
  name: string;
  description: string;
  status: PublicStatus;
}

export interface IncidentReport {
  id: string;
  date: string;
  title: string;
  status: "Løst" | "Under undersøkelse" | "Planlagt";
  impact: "Mindre" | "Kritisk" | "Ingen";
  summary: string;
}

// --- OFFENTLIGE MOCK-DATA ---
const PUBLIC_SERVICES: PublicServiceStatus[] = [
  {
    id: "web-app",
    name: "Nettside & Brukergrensesnitt",
    description: "Tilgang til Kjøkkenhylla på nett og mobil",
    status: "OPERATIONAL",
  },
  {
    id: "recipe-search",
    name: "Søk & Oppskriftskatalog",
    description: "Søk i oppskrifter, ingredienser og ukemenyer",
    status: "OPERATIONAL",
  },
  {
    id: "recipe-importer",
    name: "Oppskrift-import (Skraper)",
    description: "Automatisk henting og lagring av oppskrifter fra eksterne lenker",
    status: "OPERATIONAL",
  },
  {
    id: "user-sync",
    name: "Brukerkonto & Lagring",
    description: "Innlogging, handlelister og personlige favoritter",
    status: "OPERATIONAL",
  },
];

const INCIDENT_HISTORY: IncidentReport[] = [
  {
    id: "inc-2",
    date: "24. august 2026",
    title: "Midlertidig treghet ved import fra enkelte matblogger",
    status: "Løst",
    impact: "Mindre",
    summary:
      "Enkelte eksterne nettsider endret struktur, noe som førte til lengre ventetid ved import. Problemet ble utbedret samme dag.",
  },
  {
    id: "inc-1",
    date: "10. august 2026",
    title: "Planlagt databaseservice",
    status: "Planlagt",
    impact: "Ingen",
    summary:
      "Rutinemessig oppgradering av databasen ble gjennomført uten nedtid for brukerne.",
  },
];

// Hjelpefunksjon for å vise status-badges
function getStatusBadge(status: PublicStatus) {
  switch (status) {
    case "OPERATIONAL":
      return <Badge color="sage" variant="light">Operativ</Badge>;
    case "DEGRADED":
      return <Badge color="terracotta" variant="light">Redusert ytelse</Badge>;
    case "OUTAGE":
      return <Badge color="red" variant="light">Ute av drift</Badge>;
    case "MAINTENANCE":
      return <Badge color="blue" variant="light">Vedlikehold</Badge>;
  }
}

function getStatusIcon(status: PublicStatus) {
  switch (status) {
    case "OPERATIONAL":
      return <IconCheck size={18} />;
    case "DEGRADED":
    case "MAINTENANCE":
      return <IconAlertTriangle size={18} />;
    case "OUTAGE":
      return <IconCircleX size={18} />;
  }
}

export default function PublicStatusPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulerer oppdatering fra ditt interne API
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  // Sjekk om alt er OK totalt sett
  const isAllOperational = PUBLIC_SERVICES.every((s) => s.status === "OPERATIONAL");

  return (
    <AsyncMainContainer size="md" py={40}>
      <Stack gap="xl">
        {/* --- PROTOTYPING VARSEL --- */}
        <Alert
          color="terracotta"
          title="🚧 Mockup / Under utvikling"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Dette er kun en visuell prototype av statussiden. Dataene som vises her er for øyeblikket ikke reelle. I fremtiden vil denne siden koble seg automatisk mot faktiske helsesjekker.
        </Alert>

        {/* --- HEADER --- */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={1} size="h2">
              Systemstatus
            </Title>
            <Text c="dimmed" size="sm">
              Sanntidsstatus og oversikt over Kjøkkenhyllas tjenester
            </Text>
          </div>

          <Tooltip label="Oppdater status">
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* --- MAIN STATUS BANNER --- */}
        <Paper p="lg" radius="md" withBorder>
          <Group gap="md">
            <ThemeIcon
              color={isAllOperational ? "sage" : "terracotta"}
              size={48}
              radius="xl"
              variant="light"
            >
              {isAllOperational ? <IconShieldCheck size={28} /> : <IconAlertTriangle size={28} />}
            </ThemeIcon>
            <div>
              <Title order={3} size="h3">
                {isAllOperational
                  ? "Alle systemer fungerer normalt"
                  : "Enkelte tjenester har redusert funksjonalitet"}
              </Title>
              <Text size="sm" c="dimmed">
                {isAllOperational
                  ? "Ingen rapporterte avbrudd eller problemer akkurat nå."
                  : "Vi jobber med å utbedre en kjent feil."}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* --- TJENESTEOVERSIKT --- */}
        <Paper p="md" radius="md" withBorder shadow="xs">
          <Stack gap="md">
            <Text fw={600} size="lg">
              Tjenestestatus
            </Text>
            <Divider />

            <Stack gap="sm">
              {PUBLIC_SERVICES.map((service, index) => (
                <div key={service.id}>
                  <Group justify="space-between" align="center" py="xs">
                    <Group gap="sm">
                      <ThemeIcon
                        color={service.status === "OPERATIONAL" ? "sage" : "terracotta"}
                        variant="light"
                        size="md"
                        radius="xl"
                      >
                        {getStatusIcon(service.status)}
                      </ThemeIcon>
                      <div>
                        <Text fw={500} size="sm">
                          {service.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {service.description}
                        </Text>
                      </div>
                    </Group>

                    {getStatusBadge(service.status)}
                  </Group>
                  {index < PUBLIC_SERVICES.length - 1 && <Divider variant="dotted" />}
                </div>
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* --- DRIFTSOPPDATERINGER OG HISTORIKK --- */}
        <Paper p="md" radius="md" withBorder shadow="xs">
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs">
                <IconCalendarEvent size={20} color="var(--mantine-color-gray-6)" />
                <Text fw={600} size="lg">
                  Nylige hendelser og vedlikehold
                </Text>
              </Group>
            </Group>
            <Divider />

            {INCIDENT_HISTORY.length > 0 ? (
              <Stack gap="lg">
                {INCIDENT_HISTORY.map((incident) => (
                  <Paper key={incident.id} p="sm" radius="sm" withBorder>
                    <Group justify="space-between" mb={4}>
                      <Group gap="xs">
                        <Text fw={600} size="sm">
                          {incident.title}
                        </Text>
                        <Badge size="xs" variant="outline" color="gray">
                          {incident.date}
                        </Badge>
                      </Group>
                      <Badge
                        size="xs"
                        variant="light"
                        color={incident.status === "Løst" ? "sage" : "terracotta"}
                      >
                        {incident.status}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {incident.summary}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="md">
                Ingen hendelser registrert de siste 90 dagene.
              </Text>
            )}
          </Stack>
        </Paper>

        {/* --- FOOTER INFORMASJON --- */}
        <Group justify="center" gap="xs">
          <IconInfoCircle size={16} color="gray" />
          <Text size="xs" c="dimmed">
            Denne siden oppdateres automatisk hvert minutt. Opplever du problemer? Kontakt support.
          </Text>
        </Group>
      </Stack>
    </AsyncMainContainer>
  );
}