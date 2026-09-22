"use client";

import { ReactNode } from "react";
import { Accordion, Anchor, Badge, Group, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { IconCircleCheck, IconCircleDashed, IconExternalLink } from "@tabler/icons-react";
import { isOfficialIngredient } from "@/components/admin/ingredients/ingredientForm";
import { groupNutrients } from "@/lib/nutrients/nutrientGrouping";
import { IngredientLookups, nameOf } from "@/components/admin/ingredients/ingredientLookups";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";
import { capitalize } from "@/lib/text/names";

interface IngredientDetailViewProps {
  ingredient: Ingredient;
  lookups: IngredientLookups;
  /** Åpner en annen ingrediens (f.eks. basisingrediensen for en variant). */
  onOpenIngredient?: (id: string) => void;
}

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
      {label}
    </Text>
    <div>{children}</div>
  </div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Text fw={600} mb={6}>
    {children}
  </Text>
);

const formatNumber = (value: number, maxDecimals: number) =>
  value.toLocaleString("nb-NO", { maximumFractionDigits: maxDecimals });

// Skrivebeskyttet, utvidet visning av én ingrediens: nøkkelfakta, allergener, søkeord, porsjoner og næringsverdier
// gruppert etter næringsstoffgruppe. Har ingen admin-spesifikk logikk — kan gjenbrukes av brukerens ingrediensoppslag.
export const IngredientDetailView = ({
  ingredient,
  lookups,
  onOpenIngredient,
}: IngredientDetailViewProps) => {
  const category = nameOf(lookups.categories, ingredient.categoryId);
  const unitType = nameOf(lookups.unitTypes, ingredient.primaryUnitTypeId);
  const unit = lookups.units.find((u) => u.id === ingredient.defaultUnitId);
  const base = lookups.ingredients.find((i) => i.id === ingredient.variantOfIngredientId);

  const measured = new Map(
    ingredient.nutrientValues.map((v) => [v.nutrientDefinitionId, v.quantity]),
  );
  const blocks = groupNutrients(lookups.definitions)
    .map((block) => ({
      ...block,
      sections: block.sections
        .map((section) => ({
          ...section,
          definitions: section.definitions.filter((d) => measured.has(d.id)),
        }))
        .filter((section) => section.definitions.length > 0),
    }))
    .filter((block) => block.sections.length > 0);

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Fact label="Kategori">
          <Text size="sm">{category ? capitalize(category) : "—"}</Text>
        </Fact>
        <Fact label="Verifisert">
          <Group gap={6} wrap="nowrap" c={ingredient.isVerified ? undefined : "dimmed"}>
            {ingredient.isVerified ? (
              <IconCircleCheck size={16} color="var(--mantine-color-sage-6)" />
            ) : (
              <IconCircleDashed size={16} />
            )}
            <Text size="sm">{ingredient.isVerified ? "Ja" : "Nei"}</Text>
          </Group>
        </Fact>
        <Fact label="Opprinnelse">
          <Text size="sm">
            {isOfficialIngredient(ingredient)
              ? "Offisiell — kildedata (låst i editoren)"
              : "Egen — fullt redigerbar"}
          </Text>
        </Fact>
        <Fact label="Enhetstype / standardenhet">
          <Text size="sm">
            {unitType ? capitalize(unitType) : "—"} /{" "}
            {unit ? `${capitalize(unit.name)} (${unit.abbreviation})` : "—"}
          </Text>
        </Fact>
        <Fact label="Energi (per 100 g spiselig del)">
          <Text size="sm">
            {formatNumber(ingredient.energyKcal, 2)} kcal
            {ingredient.energyKj !== null && ` / ${formatNumber(ingredient.energyKj, 2)} kJ`}
          </Text>
        </Fact>
        <Fact label="Spiselig del">
          <Text size="sm">
            {ingredient.ediblePartPercent !== null
              ? `${formatNumber(ingredient.ediblePartPercent, 2)} %`
              : "Ukjent"}
          </Text>
        </Fact>
        <Fact label="Variant av">
          {base && onOpenIngredient ? (
            <Anchor
              component="button"
              type="button"
              size="sm"
              onClick={() => onOpenIngredient(base.id)}
            >
              {capitalize(base.name)}
            </Anchor>
          ) : (
            <Text size="sm">{base ? capitalize(base.name) : "—"}</Text>
          )}
        </Fact>
        <Fact label="Kilde">
          {ingredient.sourceUrl ? (
            <Anchor href={ingredient.sourceUrl} target="_blank" rel="noopener noreferrer" size="sm">
              <Group gap={4} wrap="nowrap">
                {ingredient.sourceId ?? "Åpne kilden"} <IconExternalLink size={14} />
              </Group>
            </Anchor>
          ) : (
            <Text size="sm">{ingredient.sourceId ?? "—"}</Text>
          )}
        </Fact>
      </SimpleGrid>

      <div>
        <SectionTitle>Allergener</SectionTitle>
        {ingredient.allergenIds.length === 0 ? (
          <Text size="sm" c="dimmed">
            Ingen registrert. Allergendata er ufullstendig i registeret — «ingen registrert» betyr
            ikke at ingrediensen er fri for allergener.
          </Text>
        ) : (
          <Group gap={6}>
            {ingredient.allergenIds.map((id) => (
              <Badge key={id} color="terracotta" variant="light" tt="none">
                {capitalize(nameOf(lookups.allergens, id) ?? "Ukjent")}
              </Badge>
            ))}
          </Group>
        )}
      </div>

      <div>
        <SectionTitle>Søkeord</SectionTitle>
        {ingredient.searchKeywordIds.length === 0 ? (
          <Text size="sm" c="dimmed">
            Ingen.
          </Text>
        ) : (
          <Group gap={6}>
            {ingredient.searchKeywordIds.map((id) => (
              <Badge key={id} color="gray" variant="light" tt="none">
                {capitalize(nameOf(lookups.keywords, id) ?? "Ukjent")}
              </Badge>
            ))}
          </Group>
        )}
      </div>

      <div>
        <SectionTitle>Porsjoner</SectionTitle>
        {ingredient.portions.length === 0 ? (
          <Text size="sm" c="dimmed">
            Ingen porsjoner — mengder i andre enheter enn vekt kan ikke regnes om til gram.
          </Text>
        ) : (
          <Table withTableBorder={false} verticalSpacing="xs" w="auto">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Enhet</Table.Th>
                <Table.Th>Gram (spiselig del)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ingredient.portions.map((portion) => {
                const portionUnit = lookups.units.find((u) => u.id === portion.unitId);
                return (
                  <Table.Tr key={portion.id}>
                    <Table.Td>
                      {portionUnit
                        ? `${capitalize(portionUnit.name)} (${portionUnit.abbreviation})`
                        : "Ukjent"}
                    </Table.Td>
                    <Table.Td>{formatNumber(portion.gramsPerPortion, 2)} g</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </div>

      <div>
        <SectionTitle>
          Næringsverdier per 100 g{" "}
          <Text span size="sm" c="dimmed" fw={400}>
            ({measured.size} av {lookups.definitions.length} næringsstoffer registrert)
          </Text>
        </SectionTitle>
        {blocks.length === 0 ? (
          <Text size="sm" c="dimmed">
            Ingen næringsverdier registrert.
          </Text>
        ) : (
          <Accordion multiple variant="separated" defaultValue={blocks.map((b) => b.id)}>
            {blocks.map((block) => (
              <Accordion.Item key={block.id} value={block.id}>
                <Accordion.Control>{capitalize(block.name)}</Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {block.sections.map((section) => (
                      <div key={section.subgroup?.id ?? "main"}>
                        {section.subgroup && (
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={2}>
                            {section.subgroup.name}
                          </Text>
                        )}
                        <Table verticalSpacing={4} withRowBorders={false}>
                          <Table.Tbody>
                            {section.definitions.map((definition) => (
                              <Table.Tr key={definition.id}>
                                <Table.Td>{definition.name}</Table.Td>
                                <Table.Td ta="right">
                                  {formatNumber(
                                    measured.get(definition.id) ?? 0,
                                    definition.decimalPrecision,
                                  )}{" "}
                                  {definition.unit}
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </div>
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>
    </Stack>
  );
};
