"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Button,
  ActionIcon,
  Modal,
  Select,
  MultiSelect,
  TextInput,
  Checkbox,
  Alert,
  SimpleGrid,
  Divider,
  Tooltip,
  Card,
  SegmentedControl,
  ThemeIcon,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure as useMantineDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconShoppingCart,
  IconTrash,
  IconClock,
  IconCheck,
  IconInfoCircle,
  IconArrowRight,
  IconSun,
  IconCoffee,
  IconMoon,
  IconCookie,
  IconToolsKitchen,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconFlame,
  IconChartPie,
} from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

// --- TYPER ---
export type MealCategory =
  | "Frokost"
  | "Brunsj"
  | "Lunsj"
  | "Middag"
  | "Kveldsmat"
  | "Mellommåltid / Snacks";

export type DayOfWeek =
  | "Mandag"
  | "Tirsdag"
  | "Onsdag"
  | "Torsdag"
  | "Fredag"
  | "Lørdag"
  | "Søndag";

export type ViewMode = "day" | "week" | "month";

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeOption {
  id: string;
  title: string;
  category: string;
  defaultIngredients: { name: string; amount: string }[];
  nutrition: NutritionInfo;
}

export interface PlannedMeal {
  id: string;
  day: DayOfWeek;
  category: MealCategory;
  time?: string;
  recipes: RecipeOption[];
  notes?: string;
  dateStr?: string;
}

// Mock-katalog over brukerens tilgjengelige oppskrifter med næringsinnhold
const MOCK_USER_RECIPES: RecipeOption[] = [
  {
    id: "rec-1",
    title: "Kremet Kyllinggryte",
    category: "Middag",
    defaultIngredients: [
      { name: "Kyllingfilet", amount: "600 g" },
      { name: "Rød paprika", amount: "2 stk" },
      { name: "Matfløte", amount: "3 dl" },
    ],
    nutrition: { calories: 520, protein: 42, carbs: 12, fat: 34 },
  },
  {
    id: "rec-2",
    title: "Hjemmelaget Lasagne",
    category: "Middag",
    defaultIngredients: [
      { name: "Kjøttdeig", amount: "500 g" },
      { name: "Lasagreplater", amount: "1 pakke" },
      { name: "Gulost", amount: "200 g" },
    ],
    nutrition: { calories: 680, protein: 38, carbs: 54, fat: 32 },
  },
  {
    id: "rec-3",
    title: "Havregrøt med Bær og Nøtter",
    category: "Frokost",
    defaultIngredients: [
      { name: "Havregryn", amount: "2 dl" },
      { name: "Melk", amount: "4 dl" },
      { name: "Frosne blåbær", amount: "100 g" },
    ],
    nutrition: { calories: 350, protein: 14, carbs: 52, fat: 9 },
  },
  {
    id: "rec-4",
    title: "Tomatsuppe med Egg",
    category: "Lunsj",
    defaultIngredients: [
      { name: "Hakkede tomater", amount: "2 bokser" },
      { name: "Egg", amount: "4 stk" },
      { name: "Grønnsaksbuljong", amount: "5 dl" },
    ],
    nutrition: { calories: 310, protein: 18, carbs: 22, fat: 16 },
  },
  {
    id: "rec-5",
    title: "Klassisk Tiramisu",
    category: "Dessert",
    defaultIngredients: [
      { name: "Mascarpone", amount: "250 g" },
      { name: "Fingerkjeks", amount: "1 pakke" },
      { name: "Espresso", amount: "2 dl" },
    ],
    nutrition: { calories: 420, protein: 6, carbs: 40, fat: 26 },
  },
  {
    id: "rec-6",
    title: "Avokadotoast med Poalert Egg",
    category: "Lunsj",
    defaultIngredients: [
      { name: "Surdeigsbrød", amount: "2 skiver" },
      { name: "Avokado", amount: "1 stk" },
      { name: "Egg", amount: "2 stk" },
    ],
    nutrition: { calories: 410, protein: 16, carbs: 30, fat: 24 },
  },
];

const DAYS_LIST: DayOfWeek[] = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];

const INITIAL_MEALS: PlannedMeal[] = [
  {
    id: "meal-1",
    day: "Mandag",
    category: "Frokost",
    time: "07:30",
    recipes: [MOCK_USER_RECIPES[2]],
  },
  {
    id: "meal-2",
    day: "Mandag",
    category: "Middag",
    time: "17:00",
    recipes: [MOCK_USER_RECIPES[0]],
  },
  {
    id: "meal-3",
    day: "Lørdag",
    category: "Middag",
    time: "19:00",
    notes: "Helgemiddag med dessert",
    recipes: [MOCK_USER_RECIPES[1], MOCK_USER_RECIPES[4]],
  },
];

function getCategoryIcon(cat: MealCategory) {
  switch (cat) {
    case "Frokost":
      return <IconCoffee size={14} />;
    case "Brunsj":
    case "Lunsj":
      return <IconSun size={14} />;
    case "Middag":
      return <IconToolsKitchen size={14} />;
    case "Kveldsmat":
      return <IconMoon size={14} />;
    case "Mellommåltid / Snacks":
      return <IconCookie size={14} />;
  }
}

export default function MealPlannerPage() {
  const router = useRouter();
  const [meals, setMeals] = useState<PlannedMeal[]>(INITIAL_MEALS);

  // Visningsmodus & Dato-styring
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Modaler
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useMantineDisclosure(false);
  const [shoppingModalOpened, { open: openShoppingModal, close: closeShoppingModal }] =
    useMantineDisclosure(false);

  // Form State for nytt måltid
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Mandag");
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>("Middag");
  const [mealTime, setMealTime] = useState<string>("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [mealNotes, setMealNotes] = useState<string>("");

  // Handleliste-generering state
  const [shoppingDays, setShoppingDays] = useState<Record<DayOfWeek, boolean>>({
    Mandag: true,
    Tirsdag: true,
    Onsdag: true,
    Torsdag: true,
    Fredag: true,
    Lørdag: true,
    Søndag: true,
  });

  const [shoppingPreviewItems, setShoppingPreviewItems] = useState<
    { id: string; name: string; amount: string; day: DayOfWeek; recipeTitle: string }[]
  >([]);

  // --- DATO NAVIGASJON LOGIKK ---
  const handlePrevDate = () => {
    if (!selectedDate) return;
    const next = new Date(selectedDate);
    if (viewMode === "day") next.setDate(next.getDate() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else if (viewMode === "month") next.setMonth(next.getMonth() - 1);
    setSelectedDate(next);
  };

  const handleNextDate = () => {
    if (!selectedDate) return;
    const next = new Date(selectedDate);
    if (viewMode === "day") next.setDate(next.getDate() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    setSelectedDate(next);
  };

  // Åpne modal for å legge til måltid for en spesifikk dag
  const handleOpenAddForDay = (day: DayOfWeek) => {
    setSelectedDay(day);
    setSelectedCategory("Middag");
    setMealTime("");
    setSelectedRecipeIds([]);
    setMealNotes("");
    openAddModal();
  };

  // Legg til måltid i ukesplanen
  const handleSaveMeal = () => {
    if (selectedRecipeIds.length === 0) {
      notifications.show({
        title: "Velg minst én oppskrift",
        message: "Du må velge minst én oppskrift eller rett for å opprette måltidet.",
        color: "terracotta",
      });
      return;
    }

    const chosenRecipes = MOCK_USER_RECIPES.filter((r) => selectedRecipeIds.includes(r.id));

    const newMeal: PlannedMeal = {
      id: `meal-${Date.now()}`,
      day: selectedDay,
      category: selectedCategory,
      time: mealTime || undefined,
      notes: mealNotes || undefined,
      recipes: chosenRecipes,
    };

    setMeals((prev) => [...prev, newMeal]);
    closeAddModal();
    notifications.show({
      title: "Måltid lagt til!",
      message: `${selectedCategory} for ${selectedDay} ble lagt til i ukesmenyen.`,
      color: "sage",
      icon: <IconCheck size={16} />,
    });
  };

  // Slett måltid
  const handleDeleteMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  // Forbered handleliste-generering ut fra valgte dager
  const handlePrepareShoppingList = () => {
    const selectedDayNames = (Object.keys(shoppingDays) as DayOfWeek[]).filter(
      (d) => shoppingDays[d]
    );

    const extractedItems: {
      id: string;
      name: string;
      amount: string;
      day: DayOfWeek;
      recipeTitle: string;
    }[] = [];

    meals
      .filter((m) => selectedDayNames.includes(m.day))
      .forEach((meal) => {
        meal.recipes.forEach((rec) => {
          rec.defaultIngredients.forEach((ing, idx) => {
            extractedItems.push({
              id: `${meal.id}-${rec.id}-${idx}`,
              name: ing.name,
              amount: ing.amount,
              day: meal.day,
              recipeTitle: rec.title,
            });
          });
        });
      });

    setShoppingPreviewItems(extractedItems);
    openShoppingModal();
  };

  // Fjern et enkelt element i forhåndsvisningen
  const handleRemovePreviewItem = (itemId: string) => {
    setShoppingPreviewItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Bekreft overføring til handleliste
  const handleFinalizeShoppingList = (redirectToShoppingPage: boolean) => {
    notifications.show({
      id: "shopping-generated",
      title: "Handleliste oppdatert!",
      message: `${shoppingPreviewItems.length} ingredienser ble overført til handlelisten din.`,
      color: "sage",
      icon: <IconShoppingCart size={16} />,
    });

    closeShoppingModal();

    if (redirectToShoppingPage) {
      router.push("/user/shoppinglist");
    }
  };

  // --- NÆRINGSINNHOLD BEREGNING FOR AKTIV VISNING ---
  const activeMeals = meals;
  const totalNutrition = activeMeals.reduce(
    (acc, meal) => {
      meal.recipes.forEach((rec) => {
        acc.calories += rec.nutrition.calories;
        acc.protein += rec.nutrition.protein;
        acc.carbs += rec.nutrition.carbs;
        acc.fat += rec.nutrition.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <AsyncMainContainer size="xl" py={30}>
      <Stack gap="lg">
        {/* PROTOTYPING VARSEL */}
        <Alert
          color="terracotta"
          variant="light"
          title="🗓️ Måltidsplanlegger & Ukesmeny"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Planlegg med fleksible måltidstyper, bytt mellom Dag-, Uke- og Månedsvisning, og følg med på det samlede næringsinnholdet.
        </Alert>

        {/* OVERSSKRIFT OG HANDLINGSBAR */}
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <div>
            <Title order={2}>🗓️ Måltidsplanlegger</Title>
            <Text c="dimmed" size="sm">
              Organiser måltider, fleretters menyer og generer skreddersydde handlelister.
            </Text>
          </div>

          <Group gap="xs">
            <Button
              variant="outline"
              color="sage"
              leftSection={<IconShoppingCart size={16} />}
              onClick={handlePrepareShoppingList}
            >
              Generer Handleliste
            </Button>
            <Button
              color="sage"
              leftSection={<IconPlus size={16} />}
              onClick={() => handleOpenAddForDay("Mandag")}
            >
              Legg til Måltid
            </Button>
          </Group>
        </Group>

        {/* BRYTER FOR DAG / UKE / MÅNED & DATO-NAVIGASJON */}
        <Paper
          p="sm"
          radius="md"
          withBorder
          bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <SegmentedControl
              value={viewMode}
              onChange={(val) => setViewMode(val as ViewMode)}
              data={[
                { label: "Dag", value: "day" },
                { label: "Uke", value: "week" },
                { label: "Måned", value: "month" },
              ]}
              color="sage"
            />

            <Group gap="xs">
              <ActionIcon variant="light" color="gray" size="lg" onClick={handlePrevDate}>
                <IconChevronLeft size={18} />
              </ActionIcon>

              <DatePickerInput
                leftSection={<IconCalendar size={16} />}
                placeholder="Velg dato"
                value={selectedDate}
                onChange={setSelectedDate}
                style={{ width: 180 }}
                size="sm"
              />

              <ActionIcon variant="light" color="gray" size="lg" onClick={handleNextDate}>
                <IconChevronRight size={18} />
              </ActionIcon>

              <Button variant="subtle" color="gray" size="xs" onClick={() => setSelectedDate(new Date())}>
                I dag
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* --- Dags-visning --- */}
        {viewMode === "day" && (
          <Paper p="xl" radius="md" withBorder shadow="xs">
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Title order={3} size="h3">
                  Måltider for Mandag (Aktiv Dag)
                </Title>
                <Button
                  color="sage"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => handleOpenAddForDay("Mandag")}
                >
                  Legg til rett i dag
                </Button>
              </Group>

              <Divider />

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {meals
                  .filter((m) => m.day === "Mandag")
                  .map((meal) => (
                    <Card key={meal.id} p="md" radius="md" withBorder shadow="xs">
                      <Stack gap="sm">
                        <Group justify="space-between" align="center">
                          <Group gap="xs">
                            <Badge
                              size="md"
                              variant="light"
                              color="sage"
                              leftSection={getCategoryIcon(meal.category)}
                            >
                              {meal.category}
                            </Badge>
                            {meal.time && (
                              <Badge size="md" variant="light" color="gray" leftSection={<IconClock size={12} />}>
                                Kl. {meal.time}
                              </Badge>
                            )}
                          </Group>

                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDeleteMeal(meal.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>

                        <Stack gap="xs" mt="xs">
                          {meal.recipes.map((rec, idx) => (
                            <Paper
                              key={rec.id}
                              p="xs"
                              radius="sm"
                              bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                              withBorder
                            >
                              <Group justify="space-between">
                                <Text fw={600} size="sm">
                                  {meal.recipes.length > 1 && `${idx + 1}. `}
                                  {rec.title}
                                </Text>
                                <Badge size="xs" color="sage" variant="light">
                                  {rec.nutrition.calories} kcal
                                </Badge>
                              </Group>

                              <Text size="xs" c="dimmed" mt={4}>
                                Ingredienser: {rec.defaultIngredients.map((i) => i.name).join(", ")}
                              </Text>
                            </Paper>
                          ))}
                        </Stack>

                        {meal.notes && (
                          <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
                            Notat: &#34;{meal.notes}&#34;
                          </Text>
                        )}
                      </Stack>
                    </Card>
                  ))}
              </SimpleGrid>
            </Stack>
          </Paper>
        )}

        {/* --- UKES-VISNING (STØRRE BOKSER) --- */}
        {viewMode === "week" && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 7 }} spacing="md">
            {DAYS_LIST.map((day) => {
              const dayMeals = meals.filter((m) => m.day === day);

              return (
                <Paper
                  key={day}
                  p="md"
                  radius="md"
                  withBorder
                  shadow="xs"
                  bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
                  style={{ minHeight: 280, display: "flex", flexDirection: "column" }}
                >
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Group justify="space-between" align="center">
                      <Text fw={700} size="md" c="sage">
                        {day}
                      </Text>
                      <ActionIcon
                        variant="light"
                        color="sage"
                        size="sm"
                        onClick={() => handleOpenAddForDay(day)}
                      >
                        <IconPlus size={14} />
                      </ActionIcon>
                    </Group>

                    <Divider />

                    <Stack gap="xs" style={{ flex: 1 }}>
                      {dayMeals.length > 0 ? (
                        dayMeals.map((meal) => (
                          <Card
                            key={meal.id}
                            p="xs"
                            radius="sm"
                            withBorder
                            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                          >
                            <Stack gap={4}>
                              <Group justify="space-between" align="center">
                                <Badge
                                  size="xs"
                                  variant="light"
                                  color="sage"
                                  leftSection={getCategoryIcon(meal.category)}
                                >
                                  {meal.category}
                                </Badge>

                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size="xs"
                                  onClick={() => handleDeleteMeal(meal.id)}
                                >
                                  <IconTrash size={12} />
                                </ActionIcon>
                              </Group>

                              {meal.time && (
                                <Group gap={4}>
                                  <IconClock size={11} color="var(--mantine-color-dimmed)" />
                                  <Text size="10px" c="dimmed" fw={600}>
                                    Kl. {meal.time}
                                  </Text>
                                </Group>
                              )}

                              <Stack gap={2} mt={2}>
                                {meal.recipes.map((rec, idx) => (
                                  <Text key={rec.id} size="xs" fw={600} lh={1.3}>
                                    {meal.recipes.length > 1 && `${idx + 1}. `}
                                    {rec.title}
                                  </Text>
                                ))}
                              </Stack>

                              {meal.notes && (
                                <Text size="10px" c="dimmed" style={{ fontStyle: "italic" }}>
                                  &#34;{meal.notes}&#34;
                                </Text>
                              )}
                            </Stack>
                          </Card>
                        ))
                      ) : (
                        <Text size="xs" c="dimmed" ta="center" py="xl">
                          Ingen måltider
                        </Text>
                      )}
                    </Stack>

                    <Button
                      variant="subtle"
                      color="sage"
                      size="xs"
                      fullWidth
                      leftSection={<IconPlus size={12} />}
                      onClick={() => handleOpenAddForDay(day)}
                      mt="xs"
                    >
                      Legg til måltid
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </SimpleGrid>
        )}

        {/* --- MÅNED-VISNING --- */}
        {viewMode === "month" && (
          <Paper p="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} size="h4">
                  Månedsoversikt (August 2026)
                </Title>
                <Badge color="sage" variant="light">
                  {meals.length} planlagte måltider denne måneden
                </Badge>
              </Group>

              <Divider />

              <SimpleGrid cols={{ base: 2, sm: 4, md: 7 }} spacing="xs">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((dateNum) => {
                  const hasMeal = dateNum === 10 || dateNum === 15 || dateNum === 20;

                  return (
                    <Paper
                      key={dateNum}
                      p="xs"
                      radius="sm"
                      withBorder
                      bg={
                        hasMeal
                          ? "light-dark(var(--mantine-color-sage-0), var(--mantine-color-dark-5))"
                          : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
                      }
                      style={{
                        height: 80,
                        display: "flex",
                        flexDirection: "column",
                        justify: "space-between",
                      }}
                    >
                      <Group justify="space-between">
                        <Text size="xs" fw={700}>
                          {dateNum}.
                        </Text>
                        {hasMeal && <Badge size="xs" color="sage">Måltid</Badge>}
                      </Group>

                      {hasMeal && (
                        <Text size="10px" c="dimmed" truncate>
                          Kyllinggryte...
                        </Text>
                      )}
                    </Paper>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Paper>
        )}

        {/* --- NÆRINGSINNHOLD OVERSIKT FOR VALGT PERIODE --- */}
        <Paper
          p="lg"
          radius="md"
          withBorder
          bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
          shadow="xs"
        >
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon color="sage" variant="light" size="lg" radius="md">
                  <IconChartPie size={20} />
                </ThemeIcon>
                <div>
                  <Title order={3} size="h4">
                    Beregnet Næringsinnhold for Valgt Periode
                  </Title>
                  <Text size="xs" c="dimmed">
                    Totalt estimert næringsinnhold basert på alle planlagte retter i visningen.
                  </Text>
                </div>
              </Group>

              <Badge color="sage" variant="light">
                {activeMeals.length} Måltider inkludert
              </Badge>
            </Group>

            <Divider />

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              <Paper
                p="md"
                radius="md"
                bg="light-dark(var(--mantine-color-terracotta-0), var(--mantine-color-dark-6))"
                ta="center"
                withBorder
                style={{
                  borderColor: "light-dark(var(--mantine-color-terracotta-2), var(--mantine-color-terracotta-8))",
                }}
              >
                <ThemeIcon color="terracotta" variant="light" radius="xl" mb={4}>
                  <IconFlame size={18} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Total Energi
                </Text>
                <Text fw={800} size="xl" c="light-dark(var(--mantine-color-terracotta-9), var(--mantine-color-terracotta-3))">
                  {totalNutrition.calories} kcal
                </Text>
              </Paper>

              <Paper
                p="md"
                radius="md"
                bg="light-dark(var(--mantine-color-sage-0), var(--mantine-color-dark-6))"
                ta="center"
                withBorder
                style={{
                  borderColor: "light-dark(var(--mantine-color-sage-2), var(--mantine-color-sage-8))",
                }}
              >
                <Text size="xs" c="dimmed" mt={8}>
                  Proteiner
                </Text>
                <Text fw={800} size="xl" c="light-dark(var(--mantine-color-sage-9), var(--mantine-color-sage-3))">
                  {totalNutrition.protein} g
                </Text>
              </Paper>

              <Paper
                p="md"
                radius="md"
                bg="light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-6))"
                ta="center"
                withBorder
                style={{
                  borderColor: "light-dark(var(--mantine-color-blue-2), var(--mantine-color-blue-8))",
                }}
              >
                <Text size="xs" c="dimmed" mt={8}>
                  Karbohydrater
                </Text>
                <Text fw={800} size="xl" c="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-3))">
                  {totalNutrition.carbs} g
                </Text>
              </Paper>

              <Paper
                p="md"
                radius="md"
                bg="light-dark(var(--mantine-color-grape-0), var(--mantine-color-dark-6))"
                ta="center"
                withBorder
                style={{
                  borderColor: "light-dark(var(--mantine-color-grape-2), var(--mantine-color-grape-8))",
                }}
              >
                <Text size="xs" c="dimmed" mt={8}>
                  Fett
                </Text>
                <Text fw={800} size="xl" c="light-dark(var(--mantine-color-grape-9), var(--mantine-color-grape-3))">
                  {totalNutrition.fat} g
                </Text>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Paper>
      </Stack>

      {/* MODAL 1: LEGG TIL / REDIGER MÅLTID */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="➕ Legg til Måltid i Ukesmenyen"
        centered
        radius="md"
        size="md"
      >
        <Stack gap="md">
          <SimpleGrid cols={2} spacing="xs">
            <Select
              label="Dag"
              data={DAYS_LIST}
              value={selectedDay}
              onChange={(val) => setSelectedDay((val as DayOfWeek) || "Mandag")}
            />

            <Select
              label="Måltidstype"
              data={[
                "Frokost",
                "Brunsj",
                "Lunsj",
                "Middag",
                "Kveldsmat",
                "Mellommåltid / Snacks",
              ]}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory((val as MealCategory) || "Middag")}
            />
          </SimpleGrid>

          <TextInput
            label="Klokkeslett (Valgfritt)"
            placeholder="f.eks. 17:30"
            leftSection={<IconClock size={16} />}
            value={mealTime}
            onChange={(e) => setMealTime(e.currentTarget.value)}
          />

          <MultiSelect
            label="Oppskrift(er) / Retter i dette måltidet"
            placeholder="Velg én eller flere oppskrifter (f.eks. forrett + middag)..."
            data={MOCK_USER_RECIPES.map((r) => ({
              value: r.id,
              label: `${r.title} (${r.category}) - ${r.nutrition.calories} kcal`,
            }))}
            value={selectedRecipeIds}
            onChange={setSelectedRecipeIds}
            searchable
            clearable
          />

          <TextInput
            label="Egne notater (Valgfritt)"
            placeholder="f.eks. Serveres med friske urter eller salat"
            value={mealNotes}
            onChange={(e) => setMealNotes(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeAddModal}>
              Avbryt
            </Button>
            <Button color="sage" onClick={handleSaveMeal}>
              Lagre Måltid
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL 2: GENERER HANDLELISTE FORHÅNDSVISNING */}
      <Modal
        opened={shoppingModalOpened}
        onClose={closeShoppingModal}
        title="🛒 Generer Handleliste fra Måltidsplanen"
        centered
        radius="md"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Velg hvilke dager du skal handle for, og fjern eventuelt ingredienser du allerede har i skapet.
          </Text>

          {/* DAG-VELGER FOR HANDEL */}
          <Paper
            p="sm"
            radius="md"
            withBorder
            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
          >
            <Text size="xs" fw={700} mb="xs" c="dimmed" tt="uppercase">
              1. Velg dager som skal inkluderes
            </Text>
            <Group gap="xs" wrap="wrap">
              {DAYS_LIST.map((d) => (
                <Checkbox
                  key={d}
                  label={d}
                  checked={shoppingDays[d]}
                  onChange={(e) => {
                    const checked = e.currentTarget.checked;
                    setShoppingDays((prev) => ({ ...prev, [d]: checked }));
                  }}
                  color="sage"
                  size="xs"
                />
              ))}
            </Group>
          </Paper>

          {/* PÅMINNELSESBOKS */}
          <Alert color="terracotta" variant="light" icon={<IconInfoCircle size={18} />} radius="md">
            <Text size="xs">
              <b>Tips:</b> Du kan fjerne varer du har fra før direkte i listen under. Du kan også finjustere mengder, kategorier og krysse av varer på den dedikerte handlelistesiden etterpå.
            </Text>
          </Alert>

          {/* INGREDIENSLISTE FORHÅNDSVISNING */}
          <Paper p="sm" radius="md" withBorder style={{ overflowY: "auto", maxHeight: 260 }}>
            <Text size="xs" fw={700} mb="xs" c="dimmed" tt="uppercase">
              2. Ingredienser som legges til ({shoppingPreviewItems.length})
            </Text>

            {shoppingPreviewItems.length > 0 ? (
              <Stack gap={6}>
                {shoppingPreviewItems.map((item) => (
                  <Group key={item.id} justify="space-between" align="center" py={4} wrap="nowrap">
                    <Group gap="xs">
                      <Badge size="xs" color="gray" variant="light">
                        {item.day}
                      </Badge>
                      <Text size="xs" fw={600}>
                        {item.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ({item.amount}) – <i>{item.recipeTitle}</i>
                      </Text>
                    </Group>

                    <Tooltip label="Fjern fra denne handleturen">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        size="xs"
                        onClick={() => handleRemovePreviewItem(item.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text size="xs" c="dimmed" ta="center" py="md">
                Ingen ingredienser funnet for de valgte dagene.
              </Text>
            )}
          </Paper>

          {/* VALG FOR VEI VIDERE */}
          <Group justify="space-between" mt="md" wrap="wrap">
            <Button variant="default" onClick={closeShoppingModal}>
              Avbryt
            </Button>

            <Group gap="xs">
              <Button
                variant="light"
                color="sage"
                disabled={shoppingPreviewItems.length === 0}
                onClick={() => handleFinalizeShoppingList(false)}
              >
                Legg til og bli her
              </Button>
              <Button
                color="sage"
                rightSection={<IconArrowRight size={16} />}
                disabled={shoppingPreviewItems.length === 0}
                onClick={() => handleFinalizeShoppingList(true)}
              >
                Legg til og gå til handleliste
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </AsyncMainContainer>
  );
}