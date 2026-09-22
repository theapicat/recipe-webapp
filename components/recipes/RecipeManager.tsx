"use client";

import { useState } from "react";
import Link from "next/link";
import { notifications } from "@mantine/notifications";
import {
  Alert,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconChefHat, IconPlus } from "@tabler/icons-react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeFilterBar } from "@/components/recipes/RecipeFilterBar";
import { matchesRecipeSearch } from "@/components/recipes/recipeForm";
import { nameOf } from "@/components/recipes/recipeLookups";
import { useRecipeLookups } from "@/components/recipes/useRecipeLookups";
import { useRecipes } from "@/components/recipes/useRecipes";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { Recipe } from "@/lib/models/recipes/Recipe";
import { RecipeListItem } from "@/lib/models/recipes/RecipeListItem";

// Sideeier for /user/recipes: laster listen + kategoriene, søk/kategori/favoritt-filtrering i klienten, og
// favoritt-av/på + sletting direkte fra kortet (samme mønster som IngredientManager).
export const RecipeManager = () => {
  const { items, loading, errorMessage, reload } = useRecipes();
  const { lookups, errorMessage: lookupsError } = useRecipeLookups();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RecipeListItem | null>(null);
  const [localFavorites, setLocalFavorites] = useState<Record<string, boolean>>({});

  const isFavorite = (recipe: RecipeListItem) => localFavorites[recipe.id] ?? recipe.isFavorite;

  const handleToggleFavorite = async (recipe: RecipeListItem) => {
    const next = !isFavorite(recipe);
    setLocalFavorites((prev) => ({ ...prev, [recipe.id]: next }));

    try {
      const res = await agentInternal.put<Recipe>(`/api/user/recipes/${recipe.id}/favorite`, {
        isFavorite: next,
      });
      const data: Partial<HttpResponse<Recipe>> = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLocalFavorites((prev) => ({ ...prev, [recipe.id]: !next }));
        notifications.show({
          title: "Kunne ikke oppdatere favoritt",
          message: data.message || "Prøv igjen senere.",
          color: "red",
        });
      }
    } catch {
      setLocalFavorites((prev) => ({ ...prev, [recipe.id]: !next }));
      notifications.show({
        title: "Kunne ikke koble til serveren",
        message: "Prøv igjen senere.",
        color: "red",
      });
    }
  };

  const filtered = items.filter((recipe) => {
    const query = search.trim().toLowerCase();
    return (
      matchesRecipeSearch(recipe.title, query) &&
      (!categoryId || recipe.categoryId === categoryId) &&
      (!favoritesOnly || isFavorite(recipe))
    );
  });
  const narrowed = Boolean(search.trim()) || Boolean(categoryId) || favoritesOnly;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Mine oppskrifter</Title>
          <Text c="dimmed" size="sm">
            Oversikt over alle dine lagrede og importerte oppskrifter
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          color="sage"
          component={Link}
          href="/user/recipes/create"
        >
          Ny oppskrift
        </Button>
      </Group>

      {lookupsError && (
        <Alert
          color="red"
          variant="light"
          radius="md"
          title="Noen valg mangler"
          icon={<IconAlertCircle size={18} />}
        >
          {lookupsError}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          color="red"
          variant="light"
          radius="md"
          title="Kunne ikke hente oppskrifter"
          icon={<IconAlertCircle size={18} />}
        >
          <Group justify="space-between" align="center">
            <Text size="sm">{errorMessage}</Text>
            <Button size="xs" variant="light" color="red" onClick={reload}>
              Prøv igjen
            </Button>
          </Group>
        </Alert>
      )}

      <Paper p="md" radius="md" withBorder>
        <RecipeFilterBar
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={lookups.categories}
          favoritesOnly={favoritesOnly}
          onToggleFavoritesOnly={() => setFavoritesOnly((prev) => !prev)}
        />
      </Paper>

      {narrowed && !loading && (
        <Text size="xs" c="dimmed">
          Viser {filtered.length} av {items.length}
        </Text>
      )}

      {loading ? (
        <Center mih={200}>
          <Loader color="sage" size="md" type="dots" />
        </Center>
      ) : filtered.length === 0 ? (
        <Paper p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
          <IconChefHat size={48} color="var(--mantine-color-dimmed)" style={{ margin: "0 auto" }} />
          <Text fw={500} mt="sm">
            Ingen oppskrifter funnet
          </Text>
          <Text size="sm" c="dimmed">
            {items.length === 0
              ? "Kom i gang ved å opprette din første oppskrift."
              : "Prøv å endre filtrene."}
          </Text>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing="lg">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={{ ...recipe, isFavorite: isFavorite(recipe) }}
              categoryName={nameOf(lookups.categories, recipe.categoryId)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={setDeleteTarget}
            />
          ))}
        </SimpleGrid>
      )}

      <DeleteConfirmModal
        opened={deleteTarget !== null}
        name={deleteTarget ? deleteTarget.title : null}
        title="Slett oppskrift"
        url={`/api/user/recipes/${deleteTarget?.id ?? ""}`}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => {
          setDeleteTarget(null);
          reload();
        }}
      />
    </Stack>
  );
};
