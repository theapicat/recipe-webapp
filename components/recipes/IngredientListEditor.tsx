"use client";

import { Button, Group, Stack, Text } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconPlus } from "@tabler/icons-react";
import {
  emptyIngredientRow,
  MAX_INGREDIENTS,
  MIN_INGREDIENTS,
  RecipeFormValues,
} from "@/components/recipes/recipeForm";
import { RecipeLookups } from "@/components/recipes/recipeLookups";
import { IngredientRow } from "@/components/recipes/IngredientRow";
import { useIngredientDetailCache } from "@/components/recipes/useIngredientDetailCache";
import { capitalize } from "@/lib/text/names";

interface IngredientListEditorProps {
  form: UseFormReturnType<RecipeFormValues>;
  lookups: RecipeLookups;
  disabled?: boolean;
}

// Ingredienslinjer: ingrediens (søkbar, fra katalogen — med mulighet til å legge til en som egen ingrediens hvis
// søket ikke gir treff, se IngredientRow.tsx), mengde (tom/0 = «etter smak»), enhet og en valgfri notat-tekst.
export const IngredientListEditor = ({
  form,
  lookups,
  disabled = false,
}: IngredientListEditorProps) => {
  const rows = form.getValues().ingredients;
  const { details: ingredientDetails, ensure: ensureIngredientDetail } = useIngredientDetailCache();

  const ingredientOptions = lookups.ingredients.map((ingredient) => ({
    value: ingredient.id,
    label: capitalize(ingredient.name),
  }));

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <div>
          <Text fw={600}>Ingredienser</Text>
          <Text size="xs" c="dimmed">
            Minst {MIN_INGREDIENTS}, maks {MAX_INGREDIENTS}. Tom mengde = «etter smak». Finner du
            ikke ingrediensen i søket, kan du legge den til som din egen.
          </Text>
        </div>
        <Button
          variant="light"
          color="sage"
          size="xs"
          leftSection={<IconPlus size={14} />}
          disabled={disabled || rows.length >= MAX_INGREDIENTS}
          onClick={() => form.insertListItem("ingredients", emptyIngredientRow())}
        >
          Legg til ingrediens
        </Button>
      </Group>

      {rows.length > 0 && (
        <Group gap="xs" wrap="nowrap" pl={4}>
          <Text size="xs" c="dimmed" fw={600} style={{ flex: 2 }}>
            Ingrediens
          </Text>
          <Text size="xs" c="dimmed" fw={600} style={{ width: 110 }}>
            Mengde
          </Text>
          <Text size="xs" c="dimmed" fw={600} style={{ width: 150 }}>
            Enhet
          </Text>
          <Text size="xs" c="dimmed" fw={600} style={{ flex: 1 }}>
            Notat
          </Text>
          <div style={{ width: 42 }} />
        </Group>
      )}

      <Stack gap="xs">
        {rows.map((row, index) => (
          <IngredientRow
            key={row.key}
            form={form}
            index={index}
            ingredientOptions={ingredientOptions}
            lookups={lookups}
            ingredientDetails={ingredientDetails}
            ensureIngredientDetail={ensureIngredientDetail}
            removable={rows.length > MIN_INGREDIENTS}
            disabled={disabled}
          />
        ))}
      </Stack>
    </Stack>
  );
};
