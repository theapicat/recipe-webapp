"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Button,
  Image,
  ActionIcon,
  NumberInput,
  Checkbox,
  Divider,
  SimpleGrid,
  ThemeIcon,
  Tabs,
  Modal,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconChefHat,
  IconClock,
  IconUsers,
  IconStar,
  IconStarFilled,
  IconEdit,
  IconShare,
  IconArrowLeft,
  IconCheck,
  IconMail,
  IconSparkles,
  IconFlame,
  IconChartPie,
  IconShoppingCart,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

// Mock-modell for enkelt-oppskrift
interface RecipeDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  prepTime: string;
  cookTime: string;
  defaultServings: number;
  image: string;
  isFavorite: boolean;
  author: string;
  sourceUrl?: string;
  ingredients: { id: string; name: string; amount: number; unit: string }[];
  steps: { stepNumber: number; instruction: string }[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const mockRecipeDetail: RecipeDetail = {
  id: "rec-1",
  title: "Kremet Kyllinggryte med Paprika",
  description:
    "En smaksrik og rask kyllinggryte som passer perfekt til både hverdag og helg. Serveres gjerne med ris eller ferskt brød.",
  category: "Middag",
  prepTime: "15 min",
  cookTime: "15 min",
  defaultServings: 4,
  image:
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
  isFavorite: true,
  author: "Importert fra Matprat",
  sourceUrl: "https://www.matprat.no/oppskrifter/kremet-kyllinggryte",
  ingredients: [
    { id: "ing-1", name: "Kyllingfilet", amount: 600, unit: "g" },
    { id: "ing-2", name: "Rød paprika", amount: 2, unit: "stk" },
    { id: "ing-3", name: "Matfløte", amount: 3, unit: "dl" },
    { id: "ing-4", name: "Gul løk", amount: 1, unit: "stk" },
    { id: "ing-5", name: "Hvitløksfedd", amount: 2, unit: "stk" },
    { id: "ing-6", name: "Kyllingbuljong (utblandet)", amount: 2, unit: "dl" },
  ],
  steps: [
    {
      stepNumber: 1,
      instruction:
        "Skjær kyllingfilet i strimler og finhakk løk, hvitløk og paprika.",
    },
    {
      stepNumber: 2,
      instruction:
        "Varm opp en stekepanne med litt olje eller smør, og brun kyllingen til den har fått fin farge.",
    },
    {
      stepNumber: 3,
      instruction:
        "Tilsett løk og hvitløk og la det surre med i et par minutter til løken er myk.",
    },
    {
      stepNumber: 4,
      instruction:
        "Hell over kyllingbuljong og fløte, tilsett paprika, og la gryten småkoke i ca. 10 minutter til sausen tykner.",
    },
    {
      stepNumber: 5,
      instruction: "Smak til med salt, pepper og eventuelt litt frisk timian før servering.",
    },
  ],
  nutrition: {
    calories: 520,
    protein: 42,
    carbs: 12,
    fat: 34,
  },
};

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params?.id as string;

  const [recipe, setRecipe] = useState<RecipeDetail>(mockRecipeDetail);
  const [servings, setServings] = useState<number>(mockRecipeDetail.defaultServings);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [isAddingToShoppingList, setIsAddingToShoppingList] = useState(false);

  // Share modal state
  const [shareOpened, { open: openShare, close: closeShare }] = useDisclosure(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSendingShare, setIsSendingShare] = useState(false);

  // Porsjonsskalering
  const scaleRatio = servings / recipe.defaultServings;

  const toggleFavorite = () => {
    setRecipe((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  const toggleIngredientCheck = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Legg i handleliste (Enten valgte ingredienser eller alle)
  const handleAddToShoppingList = () => {
    setIsAddingToShoppingList(true);

    const checkedIds = Object.keys(checkedIngredients).filter((id) => checkedIngredients[id]);
    const itemsToAdd = checkedIds.length > 0
      ? recipe.ingredients.filter((ing) => checkedIds.includes(ing.id))
      : recipe.ingredients;

    setTimeout(() => {
      setIsAddingToShoppingList(false);
      notifications.show({
        title: "Lagt til i handlelisten",
        message: `${itemsToAdd.length} ingrediens(er) ble overført til din handleliste.`,
        color: "sage",
        icon: <IconShoppingCart size={16} />,
      });
    }, 400);
  };

  const handleSendShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail) return;

    setIsSendingShare(true);
    setTimeout(() => {
      setIsSendingShare(false);
      closeShare();
      notifications.show({
        title: "Oppskrift delt",
        message: `Kopi av "${recipe.title}" ble sendt til ${shareEmail}.`,
        color: "sage",
        icon: <IconCheck size={16} />,
      });
      setShareEmail("");
    }, 500);
  };

  const selectedCount = Object.values(checkedIngredients).filter(Boolean).length;

  return (
    <AsyncMainContainer size="md" py={30}>
      <Stack gap="lg">
        {/* NAVIGASJON TILBAKE */}
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href="/user/recipes"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
          >
            Tilbake til oppskrifter
          </Button>

          <Group gap="xs">
            <Button
              variant="light"
              color="sage"
              leftSection={<IconShare size={16} />}
              onClick={openShare}
            >
              Del
            </Button>
            <Button
              component={Link}
              href={`/user/recipes/${recipeId}/edit`}
              variant="light"
              color="sage"
              leftSection={<IconEdit size={16} />}
            >
              Rediger
            </Button>
            <Button
              component={Link}
              href={`/user/recipes/${recipeId}/cook`}
              color="sage"
              leftSection={<IconChefHat size={18} />}
            >
              Start Kokkemodus
            </Button>
          </Group>
        </Group>

        {/* HERO BILDE & TITTEL */}
        <Paper radius="md" withBorder style={{ overflow: "hidden" }}>
          <div style={{ position: "relative", height: 320 }}>
            <Image
              src={recipe.image}
              height={320}
              alt={recipe.title}
              fallbackSrc="https://placehold.co/1200x600?text=Ingen+bilde"
            />
            <ActionIcon
              variant="filled"
              color="dark"
              radius="xl"
              size="lg"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
              onClick={toggleFavorite}
            >
              {recipe.isFavorite ? (
                <IconStarFilled size={22} color="gold" />
              ) : (
                <IconStar size={22} color="white" />
              )}
            </ActionIcon>

            <Badge
              color="sage"
              size="lg"
              variant="filled"
              style={{ position: "absolute", bottom: 16, left: 16 }}
            >
              {recipe.category}
            </Badge>
          </div>

          <Stack p="lg" gap="sm">
            <Title order={1} size="h2">
              {recipe.title}
            </Title>
            <Text c="dimmed" size="sm">
              {recipe.description}
            </Text>

            <Divider my="xs" />

            {/* NØKKELTALL (Tid, Porsjoner, Kilde) */}
            <Group justify="space-between" align="center" wrap="wrap">
              <Group gap="xl">
                <Group gap="xs">
                  <ThemeIcon color="sage" variant="light" radius="md">
                    <IconClock size={18} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">
                      Tid totalt
                    </Text>
                    <Text size="sm" fw={600}>
                      {recipe.prepTime} (+ {recipe.cookTime} koketid)
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
                      onChange={(val) => setServings(Number(val) || 1)}
                      min={1}
                      max={20}
                      size="xs"
                      style={{ width: 70 }}
                    />
                  </div>
                </Group>
              </Group>

              {recipe.sourceUrl && (
                <Text size="xs" c="dimmed">
                  {recipe.author}
                </Text>
              )}
            </Group>
          </Stack>
        </Paper>

        {/* HOVEDINNHOLD: FANEINNDELING */}
        <Tabs defaultValue="recipe" variant="outline" radius="md" color="sage">
          <Tabs.List mb="md">
            <Tabs.Tab value="recipe" leftSection={<IconChefHat size={16} />}>
              Oppskrift & Ingredienser
            </Tabs.Tab>
            <Tabs.Tab value="nutrition" leftSection={<IconChartPie size={16} />}>
              Næringsinnhold (Veiledende)
            </Tabs.Tab>
          </Tabs.List>

          {/* FANE 1: OPPSKRIFT & INGREDIENSER */}
          <Tabs.Panel value="recipe">
            <SimpleGrid cols={{ base: 1, md: 5 }} spacing="lg">
              {/* INGREDIENSER (2 cols) */}
              <Paper p="lg" radius="md" withBorder style={{ gridColumn: "span 2" }}>
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                    <div>
                      <Title order={3} size="h4">
                        Ingredienser
                      </Title>
                      <Badge color="gray" variant="light" size="xs" mt={2}>
                        {servings} porsjoner
                      </Badge>
                    </div>

                    <Button
                      variant="light"
                      color="sage"
                      size="xs"
                      leftSection={<IconShoppingCart size={14} />}
                      onClick={handleAddToShoppingList}
                      loading={isAddingToShoppingList}
                    >
                      {selectedCount > 0
                        ? `Legg valgte (${selectedCount}) i liste`
                        : "Legg alle i handleliste"}
                    </Button>
                  </Group>

                  <Divider />

                  <Stack gap="sm">
                    {recipe.ingredients.map((ing) => {
                      const scaledAmount = Math.round(ing.amount * scaleRatio * 10) / 10;
                      const isChecked = checkedIngredients[ing.id];

                      return (
                        <Group key={ing.id} justify="space-between" align="center" wrap="nowrap">
                          <Checkbox
                            checked={isChecked || false}
                            onChange={() => toggleIngredientCheck(ing.id)}
                            label={
                              <Text
                                size="sm"
                                style={{
                                  textDecoration: isChecked ? "line-through" : "none",
                                  color: isChecked ? "var(--mantine-color-dimmed)" : "inherit",
                                }}
                              >
                                <b>
                                  {scaledAmount} {ing.unit}
                                </b>{" "}
                                {ing.name}
                              </Text>
                            }
                            color="sage"
                            style={{ flex: 1 }}
                          />

                          <Tooltip label="Legg kun denne i handlelisten" position="left">
                            <ActionIcon
                              variant="subtle"
                              color="sage"
                              size="sm"
                              onClick={() => {
                                notifications.show({
                                  title: "Lagt til i handlelisten",
                                  message: `${scaledAmount} ${ing.unit} ${ing.name} ble lagt til.`,
                                  color: "sage",
                                  icon: <IconShoppingCart size={16} />,
                                });
                              }}
                            >
                              <IconPlus size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>

              {/* FREMGANGSMÅTE (3 cols) */}
              <Paper p="lg" radius="md" withBorder style={{ gridColumn: "span 3" }}>
                <Stack gap="md">
                  <Title order={3} size="h4">
                    Slik gjør du det
                  </Title>
                  <Divider />

                  <Stack gap="lg">
                    {recipe.steps.map((step) => (
                      <Group key={step.stepNumber} align="flex-start" wrap="nowrap" gap="md">
                        <ThemeIcon color="sage" size={32} radius="xl" variant="filled">
                          <Text fw={700} size="sm">
                            {step.stepNumber}
                          </Text>
                        </ThemeIcon>
                        <Text size="sm" lh={1.6} style={{ flex: 1, paddingTop: 2 }}>
                          {step.instruction}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Tabs.Panel>

          {/* FANE 2: NÆRINGSINNHOLD */}
          <Tabs.Panel value="nutrition">
            <Paper p="lg" radius="md" withBorder bg="white">
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Title order={3} size="h4">
                      Beregnet næringsinnhold per porsjon
                    </Title>
                    <Text size="xs" c="dimmed">
                      Basert på offentlige næringsdata fra Matvaretabellen.
                    </Text>
                  </div>
                  <Badge color="sage" variant="light" leftSection={<IconSparkles size={12} />}>
                    Automatisk beregnet
                  </Badge>
                </Group>

                <Divider />

                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                  <Paper p="md" radius="md" bg="terracotta.0" ta="center" withBorder style={{ borderColor: "var(--mantine-color-terracotta-2)" }}>
                    <ThemeIcon color="terracotta" variant="light" radius="xl" mb={4}>
                      <IconFlame size={18} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">
                      Energi
                    </Text>
                    <Text fw={800} size="xl" c="terracotta.9">
                      {recipe.nutrition.calories} kcal
                    </Text>
                  </Paper>

                  <Paper p="md" radius="md" bg="sage.0" ta="center" withBorder style={{ borderColor: "var(--mantine-color-sage-2)" }}>
                    <Text size="xs" c="dimmed" mt={8}>
                      Proteiner
                    </Text>
                    <Text fw={800} size="xl" c="sage.9">
                      {recipe.nutrition.protein} g
                    </Text>
                  </Paper>

                  <Paper p="md" radius="md" bg="blue.0" ta="center" withBorder style={{ borderColor: "var(--mantine-color-blue-2)" }}>
                    <Text size="xs" c="dimmed" mt={8}>
                      Karbohydrater
                    </Text>
                    <Text fw={800} size="xl" c="blue.9">
                      {recipe.nutrition.carbs} g
                    </Text>
                  </Paper>

                  <Paper p="md" radius="md" bg="grape.0" ta="center" withBorder style={{ borderColor: "var(--mantine-color-grape-2)" }}>
                    <Text size="xs" c="dimmed" mt={8}>
                      Fett
                    </Text>
                    <Text fw={800} size="xl" c="grape.9">
                      {recipe.nutrition.fat} g
                    </Text>
                  </Paper>
                </SimpleGrid>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* DELINGSMODAL */}
      <Modal opened={shareOpened} onClose={closeShare} title="📩 Del Oppskrift" centered radius="md">
        <form onSubmit={handleSendShare}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Send en kopi av <b>{recipe.title}</b> direkte til e-postadressen til en venn.
            </Text>

            <TextInput
              label="Mottakers e-postadresse"
              placeholder="venn@eksempel.no"
              leftSection={<IconMail size={16} />}
              value={shareEmail}
              onChange={(e) => setShareEmail(e.currentTarget.value)}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeShare} disabled={isSendingShare}>
                Avbryt
              </Button>
              <Button color="sage" type="submit" loading={isSendingShare}>
                Send Oppskrift
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </AsyncMainContainer>
  );
}