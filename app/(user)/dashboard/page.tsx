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
    category: "Konto & Autentisering",
    badgeColor: "terracotta",
    items: [
      {
        id: "prof_settings",
        label: "Profil & Kontostyring",
        description: "Endre navn, e-post, passord og permanent sletting av konto.",
        completed: true,
      },
      {
        id: "prof_auth_security",
        label: "Sikkerhet & Google OAuth",
        description: "Registrering og innlogging med Google, lokal passordopprettelse og JWT-sesjoner.",
        completed: true,
      },
      {
        id: "prof_email_verification",
        label: "E-postverifisering & Notifikasjonssystem",
        description: "Utsending av bekreftelseslenker, 7/14-dagers påminnelser og automatiske e-postvarsler.",
        completed: true,
      },
      {
        id: "prof_google_lock_alert",
        label: "Varsel for sperret Google-konto",
        description: "Tydelig tilbakemelding i innloggingsskjermen dersom en sperret Google-bruker forsøker å logge inn.",
        completed: false,
      },
      {
        id: "prof_gdpr_export",
        label: "GDPR-datainnsyn & Eksport",
        description: "Mulighet for brukeren til å hente ut og laste ned alle sine registrerte personopplysninger.",
        completed: false,
      },
      {
        id: "prof_preferences",
        label: "Kosthold, Allergier & App-innstillinger",
        description: "Registrere allergier med advarsler, standard porsjoner og mørk/lys modus.",
        completed: false,
      },
    ],
  },
  {
    category: "Oppskrifter & Søk",
    badgeColor: "sage",
    items: [
      {
        id: "imp_scraper",
        label: "Oppskriftsimporter (Scraper)",
        description: "Lim inn URL fra godkjente nettsider for automatisk import.",
        completed: false,
      },
      {
        id: "rec_edit_create",
        label: "Opprettelse & Full Redigerbarhet",
        description: "Lag egne oppskrifter eller rediger skrapte oppskrifter helt fritt.",
        completed: false,
      },
      {
        id: "rec_fridge_search",
        label: "Avansert Søk (\"Tøm Kjøleskapet\")",
        description: "Søk på navn, kategori eller ingredienser du har tilgjengelig.",
        completed: false,
      },
      {
        id: "rec_stats_fav",
        label: "Brukshistorikk & Favoritter",
        description: "Stjernemerking, teller for antall ganger laget og \"sist laget\"-dato.",
        completed: false,
      },
      {
        id: "rec_cook_mode",
        label: "Kokkemodus & Timer",
        description: "Skjerm-keepalive, porsjonskalkulator og innebygd nedtellingsur for koketider.",
        completed: false,
      },
    ],
  },
  {
    category: "Ukesmeny & Handleliste",
    badgeColor: "sage",
    items: [
      {
        id: "plan_planner",
        label: "Måltidsplanlegger",
        description: "Kalenderoversikt (Mandag–Søndag) for planlegging av måltider.",
        completed: false,
      },
      {
        id: "plan_nutrition",
        label: "Nærings- & Vitaminoppsummering",
        description: "Beregning av kalorier og næringsinnhold per rett og sum per dag/uke.",
        completed: false,
      },
      {
        id: "plan_shopping_list",
        label: "Dynamisk Handleliste",
        description: "Automatisk sammenslåing av ingredienser fra ukesmenyen med sjekkliste.",
        completed: false,
      },
      {
        id: "extra_pdf",
        label: "PDF & Utskrift (Ekstra Feature)",
        description: "Generere utskriftsvennlig versjon av oppskrifter, ukesmeny og handleliste.",
        completed: false,
      },
    ],
  },
];

const UserDashboardPage = () => {
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
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>🍳 Min Kjøkkenhylle</Title>
            <Text c="dimmed" size="sm">
              Oversikt over planlagte brukerfunksjoner og utviklingsfremdrift
            </Text>
          </div>
          <Badge size="lg" variant="light" color="sage">
            Kjøkkenhylla v1.0
          </Badge>
        </Group>

        <Paper p="md" radius="md" withBorder>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw={500}>Funksjonsutvikling Fremdrift</Text>
              <Text size="sm" c="dimmed">
                {completedItems} av {totalItems} funksjoner fullført ({progressPercentage}%)
              </Text>
            </Group>
            <Progress value={progressPercentage} color="sage" size="xl" radius="xl" animated />
          </Stack>
        </Paper>

        <Tabs defaultValue="Konto & Autentisering" color="sage">
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

export default UserDashboardPage;