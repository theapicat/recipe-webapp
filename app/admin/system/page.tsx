"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Table,
  Badge,
  Button,
  Alert,
  SimpleGrid,
  Card,
  Anchor,
  ThemeIcon,
  Progress,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconActivity,
  IconServer,
  IconExternalLink,
  IconInfoCircle,
  IconRefresh,
  IconMessage2,
  IconListCheck,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

interface ServiceStatus {
  id: string;
  name: string;
  type: "API" | "Database" | "Meldingskø" | "Loggtjeneste";
  endpoint: string;
  status: "Operativ" | "Degradert" | "Nede";
  responseTime: string;
  uptime: string;
}

const mockServices: ServiceStatus[] = [
  {
    id: "srv-1",
    name: "Core API",
    type: "API",
    endpoint: "/health",
    status: "Operativ",
    responseTime: "14 ms",
    uptime: "99.98%",
  },
  {
    id: "srv-2",
    name: "Scraper Service",
    type: "API",
    endpoint: "/health",
    status: "Operativ",
    responseTime: "42 ms",
    uptime: "99.85%",
  },
  {
    id: "srv-3",
    name: "PostgreSQL Database",
    type: "Database",
    endpoint: "db:5432",
    status: "Operativ",
    responseTime: "4 ms",
    uptime: "100%",
  },
  {
    id: "srv-4",
    name: "RabbitMQ Message Broker",
    type: "Meldingskø",
    endpoint: "localhost:15672",
    status: "Operativ",
    responseTime: "8 ms",
    uptime: "99.99%",
  },
  {
    id: "srv-5",
    name: "Seq Log Server",
    type: "Loggtjeneste",
    endpoint: "localhost:5341",
    status: "Operativ",
    responseTime: "11 ms",
    uptime: "99.90%",
  },
];

const mockRecentLogs = [
  {
    id: "log-1",
    time: "14:23:10",
    service: "Scraper Service",
    level: "INFO",
    message: "Vellykket skraping av oppskrift fra matprat.no/oppskrifter/...",
  },
  {
    id: "log-2",
    time: "14:15:02",
    service: "Core API",
    level: "WARN",
    message: "Avvist skrapeforespørsel: domenet 'ukjent-blogg.no' er ikke i whitelist.",
  },
  {
    id: "log-3",
    time: "13:58:44",
    service: "Scraper Service",
    level: "ERROR",
    message: "Kunne ikke hente HTML fra 'godt.no/...': Timeout etter 10000ms.",
  },
];

export default function AdminSystemPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <AsyncMainContainer size="lg" py={30}>
      <Stack gap="lg">
        {/* Prototyping Varsel */}
        <Alert
          color="terracotta"
          title="🎨 Prototyping / Mockup-side"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Dette er en visuell skisse for <b>System & Helse</b>. Sanntidsovervåking og helsesjekker vil koble seg direkte mot de ulike mikrotjenestenes <code>/health</code>-endepunkter.
        </Alert>

        {/* Overskrift */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>⚙️ System, Helse & Infrastruktur</Title>
            <Text c="dimmed" size="sm">
              Overvåking av mikrotjenester, logger og infrastrukturtjenester
            </Text>
          </div>
          <Tooltip label="Oppdater status">
            <ActionIcon
              variant="outline"
              color="sage"
              size="lg"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Infrastruktur Snarveier (Cards) */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Card withBorder padding="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Group gap="sm">
                <ThemeIcon color="sage" size="lg" radius="md" variant="light">
                  <IconActivity size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="sm">
                    Seq Log Dashboard
                  </Text>
                  <Text size="xs" c="dimmed">
                    Sentralisert strukturert logging (Port 5341)
                  </Text>
                </div>
              </Group>
              <Badge color="sage" variant="light">
                Port 5341
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" mb="md">
              Søk i sanntidslogger, spor feilmeldinger og analyser hendelser på tvers av mikrotjenestene.
            </Text>
            <Button
              component="a"
              href="http://localhost:5341"
              target="_blank"
              variant="light"
              color="sage"
              size="xs"
              rightSection={<IconExternalLink size={14} />}
            >
              Åpne Seq Dashboard
            </Button>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Group gap="sm">
                <ThemeIcon color="terracotta" size="lg" radius="md" variant="light">
                  <IconMessage2 size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="sm">
                    RabbitMQ Manager
                  </Text>
                  <Text size="xs" c="dimmed">
                    Meldingskø for skrapejobber (Port 15672)
                  </Text>
                </div>
              </Group>
              <Badge color="terracotta" variant="light">
                Port 15672
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" mb="md">
              Overvåk meldingskøer, aktive arbeidere og asynkrone jobber som sendes mellom Core API og Scraper.
            </Text>
            <Button
              component="a"
              href="http://localhost:15672"
              target="_blank"
              variant="light"
              color="terracotta"
              size="xs"
              rightSection={<IconExternalLink size={14} />}
            >
              Åpne RabbitMQ Manager
            </Button>
          </Card>
        </SimpleGrid>

        {/* Mikrotjenester Health Status */}
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs">
                <IconServer size={20} color="var(--mantine-color-sage-6)" />
                <Text fw={600}>Mikrotjenester Status (/health)</Text>
              </Group>
              <Badge color="sage" variant="light">
                Alle Tjenester Operative
              </Badge>
            </Group>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tjeneste</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Endepunkt / Adresse</Table.Th>
                  <Table.Th>Responstid</Table.Th>
                  <Table.Th>Oppetid (Uptime)</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mockServices.map((srv) => (
                  <Table.Tr key={srv.id}>
                    <Table.Td>
                      <Text fw={500} size="sm">
                        {srv.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="gray" variant="light" size="sm">
                        {srv.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" style={{ fontFamily: "monospace" }}>
                        {srv.endpoint}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{srv.responseTime}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" style={{ width: 120 }}>
                        <Progress value={99.9} color="sage" size="xs" style={{ flex: 1 }} />
                        <Text size="xs" c="dimmed">
                          {srv.uptime}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={srv.status === "Operativ" ? "sage" : "red"}
                        variant="dot"
                      >
                        {srv.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>

        {/* Nylige Logg-hendelser (Scraper / Feillogg Utforsking) */}
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs">
                <IconListCheck size={20} color="var(--mantine-color-terracotta-filled)" />
                <Text fw={600}>Siste Systemhendelser & Feillogger</Text>
              </Group>
              <Anchor size="xs" href="http://localhost:5341" target="_blank">
                Se alle logger i Seq →
              </Anchor>
            </Group>

            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tid</Table.Th>
                  <Table.Th>Tjeneste</Table.Th>
                  <Table.Th>Nivå</Table.Th>
                  <Table.Th>Melding</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {mockRecentLogs.map((log) => (
                  <Table.Tr key={log.id}>
                    <Table.Td>
                      <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
                        {log.time}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={500}>
                        {log.service}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="xs"
                        color={
                          log.level === "ERROR"
                            ? "red"
                            : log.level === "WARN"
                              ? "terracotta"
                              : "sage"
                        }
                      >
                        {log.level}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" style={{ fontFamily: "monospace" }}>
                        {log.message}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      </Stack>
    </AsyncMainContainer>
  );
}