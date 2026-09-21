"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconFilterOff, IconPlus, IconSearch } from "@tabler/icons-react";
import {
  IngredientDrawer,
  IngredientDrawerState,
} from "@/components/admin/ingredients/IngredientDrawer";
import { IngredientLookups } from "@/components/admin/ingredients/ingredientLookups";
import { IngredientTable } from "@/components/admin/ingredients/IngredientTable";
import { useNutrientDefinitions } from "@/components/admin/ingredients/useNutrientDefinitions";
import { useIngredients } from "@/components/admin/ingredients/useIngredients";
import { useCatalogs } from "@/components/admin/catalog/useCatalogs";
import { capitalize, normalizeName } from "@/lib/text/names";

type VerifiedFilter = "yes" | "no" | null;
type OriginFilter = "official" | "own" | null;

// Admin: ingrediensregisteret. Søk og filtre i listen; klikk på en rad åpner ingrediensen i en skuff (utvidet visning,
// redigering, verifisering, sletting), og «Ny ingrediens» oppretter en (eventuelt avledet fra en eksisterende). Hele
// listen lastes én gang og filtreres i klienten. Godkjenningskøen for brukeres ubekreftede ingredienser kommer senere.
export const IngredientManager = () => {
  const ingredients = useIngredients();
  const { catalogs } = useCatalogs();
  const nutrients = useNutrientDefinitions();
  const [drawer, setDrawer] = useState<IngredientDrawerState | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [allergenId, setAllergenId] = useState<string | null>(null);
  const [keywordId, setKeywordId] = useState<string | null>(null);
  const [verified, setVerified] = useState<VerifiedFilter>(null);
  const [origin, setOrigin] = useState<OriginFilter>(null);

  const categories = catalogs["ingredient-categories"].items;
  const allergens = catalogs.allergens.items;
  const keywords = catalogs["search-keywords"].items;
  const units = catalogs.units.items;

  // id -> navn. Listen bærer bare id-er; navnene kommer fra katalogene.
  const lookups = useMemo(() => {
    const byId = <T extends { id: string }>(items: T[], pick: (item: T) => string) =>
      new Map(items.map((item) => [item.id, pick(item)]));

    return {
      category: byId(categories, (c) => c.name),
      allergen: byId(allergens, (a) => a.name),
      unit: byId(units, (u) => u.abbreviation),
      // Normaliserte søkeordnavn: backend søker på ingrediensnavn OG søkeord, og det gjør vi også.
      keyword: byId(keywords, (k) => normalizeName(k.name)),
    };
  }, [categories, allergens, units, keywords]);

  // Alt skuffen trenger for å vise navn og fylle nedtrekkslister.
  const drawerLookups: IngredientLookups = {
    categories,
    allergens,
    keywords,
    units,
    unitTypes: catalogs["unit-types"].items,
    definitions: nutrients.definitions,
    ingredients: ingredients.items,
  };

  const query = normalizeName(search);
  // «Opprinnelse» (offisiell/egen) krever at backend leverer `isOfficial` på listen — listeradene har ikke kilde-id å utlede det fra
  // (documentation/10, seksjon 7, B2). Til da vises filteret deaktivert, og kolonnen skjules.
  const hasOriginData = ingredients.items.some((item) => item.isOfficial !== undefined);
  const filterActive =
    Boolean(query) || categoryId || allergenId || keywordId || verified || origin;

  const filtered = useMemo(
    () =>
      ingredients.items
        .filter(
          (item) =>
            (!query ||
              normalizeName(item.name).includes(query) ||
              item.searchKeywordIds.some((id) => lookups.keyword.get(id)?.includes(query))) &&
            (!categoryId || item.categoryId === categoryId) &&
            (!allergenId || item.allergenIds.includes(allergenId)) &&
            (!keywordId || item.searchKeywordIds.includes(keywordId)) &&
            (!verified || (verified === "yes") === item.isVerified) &&
            (!origin || (origin === "official") === item.isOfficial),
        )
        // Backend garanterer ingen rekkefølge for ingredienslisten.
        .sort((a, b) => a.name.localeCompare(b.name, "nb")),
    [ingredients.items, lookups, query, categoryId, allergenId, keywordId, verified, origin],
  );

  const resetFilters = () => {
    setSearch("");
    setCategoryId(null);
    setAllergenId(null);
    setKeywordId(null);
    setVerified(null);
    setOrigin(null);
  };

  const selectData = (items: { id: string; name: string }[]) =>
    items.map((item) => ({ value: item.id, label: capitalize(item.name) }));

  return (
    <Stack gap="lg">
      <div>
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>Ingredienser</Title>
            <Text c="dimmed" size="sm">
              Ingrediensregisteret (Matvaretabellen og godkjente brukeringredienser). Klikk på en
              ingrediens for å se, redigere og verifisere den.
            </Text>
          </div>
          <Button
            color="sage"
            leftSection={<IconPlus size={16} />}
            onClick={() => setDrawer({ mode: "create", baseId: null })}
          >
            Ny ingrediens
          </Button>
        </Group>
      </div>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          {ingredients.errorMessage && (
            <Alert
              color="red"
              variant="light"
              radius="md"
              title="Kunne ikke hente ingredienser"
              icon={<IconAlertCircle size={18} />}
            >
              <Group justify="space-between" align="center">
                <Text size="sm">{ingredients.errorMessage}</Text>
                <Button size="xs" variant="light" color="red" onClick={ingredients.reload}>
                  Prøv igjen
                </Button>
              </Group>
            </Alert>
          )}

          <Group align="flex-end" gap="sm">
            <TextInput
              label="Søk"
              placeholder="Navn eller søkeord..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              w={220}
            />
            <Select
              label="Kategori"
              placeholder="Alle kategorier"
              data={selectData(categories)}
              value={categoryId}
              onChange={setCategoryId}
              searchable
              clearable
              w={180}
            />
            <Select
              label="Inneholder allergen"
              placeholder="Alle"
              data={selectData(allergens)}
              value={allergenId}
              onChange={setAllergenId}
              searchable
              clearable
              w={180}
            />
            <Select
              label="Søkeord"
              placeholder="Alle"
              data={selectData(keywords)}
              value={keywordId}
              onChange={setKeywordId}
              searchable
              clearable
              w={180}
            />
            <Select
              label="Verifisert"
              placeholder="Alle"
              data={[
                { value: "yes", label: "Verifisert" },
                { value: "no", label: "Ikke verifisert" },
              ]}
              value={verified}
              onChange={(value) => setVerified(value as VerifiedFilter)}
              clearable
              w={160}
            />
            <Select
              label="Opprinnelse"
              placeholder="Alle"
              description={hasOriginData ? undefined : "Venter på backend"}
              data={[
                { value: "official", label: "Offisiell" },
                { value: "own", label: "Egen" },
              ]}
              value={origin}
              onChange={(value) => setOrigin(value as OriginFilter)}
              disabled={!hasOriginData}
              clearable
              w={160}
            />
            {filterActive && (
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconFilterOff size={16} />}
                onClick={resetFilters}
              >
                Nullstill filtre
              </Button>
            )}
          </Group>

          {!ingredients.loading && (
            <Text size="xs" c="dimmed">
              Viser {filtered.length.toLocaleString("nb-NO")} av{" "}
              {ingredients.items.length.toLocaleString("nb-NO")} ingredienser
            </Text>
          )}

          {ingredients.loading && ingredients.items.length === 0 ? (
            <Center mih={240}>
              <Loader color="sage" size="md" type="dots" />
            </Center>
          ) : (
            <IngredientTable
              items={filtered}
              emptyText={
                filterActive ? "Ingen ingredienser samsvarer med filtrene." : "Ingen ingredienser."
              }
              categoryName={(id) => lookups.category.get(id)}
              allergenName={(id) => lookups.allergen.get(id)}
              unitAbbreviation={(id) => lookups.unit.get(id)}
              showOrigin={hasOriginData}
              onOpen={(id) => setDrawer({ mode: "view", id })}
            />
          )}
        </Stack>
      </Paper>

      <IngredientDrawer
        state={drawer}
        onStateChange={setDrawer}
        orderedIds={filtered.map((i) => i.id)}
        lookups={drawerLookups}
        onChanged={ingredients.reload}
      />
    </Stack>
  );
};
