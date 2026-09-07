"use client";

import React from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Card,
  SimpleGrid,
  ThemeIcon,
  Button,
  Divider,
} from "@mantine/core";
import {
  IconSparkles,
  IconArrowRight,
  IconLink,
  IconCalendarEvent,
} from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import {
  FEATURE_CATEGORIES,
  FEATURES_DATA,
  STATUS_CONFIG,
  FeatureItem,
} from "./featuresData";

function FeatureCard({ item }: { item: FeatureItem }) {
  const IconComponent = item.icon;
  const statusConfig = STATUS_CONFIG[item.status];

  const itemColor =
    item.color === "teal"
      ? "sage"
      : item.color === "orange"
        ? "terracotta"
        : item.color;

  const statusColor =
    statusConfig.color === "teal"
      ? "sage"
      : statusConfig.color === "orange"
        ? "terracotta"
        : statusConfig.color;

  return (
    <Card withBorder radius="md" p="lg" shadow="sm">
      <Group justify="space-between" align="flex-start" mb="sm">
        <ThemeIcon size={44} radius="md" color={itemColor} variant="light">
          <IconComponent size={24} />
        </ThemeIcon>
        <Badge color={statusColor} variant="light" size="sm">
          {statusConfig.label}
        </Badge>
      </Group>

      <Text fw={600} size="lg" mb={4}>
        {item.title}
      </Text>
      <Text size="sm" c="dimmed" lh={1.5}>
        {item.description}
      </Text>
    </Card>
  );
}

export default function FeaturePage() {
  return (
    <AsyncMainContainer size="lg" py={40}>
      <Stack gap={40}>
        {/* --- HERO BANNER --- */}
        <Paper
          p={{ base: "xl", md: "50" }}
          radius="lg"
          style={{
            background:
              "linear-gradient(135deg, var(--mantine-color-sage-9) 0%, var(--mantine-color-sage-7) 100%)",
            color: "white",
          }}
        >
          <Stack gap="md" align="center" ta="center">
            <Badge size="lg" color="sage.1" variant="white" c="sage.9">
              <Group gap={6}>
                <IconSparkles size={14} />
                <span>Din personlige oppskriftsbok</span>
              </Group>
            </Badge>

            <Title order={1} size="h1" style={{ fontSize: "2.4rem", fontWeight: 800 }}>
              Gjør hverdagsmaten enklere med Kjøkkenhylla
            </Title>

            <Text size="lg" style={{ opacity: 0.9, maxWidth: 640 }}>
              Ingen faste oppskrifter – her bygger du din egen kokebok ved å importere fra favorittsider eller dele med venner. Planlegg uken og generer automatisk handleliste.
            </Text>

            {/* To knapper som fremhever handlinger */}
            <Group mt="md">
              <Button
                component={Link}
                href="/user/import"
                size="md"
                variant="white"
                c="sage.9"
                leftSection={<IconLink size={18} />}
                rightSection={<IconArrowRight size={18} />}
              >
                Importer Oppskrift
              </Button>
              <Button
                component={Link}
                href="/user/mealplan"
                size="md"
                variant="outline"
                color="white"
                leftSection={<IconCalendarEvent size={18} />}
              >
                Prøv Ukesmenyen
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* --- DYNAMISKE KATEGORIER --- */}
        {FEATURE_CATEGORIES.map((category, index) => {
          const categoryItems = FEATURES_DATA.filter(
            (f) => f.category === category.id
          );

          const badgeColor =
            category.badgeColor === "teal"
              ? "sage"
              : category.badgeColor === "orange"
                ? "terracotta"
                : category.badgeColor;

          return (
            <React.Fragment key={category.id}>
              {index > 0 && <Divider />}

              <Stack gap="md">
                <div>
                  <Badge color={badgeColor} variant="dot" size="md">
                    {category.badgeLabel}
                  </Badge>
                  <Title order={2} mt={4}>
                    {category.title}
                  </Title>
                </div>
                <Text c="dimmed" size="sm" mt={-8}>
                  {category.subtitle}
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                  {categoryItems.map((item) => (
                    <FeatureCard key={item.id} item={item} />
                  ))}
                </SimpleGrid>
              </Stack>
            </React.Fragment>
          );
        })}

        {/* --- BOTTOM CALL TO ACTION --- */}
        <Paper p="xl" radius="md" withBorder>
          <Group justify="space-between" align="center" wrap="wrap">
            <Stack gap="xs" style={{ maxWidth: 500 }}>
              <Title order={3}>Klar til å samle oppskriftene dine?</Title>
              <Text size="sm" c="dimmed">
                Lim inn en lenke fra din favorittside, eller opprett din første oppskrift manuelt i dag.
              </Text>
            </Stack>
            <Group>
              <Button
                component={Link}
                href="/user/import"
                color="sage"
                size="md"
                leftSection={<IconLink size={18} />}
              >
                Importer Nå
              </Button>
            </Group>
          </Group>
        </Paper>
      </Stack>
    </AsyncMainContainer>
  );
}