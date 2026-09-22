"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Image,
  Loader,
  NumberInput,
  Paper,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconChartPie,
  IconChefHat,
  IconClock,
  IconEdit,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { RecipeLookups, unitAbbreviationOf, nameOf } from "@/components/recipes/recipeLookups";
import { isToTaste } from "@/components/recipes/recipeForm";
import { RecipeNutritionView } from "@/components/recipes/RecipeNutritionView";
import { useRecipeNutrition } from "@/components/recipes/useRecipeNutrition";
import { useNutrientDefinitions } from "@/lib/nutrients/useNutrientDefinitions";
import { Recipe } from "@/lib/models/recipes/Recipe";
import { capitalize } from "@/lib/text/names";

interface RecipeDetailViewProps {
  recipe: Recipe;
  lookups: RecipeLookups;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

const FALLBACK_IMAGE = "https://placehold.co/1200x600?text=Ingen+bilde";

// Skrivebeskyttet visning av én oppskrift: hero, ingredienser (med klientside porsjonsskalering — kun visning,
// aldri lagret) og fremgangsmåte. `RecipeIngredient.name` er allerede oppgitt av backend, så vi trenger ikke
// slå opp ingrediensnavn — kun enhetsforkortelsen (unitId) og kategorinavnet krever et katalogoppslag.
export const RecipeDetailView = ({
  recipe,
  lookups,
  onToggleFavorite,
  onDelete,
}: RecipeDetailViewProps) => {
  const [servings, setServings] = useState(recipe.servings);
  const [activeTab, setActiveTab] = useState<string | null>("recipe");
  const scale = servings / recipe.servings;
  const categoryName = nameOf(lookups.categories, recipe.categoryId);

  const { definitions } = useNutrientDefinitions();
  const {
    nutrition,
    loading: nutritionLoading,
    errorMessage: nutritionError,
    retry: retryNutrition,
  } = useRecipeNutrition(recipe.id, activeTab === "nutrition");

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Button component={Link} href="/user/recipes" variant="subtle" color="gray">
          Tilbake til oppskrifter
        </Button>
        <Group gap="xs">
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={onDelete}
          >
            Slett
          </Button>
          <Button
            component={Link}
            href={`/user/recipes/${recipe.id}/edit`}
            variant="light"
            color="sage"
            leftSection={<IconEdit size={16} />}
          >
            Rediger
          </Button>
          <Button
            component={Link}
            href={`/user/recipes/${recipe.id}/cook`}
            color="sage"
            leftSection={<IconChefHat size={18} />}
          >
            Start kokkemodus
          </Button>
        </Group>
      </Group>

      <Paper radius="md" withBorder style={{ overflow: "hidden" }}>
        <div style={{ position: "relative", height: 320 }}>
          <Image
            src={recipe.imageUrl ?? FALLBACK_IMAGE}
            height={320}
            alt={recipe.title}
            fallbackSrc={FALLBACK_IMAGE}
          />
          <ActionIcon
            variant="filled"
            color="dark"
            radius="xl"
            size="lg"
            style={{ position: "absolute", top: 16, right: 16, backgroundColor: "rgba(0,0,0,0.5)" }}
            aria-label={recipe.isFavorite ? "Fjern favoritt" : "Merk som favoritt"}
            onClick={onToggleFavorite}
          >
            {recipe.isFavorite ? (
              <IconStarFilled size={22} color="gold" />
            ) : (
              <IconStar size={22} color="white" />
            )}
          </ActionIcon>
          {categoryName && (
            <Badge
              color="sage"
              size="lg"
              variant="filled"
              style={{ position: "absolute", bottom: 16, left: 16 }}
            >
              {capitalize(categoryName)}
            </Badge>
          )}
        </div>

        <Stack p="lg" gap="sm">
          <Title order={1} size="h2">
            {capitalize(recipe.title)}
          </Title>
          <Text c="dimmed" size="sm">
            {recipe.description}
          </Text>

          <Divider my="xs" />

          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="xl">
              <Group gap="xs">
                <ThemeIcon color="sage" variant="light" radius="md">
                  <IconClock size={18} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">
                    Koketid
                  </Text>
                  <Text size="sm" fw={600}>
                    {recipe.cookTimeMinutes} min
                  </Text>
                </div>
              </Group>

              <Group gap="xs">
                <ThemeIcon color="terracotta" variant="light" radius="md">
                  <IconUsers size={18} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">
                    Porsjoner
                  </Text>
                  <NumberInput
                    value={servings}
                    onChange={(val) => setServings(typeof val === "number" ? val : recipe.servings)}
                    min={1}
                    max={1000}
                    size="xs"
                    style={{ width: 70 }}
                  />
                </div>
              </Group>
            </Group>

            {recipe.source.reference && (
              <Text size="xs" c="dimmed">
                Kilde: {recipe.source.reference}
              </Text>
            )}
          </Group>
        </Stack>
      </Paper>

      <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md" color="sage">
        <Tabs.List mb="md">
          <Tabs.Tab value="recipe" leftSection={<IconChefHat size={16} />}>
            Oppskrift & ingredienser
          </Tabs.Tab>
          <Tabs.Tab value="nutrition" leftSection={<IconChartPie size={16} />}>
            Næringsinnhold (veiledende)
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="recipe">
          <Group align="flex-start" grow>
            <Paper p="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Title order={3} size="h4">
                      Ingredienser
                    </Title>
                    <Badge color="gray" variant="light" size="xs" mt={2}>
                      {servings} porsjoner
                    </Badge>
                  </div>
                </Group>

                <Divider />

                <Stack gap="sm">
                  {recipe.ingredients.map((ingredient) => {
                    const scaled = Math.round(ingredient.amount * scale * 100) / 100;
                    const unit = unitAbbreviationOf(lookups.units, ingredient.unitId);

                    return (
                      <Text key={ingredient.id} size="sm">
                        <b>
                          {isToTaste(ingredient.amount) ? "Etter smak" : `${scaled} ${unit ?? ""}`}
                        </b>{" "}
                        {capitalize(ingredient.name ?? "")}
                        {ingredient.note && (
                          <Text component="span" size="xs" c="dimmed">
                            {" "}
                            ({ingredient.note})
                          </Text>
                        )}
                      </Text>
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>

            <Paper p="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={3} size="h4">
                  Fremgangsmåte
                </Title>
                <Divider />

                <Stack gap="lg">
                  {recipe.steps.map((step) => (
                    <Group key={step.id} align="flex-start" wrap="nowrap" gap="md">
                      <ThemeIcon color="sage" size={32} radius="xl" variant="filled">
                        <Text fw={700} size="sm">
                          {step.stepNumber}
                        </Text>
                      </ThemeIcon>
                      <div style={{ flex: 1 }}>
                        <Text size="sm" lh={1.6}>
                          {step.description}
                        </Text>
                        {step.timerMinutes !== null && (
                          <Text size="xs" c="dimmed" mt={2}>
                            Timer: {step.timerMinutes} min
                          </Text>
                        )}
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="nutrition">
          <Paper p="lg" radius="md" withBorder>
            {nutritionLoading ? (
              <Center mih={150}>
                <Loader color="sage" size="md" type="dots" />
              </Center>
            ) : nutritionError || !nutrition ? (
              <Alert
                color="red"
                variant="light"
                radius="md"
                title="Kunne ikke beregne næringsinnhold"
                icon={<IconAlertCircle size={18} />}
              >
                <Group justify="space-between" align="center">
                  <Text size="sm">{nutritionError}</Text>
                  <Button size="xs" variant="light" color="red" onClick={retryNutrition}>
                    Prøv igjen
                  </Button>
                </Group>
              </Alert>
            ) : (
              <RecipeNutritionView nutrition={nutrition} definitions={definitions} />
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};
