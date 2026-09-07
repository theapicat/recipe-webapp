"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  TextInput,
  Badge,
  ActionIcon,
  Button,
  Alert,
  SimpleGrid,
  Card,
  Image,
  Tabs,
  MultiSelect,
  Modal,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconPlus,
  IconStar,
  IconStarFilled,
  IconClock,
  IconInfoCircle,
  IconFridge,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconLink,
  IconChefHat,
  IconHistory,
  IconShare,
  IconCheck,
  IconMail,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import Link from "next/link";

interface Recipe {
  id: string;
  title: string;
  category: string;
  prepTime: string;
  servings: number;
  image: string;
  isFavorite: boolean;
  timesCooked: number;
  lastCooked: string;
  ingredients: string[];
}

const mockRecipes: Recipe[] = [
  {
    id: "rec-1",
    title: "Kremet Kyllinggryte med Paprika",
    category: "Middag",
    prepTime: "30 min",
    servings: 4,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    isFavorite: true,
    timesCooked: 14,
    lastCooked: "I går",
    ingredients: ["Kyllingfilet", "Paprika", "Fløte", "Løk", "Hvitløk"],
  },
  {
    id: "rec-2",
    title: "Hjemmelaget Lasagne",
    category: "Middag",
    prepTime: "60 min",
    servings: 6,
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80",
    isFavorite: true,
    timesCooked: 8,
    lastCooked: "For 5 dager siden",
    ingredients: ["Kjøttdeig", "Lasagreplater", "Ost", "Melk", "Hakkede tomater"],
  },
  {
    id: "rec-3",
    title: "Klassiske Luftige Pannekaker",
    category: "Frokost & Lunsj",
    prepTime: "20 min",
    servings: 4,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80",
    isFavorite: false,
    timesCooked: 22,
    lastCooked: "For 2 uker siden",
    ingredients: ["Hvetemel", "Melk", "Egg", "Smør"],
  },
  {
    id: "rec-4",
    title: "Lakseskål med Ponzu og Avokado",
    category: "Middag",
    prepTime: "25 min",
    servings: 2,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    isFavorite: false,
    timesCooked: 3,
    lastCooked: "For 1 måned siden",
    ingredients: ["Laksefilet", "Ris", "Avokado", "Ponzusaus", "Sesamfrø"],
  },
];

export default function UserRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>("all");

  // Modaler
  const [fridgeOpened, { open: openFridge, close: closeFridge }] = useDisclosure(false);
  const [shareOpened, { open: openShare, close: closeShare }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  // Tilstander for valgte elementer i modaler
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [isSendingShare, setIsSendingShare] = useState(false);

  // Toggle Favoritt
  const toggleFavorite = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  // Åpne delingsmodal
  const handleOpenShare = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setShareEmail("");
    openShare();
  };

  // Åpne slettemodal
  const handleOpenDelete = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    openDelete();
  };

  // Bekreft deling
  const handleSendShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !activeRecipe) return;

    setIsSendingShare(true);
    setTimeout(() => {
      setIsSendingShare(false);
      closeShare();
      notifications.show({
        title: "Oppskrift delt",
        message: `Kopi av "${activeRecipe.title}" er sendt til ${shareEmail}.`,
        color: "sage",
        icon: <IconCheck size={16} />,
      });
    }, 600);
  };

  // Bekreft sletting
  const handleConfirmDelete = () => {
    if (!activeRecipe) return;

    setRecipes((prev) => prev.filter((r) => r.id !== activeRecipe.id));
    closeDelete();
    notifications.show({
      title: "Oppskrift slettet",
      message: `"${activeRecipe.title}" ble fjernet fra din samling.`,
      color: "red",
    });
  };

  // Filtrering
  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "favorites"
          ? r.isFavorite
          : activeTab === "frequent"
            ? r.timesCooked >= 10
            : true;

    const matchesFridge =
      selectedIngredients.length === 0
        ? true
        : selectedIngredients.every((ing) =>
          r.ingredients.some((i) => i.toLowerCase().includes(ing.toLowerCase()))
        );

    return matchesSearch && matchesTab && matchesFridge;
  });

  return (
    <AsyncMainContainer size="lg" py={30}>
      <Stack gap="lg">
        {/* Prototyping Varsel */}
        <Alert
          color="terracotta"
          variant="light"
          title="🎨 Mine Oppskrifter - Oversikt"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Dette er din personlige oppskriftssamling. Herfra kan du navigere til detaljside, opprette nye retter, starte kokkemodus, redigere eller dele direkte via e-post.
        </Alert>

        {/* Overskrift & Handlingsknapper med Ruting */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>📖 Mine Oppskrifter</Title>
            <Text c="dimmed" size="sm">
              Oversikt over alle dine lagrede og importerte oppskrifter
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="light"
              color="sage"
              leftSection={<IconLink size={16} />}
              component={Link}
              href="/user/import"
            >
              Importer
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              color="sage"
              component={Link}
              href="/user/recipes/create"
            >
              Ny Oppskrift
            </Button>
          </Group>
        </Group>

        {/* Søkelinje & Kjøleskap-knapp */}
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <TextInput
                placeholder="Søk i oppskrifter..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1, maxWidth: 400 }}
              />

              <Button
                variant={selectedIngredients.length > 0 ? "filled" : "outline"}
                color={selectedIngredients.length > 0 ? "sage" : "gray"}
                leftSection={<IconFridge size={18} />}
                onClick={openFridge}
              >
                Tøm Kjøleskapet
                {selectedIngredients.length > 0 && ` (${selectedIngredients.length})`}
              </Button>
            </Group>

            {/* Faneblad for filtrering */}
            <Tabs value={activeTab} onChange={setActiveTab} color="sage">
              <Tabs.List>
                <Tabs.Tab value="all">Alle ({recipes.length})</Tabs.Tab>
                <Tabs.Tab
                  value="favorites"
                  leftSection={<IconStarFilled size={14} color="gold" />}
                >
                  Favoritter ({recipes.filter((r) => r.isFavorite).length})
                </Tabs.Tab>
                <Tabs.Tab value="frequent" leftSection={<IconHistory size={14} />}>
                  Mest Laget
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </Stack>
        </Paper>

        {/* Oppskriftskort Grid */}
        {filteredRecipes.length === 0 ? (
          <Paper p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
            <IconChefHat size={48} color="var(--mantine-color-dimmed)" style={{ margin: "0 auto" }} />
            <Text fw={500} mt="sm">
              Ingen oppskrifter funnet
            </Text>
            <Text size="sm" c="dimmed">
              Prøv å endre søkeord eller fjern ingrediensfilteret.
            </Text>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing="lg">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} withBorder radius="md" padding="md" style={{ overflow: "hidden" }}>
                <Card.Section style={{ position: "relative" }}>
                  <Image src={recipe.image} height={180} alt={recipe.title} />
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    radius="xl"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                    onClick={() => toggleFavorite(recipe.id)}
                  >
                    {recipe.isFavorite ? (
                      <IconStarFilled size={18} color="gold" />
                    ) : (
                      <IconStar size={18} color="white" />
                    )}
                  </ActionIcon>
                  <Badge
                    color="sage"
                    variant="filled"
                    style={{ position: "absolute", bottom: 10, left: 10 }}
                  >
                    {recipe.category}
                  </Badge>
                </Card.Section>

                <Stack justify="space-between" mt="md" style={{ flex: 1 }}>
                  <div>
                    <Group justify="space-between" align="flex-start">
                      <Text fw={600} size="lg" style={{ flex: 1 }}>
                        {recipe.title}
                      </Text>

                      <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            component={Link}
                            href={`/user/recipes/${recipe.id}`}
                            leftSection={<IconEye size={14} />}
                          >
                            Åpne Oppskrift
                          </Menu.Item>
                          <Menu.Item
                            component={Link}
                            href={`/user/recipes/${recipe.id}/cook`}
                            leftSection={<IconChefHat size={14} />}
                          >
                            Start Kokkemodus
                          </Menu.Item>
                          <Menu.Item
                            component={Link}
                            href={`/user/recipes/${recipe.id}/edit`}
                            leftSection={<IconEdit size={14} />}
                          >
                            Rediger
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconShare size={14} />}
                            onClick={() => handleOpenShare(recipe)}
                          >
                            Del med venn
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleOpenDelete(recipe)}
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
                          {recipe.prepTime}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">•</Text>
                      <Text size="xs" c="dimmed">
                        Laget {recipe.timesCooked} ganger
                      </Text>
                      <Text size="xs" c="dimmed">•</Text>
                      <Text size="xs" c="dimmed">
                        Sist: {recipe.lastCooked}
                      </Text>
                    </Group>
                  </div>

                  {/* Knapper med direkte ruting */}
                  <Group justify="space-between" mt="md">
                    <Button
                      component={Link}
                      href={`/user/recipes/${recipe.id}`}
                      variant="light"
                      color="sage"
                      size="xs"
                      leftSection={<IconEye size={14} />}
                    >
                      Se Oppskrift
                    </Button>
                    <Button
                      component={Link}
                      href={`/user/recipes/${recipe.id}/cook`}
                      variant="outline"
                      color="sage"
                      size="xs"
                      leftSection={<IconChefHat size={14} />}
                    >
                      Lag Nå
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>

      {/* MODAL 1: Tøm Kjøleskapet */}
      <Modal
        opened={fridgeOpened}
        onClose={closeFridge}
        title="🧊 Tøm Kjøleskapet (Avansert Søk)"
        centered
        radius="md"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Velg råvarene du har tilgjengelig i kjøleskapet eller skuffen, så viser vi oppskriftene fra samlingen din du kan lage!
          </Text>

          <MultiSelect
            label="Dine Ingredienser"
            placeholder="Velg eller skriv ingredienser..."
            data={[
              "Kyllingfilet",
              "Kjøttdeig",
              "Laksefilet",
              "Paprika",
              "Løk",
              "Hvitløk",
              "Fløte",
              "Melk",
              "Egg",
              "Ost",
              "Hvetemel",
              "Ris",
              "Avokado",
            ]}
            value={selectedIngredients}
            onChange={setSelectedIngredients}
            searchable
            clearable
          />

          <Group justify="space-between" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setSelectedIngredients([])}
            >
              Tøm utvalg
            </Button>
            <Button color="sage" onClick={closeFridge}>
              Vis Matchende Oppskrifter
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL 2: Del Oppskrift */}
      <Modal
        opened={shareOpened}
        onClose={closeShare}
        title="📩 Del Oppskrift med Venn"
        centered
        radius="md"
      >
        <form onSubmit={handleSendShare}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Send en kopi av <b>{activeRecipe?.title}</b> direkte til en venn eller et familiemedlem.
            </Text>

            <TextInput
              label="Mottakers E-postadresse"
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

      {/* MODAL 3: Bekreft Sletting */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="⚠️ Bekreft sletting"
        centered
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Er du sikker på at du vil slette <b>{activeRecipe?.title}</b> fra oppskriftene dine? Handlingen kan ikke angres.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDelete}>
              Avbryt
            </Button>
            <Button color="red" onClick={handleConfirmDelete}>
              Slett Oppskrift
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AsyncMainContainer>
  );
}