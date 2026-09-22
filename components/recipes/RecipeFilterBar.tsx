"use client";

import { Button, Group, Select, TextInput } from "@mantine/core";
import { IconSearch, IconStar, IconStarFilled } from "@tabler/icons-react";
import { RecipeCategory } from "@/lib/models/recipes/RecipeCategory";
import { capitalize } from "@/lib/text/names";

interface RecipeFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string | null;
  onCategoryChange: (value: string | null) => void;
  categories: RecipeCategory[];
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}

export const RecipeFilterBar = ({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  favoritesOnly,
  onToggleFavoritesOnly,
}: RecipeFilterBarProps) => (
  <Group justify="space-between" wrap="wrap" gap="sm">
    <Group gap="sm" wrap="wrap">
      <TextInput
        placeholder="Søk i oppskrifter..."
        aria-label="Søk i oppskrifter"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        style={{ width: 260, maxWidth: "100%" }}
      />
      <Select
        placeholder="Alle kategorier"
        aria-label="Filtrer på kategori"
        clearable
        data={categories.map((category) => ({
          value: category.id,
          label: capitalize(category.name),
        }))}
        value={categoryId}
        onChange={onCategoryChange}
        style={{ width: 200 }}
      />
    </Group>

    <Button
      variant={favoritesOnly ? "filled" : "outline"}
      color="terracotta"
      leftSection={favoritesOnly ? <IconStarFilled size={16} /> : <IconStar size={16} />}
      onClick={onToggleFavoritesOnly}
    >
      Kun favoritter
    </Button>
  </Group>
);
