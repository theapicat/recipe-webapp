"use client";

import Link from "next/link";
import { ActionIcon, Badge, Card, Group, Image, Menu, Stack, Text } from "@mantine/core";
import {
  IconClock,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { RecipeListItem } from "@/lib/models/recipes/RecipeListItem";
import { capitalize } from "@/lib/text/names";

interface RecipeCardProps {
  recipe: RecipeListItem;
  categoryName?: string;
  onToggleFavorite: (recipe: RecipeListItem) => void;
  onDelete: (recipe: RecipeListItem) => void;
}

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=Ingen+bilde";

export const RecipeCard = ({
  recipe,
  categoryName,
  onToggleFavorite,
  onDelete,
}: RecipeCardProps) => (
  <Card withBorder radius="md" padding="md" style={{ overflow: "hidden" }}>
    <Card.Section style={{ position: "relative" }}>
      <Image
        src={recipe.imageUrl ?? FALLBACK_IMAGE}
        height={180}
        alt={recipe.title}
        fallbackSrc={FALLBACK_IMAGE}
      />
      <ActionIcon
        variant="filled"
        color="dark"
        radius="xl"
        style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.5)" }}
        aria-label={recipe.isFavorite ? "Fjern favoritt" : "Merk som favoritt"}
        onClick={() => onToggleFavorite(recipe)}
      >
        {recipe.isFavorite ? (
          <IconStarFilled size={18} color="gold" />
        ) : (
          <IconStar size={18} color="white" />
        )}
      </ActionIcon>
      {categoryName && (
        <Badge color="sage" variant="filled" style={{ position: "absolute", bottom: 10, left: 10 }}>
          {capitalize(categoryName)}
        </Badge>
      )}
    </Card.Section>

    <Stack justify="space-between" mt="md" style={{ flex: 1 }}>
      <div>
        <Group justify="space-between" align="flex-start">
          <Text
            component={Link}
            href={`/user/recipes/${recipe.id}`}
            fw={600}
            size="lg"
            style={{ flex: 1 }}
          >
            {recipe.title}
          </Text>

          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="Flere valg">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component={Link}
                href={`/user/recipes/${recipe.id}`}
                leftSection={<IconEye size={14} />}
              >
                Åpne oppskrift
              </Menu.Item>
              <Menu.Item
                component={Link}
                href={`/user/recipes/${recipe.id}/edit`}
                leftSection={<IconEdit size={14} />}
              >
                Rediger
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete(recipe)}
              >
                Slett
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Group gap="md" mt="xs">
          <Group gap={4}>
            <IconClock size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {recipe.cookTimeMinutes} min
            </Text>
          </Group>
          <Group gap={4}>
            <IconUsers size={14} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {recipe.servings} porsjoner
            </Text>
          </Group>
        </Group>
      </div>
    </Stack>
  </Card>
);
