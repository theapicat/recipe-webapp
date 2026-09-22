"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon, Group, NumberInput, Select, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconTrash } from "@tabler/icons-react";
import { AddUnconfirmedIngredientDialog } from "@/components/recipes/AddUnconfirmedIngredientDialog";
import {
  isUnconfirmedRef,
  RecipeFormValues,
  unconfirmedRefId,
} from "@/components/recipes/recipeForm";
import { RecipeLookups, unitsForIngredient } from "@/components/recipes/recipeLookups";
import { norwegianNumberProps } from "@/components/forms/common/numberInputProps";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";
import { UnconfirmedIngredient } from "@/lib/models/ingredients/UnconfirmedIngredient";
import { capitalize } from "@/lib/text/names";

interface IngredientRowProps {
  form: UseFormReturnType<RecipeFormValues>;
  index: number;
  ingredientOptions: { value: string; label: string }[];
  lookups: RecipeLookups;
  /** Cache av hele ingrediens-objekter (med `portions`), delt mellom radene — se useIngredientDetailCache.ts. */
  ingredientDetails: Record<string, Ingredient>;
  ensureIngredientDetail: (id: string) => void;
  removable: boolean;
  disabled?: boolean;
}

// Én ingredienslinje. Håndterer søket (fritekst mot katalogen) og «finnes ikke»-flyten: skriver man noe som ikke
// matcher et katalogvalg og forlater feltet (blur eller Enter) uten å ha valgt noe, spør vi om å legge det til
// som en egen (ubekreftet) ingrediens — se AddUnconfirmedIngredientDialog.tsx. Avbryt der tømmer bare søket, slik
// at man kan søke videre blant de offisielle.
//
// Enhetsvelgeren begrenses til enhetene som faktisk kan regnes om til gram for den VALGTE ingrediensen: samme
// enhetstype som ingrediensens primaryUnitTypeId (kjent med det samme, fra den lette listen) pluss enhetene
// ingrediensen selv har en definert porsjon for (fra den fulle ingrediensen, hentet på forespørsel — se
// recipeLookups.ts, unitsForIngredient()). Porsjonsenhetene dukker opp så snart de er hentet; listen blir aldri
// smalere av det, bare bredere. Bytter man ingrediens og det valgte enhetsvalget ikke lenger er i det nye,
// tillatte settet, nullstilles det.
export const IngredientRow = ({
  form,
  index,
  ingredientOptions,
  lookups,
  ingredientDetails,
  ensureIngredientDetail,
  removable,
  disabled = false,
}: IngredientRowProps) => {
  const row = form.getValues().ingredients[index];
  const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null);
  const searchRef = useRef("");

  const options =
    row.unconfirmedName && row.refId
      ? [{ value: row.refId, label: `(Ubekreftet) ${row.unconfirmedName}` }, ...ingredientOptions]
      : ingredientOptions;

  // Ubekreftede ingredienser har ingen kjent enhetstype/porsjoner — vis da alle enhetene uten begrensning.
  const selectedIngredient =
    row.refId && !isUnconfirmedRef(row.refId)
      ? lookups.ingredients.find((ingredient) => ingredient.id === row.refId)
      : undefined;
  const selectedDetail = selectedIngredient ? ingredientDetails[selectedIngredient.id] : undefined;

  useEffect(() => {
    if (selectedIngredient) ensureIngredientDetail(selectedIngredient.id);
  }, [selectedIngredient, ensureIngredientDetail]);

  const allowedUnits = selectedIngredient
    ? unitsForIngredient(lookups.units, lookups.unitTypes, selectedIngredient, selectedDetail)
    : lookups.units;
  const unitOptions = allowedUnits.map((unit) => ({
    value: unit.id,
    label: `${capitalize(unit.name)} (${unit.abbreviation})`,
  }));

  form.watch(`ingredients.${index}.refId`, ({ value }) => {
    const ingredient =
      value && !isUnconfirmedRef(value)
        ? lookups.ingredients.find((i) => i.id === value)
        : undefined;
    if (!ingredient) return; // ingen valgt, eller ubekreftet: ingen begrensning å håndheve

    const allowedIds = new Set(
      unitsForIngredient(
        lookups.units,
        lookups.unitTypes,
        ingredient,
        ingredientDetails[ingredient.id],
      ).map((u) => u.id),
    );
    const currentUnitId = form.getValues().ingredients[index]?.unitId;
    if (currentUnitId && !allowedIds.has(currentUnitId)) {
      form.setFieldValue(`ingredients.${index}.unitId`, null);
    }
  });

  const checkNotFound = () => {
    const current = form.getValues().ingredients[index];
    const query = searchRef.current.trim();
    if (!current.refId && query) setNotFoundQuery(query);
  };

  const handleCreated = (ingredient: UnconfirmedIngredient) => {
    form.setFieldValue(`ingredients.${index}.refId`, unconfirmedRefId(ingredient.id));
    form.setFieldValue(`ingredients.${index}.unconfirmedName`, ingredient.name);
    searchRef.current = "";
    setNotFoundQuery(null);
  };

  const handleCancelCreate = () => {
    searchRef.current = "";
    setNotFoundQuery(null);
  };

  return (
    <>
      <Group gap="xs" align="flex-start" wrap="nowrap">
        <Select
          aria-label="Ingrediens"
          placeholder="Søk etter ingrediens"
          data={options}
          searchable
          limit={50}
          nothingFoundMessage="Ingen treff"
          disabled={disabled}
          style={{ flex: 2 }}
          {...form.getInputProps(`ingredients.${index}.refId`)}
          onSearchChange={(value) => {
            searchRef.current = value;
          }}
          onBlur={checkNotFound}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // Mantines egen Enter-håndtering (velge et uthevet treff) kjører først; sjekk «finnes ikke» rett
              // etter i stedet for å hindre den, og hindre at Enter bobler opp og sender hele skjemaet.
              event.preventDefault();
              setTimeout(checkNotFound, 0);
            }
          }}
        />
        <NumberInput
          aria-label="Mengde"
          placeholder="Etter smak"
          min={0}
          decimalScale={2}
          disabled={disabled}
          style={{ width: 110 }}
          {...norwegianNumberProps}
          {...form.getInputProps(`ingredients.${index}.amount`)}
        />
        <Select
          aria-label="Enhet"
          placeholder="Enhet"
          data={unitOptions}
          searchable
          disabled={disabled}
          style={{ width: 150 }}
          {...form.getInputProps(`ingredients.${index}.unitId`)}
        />
        <TextInput
          aria-label="Notat"
          placeholder="Notat (valgfritt)"
          disabled={disabled}
          style={{ flex: 1 }}
          {...form.getInputProps(`ingredients.${index}.note`)}
        />
        <ActionIcon
          color="red"
          variant="subtle"
          size="lg"
          aria-label="Fjern ingrediens"
          disabled={disabled || !removable}
          onClick={() => form.removeListItem("ingredients", index)}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      {notFoundQuery !== null && (
        <AddUnconfirmedIngredientDialog
          searchText={notFoundQuery}
          onCancel={handleCancelCreate}
          onCreated={handleCreated}
        />
      )}
    </>
  );
};
