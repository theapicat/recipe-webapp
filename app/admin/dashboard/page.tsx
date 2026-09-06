"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Checkbox,
  Badge,
  Tabs,
  Card,
  Progress,
  Anchor,
  Alert,
} from "@mantine/core";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

interface TodoItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

interface CategoryTodos {
  category: string;
  badgeColor: string;
  items: TodoItem[];
}

const initialRoadmap: CategoryTodos[] = [
  {
    category: "Brukeradministrasjon",
    badgeColor: "blue",
    items: [
      {
        id: "usr_list",
        label: "Brukeroversikt",
        description: "Tabell over alle registrerte brukere med søk og filtrering.",
        completed: true,
      },
      {
        id: "usr_lock",
        label: "Låse / Låse opp kontoer",
        description: "Mulighet til å deaktivere og gjenåpne brukere ved behov.",
        completed: true,
      },
      {
        id: "usr_reset_del",
        label: "Passord-nullstilling & Sletting",
        description: "Administrativ tilbakestilling av passord og sletting av kontoer.",
        completed: true,
      },
      {
        id: "usr_google_sso",
        label: "Google SSO-innlogging",
        description: "Sømløs registrering og innlogging med Google-konto.",
        completed: true,
      },
      {
        id: "usr_google_lock_alert",
        label: "Feilvarsel for låste Google-brukere",
        description: "Gi tydelig feilmelding/varsel når en sperret eller svartelistet Google-bruker forsøker å logge inn.",
        completed: true,
      },
      {
        id: "usr_custom_email",
        label: "Direkte e-postsending fra Admin",
        description: "Mulighet til å sende tilpassede e-poster til brukere direkte fra admin-grensesnittet.",
        completed: true,
      },
      {
        id: "usr_blacklist",
        label: "Svartelisting (E-post & Domener)",
        description: "Sperre spesifikke e-postadresser eller hele e-postdomener fra å registrere seg igjen.",
        completed: true,
      },
      {
        id: "usr_status_filter",
        label: "Filtrering på Påminnelser & Inaktivitet",
        description: "Søke og filtrere på brukere basert på aktiveringspåminnelser og inaktivitetsstatus.",
        completed: true,
      },
      {
        id: "usr_auth_api_docs",
        label: "Auth API Dokumentasjon, Refaktorering & README",
        description: "Grundig kodedokumentasjon, refaktorering, kommentarer og ny README.md for Auth API.",
        completed: false,
      },
    ],
  },
  {
    category: "UI, Design & E-post",
    badgeColor: "pink",
    items: [
      {
        id: "ui_theme",
        label: "Helhetlig profil & Mantine Theme",
        description: "Standardisere farger, typografi og komponenter i Mantine for et konsistent uttrykk i hele løsningen.",
        completed: false,
      },
      {
        id: "ui_logo_favicon",
        label: "Standardisere Logoer & Favicon",
        description: "Samkjøre logo-SVG for header, footer og ikoner, samt legge til favicons for alle enheter.",
        completed: false,
      },
      {
        id: "ui_email_templates",
        label: "E-postmaler i Notification Service",
        description: "Styre opp og standardisere HTML-malene som sendes ut slik at de matcher nettsidens visuelle profil.",
        completed: false,
      },
    ],
  },
  {
    category: "Innhold & Whitelist",
    badgeColor: "green",
    items: [
      {
        id: "rec_whitelist",
        label: "Godkjente Nettsider (Domene-Whitelist)",
        description: "Administrere liste over domener Core API tillater skraping fra (f.eks. matprat.no).",
        completed: false,
      },
      {
        id: "rec_categories",
        label: "Kategori- & Råvareregister",
        description: "Administrere og justere globale kategorier, ingredienser og måleenheter.",
        completed: false,
      },
    ],
  },
  {
    category: "System & Helse",
    badgeColor: "violet",
    items: [
      {
        id: "sys_health",
        label: "Live Systemstatus",
        description: "Egnet side/visning for mikrotjenestenes /health-status.",
        completed: false,
      },
      {
        id: "sys_seq",
        label: "Seq Log Shortcut",
        description: "Direktelenke til Seq logg-dashboard (Port 5341).",
        completed: false,
      },
      {
        id: "sys_rabbitmq",
        label: "RabbitMQ Dashboard Shortcut",
        description: "Direktelenke til RabbitMQ for overvåking av meldingskøer (Port 15672).",
        completed: false,
      },
    ],
  },
  {
    category: "Scraper (Utforskes)",
    badgeColor: "orange",
    items: [
      {
        id: "sc_error_logs",
        label: "Scraper Feillogger",
        description: "Oversikt over feilede skrapeforsøk (f.eks. endret HTML-struktur på eksterne sider).",
        completed: false,
      },
    ],
  },
];

const AdminDashboardPage = () => {
  const [roadmap, setRoadmap] = useState<CategoryTodos[]>(initialRoadmap);

  const toggleItem = (categoryId: string, itemId: string) => {
    const updated = roadmap.map((cat) => {
      if (cat.category !== categoryId) return cat;
      return {
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      };
    });

    setRoadmap(updated);
  };

  const totalItems = roadmap.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = roadmap.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.completed).length,
    0
  );
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <AsyncMainContainer size="lg" py={30}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>👑 Admin Dashboard</Title>
            <Text c="dimmed" size="sm">
              Kjøkkenhylla Administrasjon & Huskeliste
            </Text>
          </div>
          <Badge size="lg" variant="filled" color="teal">
            Kjøkkenhylla Admin
          </Badge>
        </Group>

        {/* Fremgang */}
        <Paper p="md" radius="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw={500}>Systemutvikling Fremdrift</Text>
              <Text size="sm" c="dimmed">
                {completedItems} av {totalItems} funksjoner fullført ({progressPercentage}%)
              </Text>
            </Group>
            <Progress value={progressPercentage} color="teal" size="xl" radius="xl" animated />
          </Stack>
        </Paper>

        {/* Infrastruktur Snarveier */}
        <Alert color="blue" title="🔗 Infrastruktur & Verktøy" radius="md">
          <Group gap="md" mt="xs">
            <Anchor href="http://localhost:5341" target="_blank" size="sm" fw={500}>
              🔍 Åpne Seq Log Dashboard (5341)
            </Anchor>
            <Anchor href="http://localhost:15672" target="_blank" size="sm" fw={500}>
              🐰 Åpne RabbitMQ Manager (15672)
            </Anchor>
          </Group>
        </Alert>

        {/* Tabs for Kategorier */}
        <Tabs defaultValue="Brukeradministrasjon">
          <Tabs.List mb="md">
            {roadmap.map((cat) => (
              <Tabs.Tab key={cat.category} value={cat.category}>
                {cat.category}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {roadmap.map((cat) => (
            <Tabs.Panel key={cat.category} value={cat.category}>
              <Stack gap="md">
                {cat.items.map((item) => (
                  <Card key={item.id} withBorder radius="md" padding="sm">
                    <Group align="flex-start" justify="space-between">
                      <Checkbox
                        checked={item.completed}
                        onChange={() => toggleItem(cat.category, item.id)}
                        label={
                          <Text
                            fw={500}
                            style={{
                              textDecoration: item.completed ? "line-through" : "none",
                              color: item.completed ? "var(--mantine-color-dimmed)" : "inherit",
                            }}
                          >
                            {item.label}
                          </Text>
                        }
                        description={item.description}
                        size="md"
                        color={cat.badgeColor}
                      />
                      <Badge color={item.completed ? "gray" : cat.badgeColor} variant="light">
                        {item.completed ? "Fullført" : "Planlagt"}
                      </Badge>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    </AsyncMainContainer>
  );
};

export default AdminDashboardPage;