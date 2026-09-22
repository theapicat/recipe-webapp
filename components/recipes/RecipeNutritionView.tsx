"use client";

import { useState } from "react";
import {
  Accordion,
  Alert,
  Badge,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconAlertCircle, IconFlame } from "@tabler/icons-react";
import { groupNutrients } from "@/lib/nutrients/nutrientGrouping";
import { NutrientDefinition } from "@/lib/models/ingredients/NutrientDefinition";
import { RecipeNutrition } from "@/lib/models/recipes/RecipeNutrition";
import { SkippedNutritionReason } from "@/lib/models/recipes/SkippedNutritionLine";
import { capitalize } from "@/lib/text/names";

interface RecipeNutritionViewProps {
  nutrition: RecipeNutrition;
  definitions: NutrientDefinition[];
}

type Scope = "total" | "perServing";
type Detail = "basic" | "expanded" | "detailed";

const REASON_TEXT: Record<SkippedNutritionReason, string> = {
  ToTaste: "etter smak",
  Unconfirmed: "egen ingrediens uten næringsdata",
  NoConversion: "enheten kan ikke regnes om for denne ingrediensen",
};

// «Herav»-linjene i den utvidede visningen, samme oppsett som en vanlig norsk næringsdeklarasjon: energi, fett
// (herav mettet), karbohydrat (herav sukkerarter), protein, fiber, salt.
const EXPANDED_IDS = ["Fett", "Mettet", "Karbo", "Mono+Di", "Fiber", "Protein", "NaCl"];
const EXPANDED_INDENTED = new Set(["Mettet", "Mono+Di"]);

const formatAmount = (value: number, decimals: number) =>
  value.toLocaleString("nb-NO", { maximumFractionDigits: decimals });

const StatTile = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <Paper
    p="md"
    radius="md"
    bg={`${color}.0`}
    ta="center"
    withBorder
    style={{ borderColor: `var(--mantine-color-${color}-2)` }}
  >
    <Text size="xs" c="dimmed">
      {label}
    </Text>
    <Text fw={800} size="xl" c={`${color}.9`}>
      {value}
    </Text>
  </Paper>
);

const NutrientLine = ({
  label,
  value,
  indented = false,
  bold = false,
}: {
  label: string;
  value: string;
  indented?: boolean;
  bold?: boolean;
}) => (
  <Group justify="space-between" pl={indented ? "md" : 0}>
    <Text size="sm" c={indented ? "dimmed" : undefined} fw={bold ? 700 : undefined}>
      {indented ? `– herav ${label.toLowerCase()}` : label}
    </Text>
    <Text size="sm" fw={bold ? 700 : undefined}>
      {value}
    </Text>
  </Group>
);

// Viser næringsberegningen for en oppskrift (RecipeNutrition, hentet på forespørsel — se useRecipeNutrition.ts).
// To uavhengige valg: omfang (hele oppskriften vs. per porsjon — begge tallene ligger allerede i responsen, ren
// klientside-visning) og detaljnivå (enkel: de fire store, utvidet: en vanlig næringsdeklarasjon, detaljert: alt
// som er målt, gruppert som i ingrediens-editoren). `nutrients` er sparsom (kun verdier > 0), så et stoff som
// mangler i lista regnes som 0, ikke ukjent — se RecipeNutrition-modellen.
export const RecipeNutritionView = ({ nutrition, definitions }: RecipeNutritionViewProps) => {
  const [scope, setScope] = useState<Scope>("total");
  const [detail, setDetail] = useState<Detail>("basic");

  const amountOf = (id: string): number => {
    const found = nutrition.nutrients.find((n) => n.nutrientId === id);
    if (!found) return 0;
    return scope === "total" ? found.total : found.perServing;
  };
  const energy =
    scope === "total"
      ? (nutrition.energyKcal?.total ?? 0)
      : (nutrition.energyKcal?.perServing ?? 0);
  const definitionOf = (id: string) => definitions.find((d) => d.id === id);
  const incomplete = nutrition.countedIngredients < nutrition.totalIngredients;

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <SegmentedControl
          value={scope}
          onChange={(value) => setScope(value as Scope)}
          data={[
            { label: `Hele oppskriften (${nutrition.servings} porsjoner)`, value: "total" },
            { label: "Per porsjon", value: "perServing" },
          ]}
        />
        <SegmentedControl
          value={detail}
          onChange={(value) => setDetail(value as Detail)}
          data={[
            { label: "Enkel", value: "basic" },
            { label: "Utvidet", value: "expanded" },
            { label: "Detaljert", value: "detailed" },
          ]}
        />
      </Group>

      {incomplete && (
        <Alert
          color="terracotta"
          variant="light"
          radius="md"
          icon={<IconAlertCircle size={18} />}
          title="Ikke alle ingredienser er talt med"
        >
          <Text size="sm">
            {nutrition.countedIngredients} av {nutrition.totalIngredients} ingredienser er regnet
            med. Veiledende, ikke eksakt.
          </Text>
          {nutrition.skippedLines.length > 0 && (
            <Text size="xs" c="dimmed" mt={4}>
              Ikke talt med:{" "}
              {nutrition.skippedLines
                .map((line) => `${capitalize(line.name)} (${REASON_TEXT[line.reason]})`)
                .join(", ")}
            </Text>
          )}
        </Alert>
      )}

      {detail === "basic" && (
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <StatTile label="Energi" value={`${formatAmount(energy, 0)} kcal`} color="terracotta" />
          <StatTile label="Fett" value={`${formatAmount(amountOf("Fett"), 1)} g`} color="sage" />
          <StatTile
            label="Karbohydrater"
            value={`${formatAmount(amountOf("Karbo"), 1)} g`}
            color="blue"
          />
          <StatTile
            label="Protein"
            value={`${formatAmount(amountOf("Protein"), 1)} g`}
            color="grape"
          />
        </SimpleGrid>
      )}

      {detail === "expanded" && (
        <Paper p="md" radius="md" withBorder>
          <Stack gap={6}>
            <Group gap="xs" mb={2}>
              <ThemeIcon color="terracotta" variant="light" radius="xl" size="sm">
                <IconFlame size={12} />
              </ThemeIcon>
              <Text size="xs" c="dimmed">
                Som en vanlig næringsdeklarasjon
              </Text>
            </Group>
            <NutrientLine label="Energi" value={`${formatAmount(energy, 0)} kcal`} bold />
            {EXPANDED_IDS.map((id) => {
              const def = definitionOf(id);
              if (!def) return null;
              return (
                <NutrientLine
                  key={id}
                  label={capitalize(def.name)}
                  value={`${formatAmount(amountOf(id), def.decimalPrecision)} ${def.unit}`}
                  indented={EXPANDED_INDENTED.has(id)}
                />
              );
            })}
          </Stack>
        </Paper>
      )}

      {detail === "detailed" && (
        <Accordion
          multiple
          variant="separated"
          defaultValue={groupNutrients(definitions).map((b) => b.id)}
        >
          {groupNutrients(definitions).map((block) => {
            const rows = block.sections
              .flatMap((section) => section.definitions)
              .filter((definition) =>
                nutrition.nutrients.some((n) => n.nutrientId === definition.id),
              );
            if (rows.length === 0) return null;

            return (
              <Accordion.Item key={block.id} value={block.id}>
                <Accordion.Control>
                  <Group gap="xs">
                    {capitalize(block.name)}
                    <Badge size="sm" variant="light" color="sage">
                      {rows.length}
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap={4}>
                    {rows.map((definition) => (
                      <NutrientLine
                        key={definition.id}
                        label={capitalize(definition.name)}
                        value={`${formatAmount(amountOf(definition.id), definition.decimalPrecision)} ${definition.unit}`}
                      />
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </Stack>
  );
};
