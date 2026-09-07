"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  TextInput,
  Select,
  Button,
  Alert,
  Checkbox,
  Badge,
  ActionIcon,
  Progress,
  Divider,
  Menu,
} from "@mantine/core";
import {
  IconShoppingCart,
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconCarrot,
  IconMeat,
  IconMilk,
  IconBread,
  IconDotsVertical,
  IconCheck,
  IconRefresh,
  IconClearAll,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

type CategoryType =
  | "Frukt & Grønt"
  | "Kjøtt & Fisk"
  | "Meieri & Egg"
  | "Tørrvarer & Hermetikk"
  | "Annet";

interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: CategoryType;
  checked: boolean;
}

const initialItems: ShoppingItem[] = [
  { id: "1", name: "Rød paprika", amount: "2 stk", category: "Frukt & Grønt", checked: false },
  { id: "2", name: "Gule løk", amount: "1 nett", category: "Frukt & Grønt", checked: true },
  { id: "3", name: "Kyllingfilet", amount: "600 g", category: "Kjøtt & Fisk", checked: false },
  { id: "4", name: "Kjøttdeig 14%", amount: "400 g", category: "Kjøtt & Fisk", checked: false },
  { id: "5", name: "Matfløte", amount: "3 dl", category: "Meieri & Egg", checked: true },
  { id: "6", name: "Helmelk", amount: "1 liter", category: "Meieri & Egg", checked: false },
  { id: "7", name: "Lasagreplater", amount: "1 pakke", category: "Tørrvarer & Hermetikk", checked: false },
  { id: "8", name: "Hakkede tomater", amount: "2 bokser", category: "Tørrvarer & Hermetikk", checked: true },
];

const categoryConfig: Record<CategoryType, { color: string; icon: React.ElementType }> = {
  "Frukt & Grønt": { color: "sage", icon: IconCarrot },
  "Kjøtt & Fisk": { color: "terracotta", icon: IconMeat },
  "Meieri & Egg": { color: "sage", icon: IconMilk },
  "Tørrvarer & Hermetikk": { color: "sage", icon: IconBread },
  Annet: { color: "gray", icon: IconShoppingCart },
};

const categories: CategoryType[] = [
  "Frukt & Grønt",
  "Kjøtt & Fisk",
  "Meieri & Egg",
  "Tørrvarer & Hermetikk",
  "Annet",
];

export default function UserShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [itemCategory, setItemCategory] = useState<CategoryType>("Frukt & Grønt");

  // Beregn status
  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Legg til ny vare
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemName.trim()) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      amount: itemAmount.trim() || "1 stk",
      category: itemCategory,
      checked: false,
    };

    setItems((prev) => [newItem, ...prev]);
    setItemName("");
    setItemAmount("");
  };

  // Toggle avkryssing
  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  // Slett én vare
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Fjern alle avkryssede
  const clearCompleted = () => {
    setItems((prev) => prev.filter((i) => !i.checked));
  };

  // Tøm hele listen
  const clearAll = () => {
    setItems([]);
  };

  return (
    <AsyncMainContainer size="lg" py={30}>
      <Stack gap="lg">
        {/* Prototyping Varsel */}
        <Alert
          color="terracotta"
          variant="light"
          title="🎨 Prototyping / Mockup-side"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Dette er en visuell skisse for <b>Handlelisten</b>. Her kan du legge til varer manuelt, krysse av mens du handler, og organisere varene etter avdeling.
        </Alert>

        {/* Tittel & Handlinger */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>🛒 Min Handleliste</Title>
            <Text c="dimmed" size="sm">
              Hold orden på innkjøpene dine i butikken
            </Text>
          </div>

          <Group gap="xs">
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="default" size="lg">
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconClearAll size={16} />}
                  onClick={clearCompleted}
                  disabled={checkedCount === 0}
                >
                  Fjern kjøpte varer ({checkedCount})
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={16} />}
                  color="red"
                  onClick={clearAll}
                  disabled={totalCount === 0}
                >
                  Tøm hele listen
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Legg til ny vare-skjema */}
        <Paper p="md" radius="md" withBorder>
          <form onSubmit={handleAddItem}>
            <Stack gap="sm">
              <Text fw={600} size="sm">
                ➕ Legg til i handlelisten
              </Text>
              <Group align="flex-start" grow>
                <TextInput
                  placeholder="Vare (f.eks. Melk)"
                  value={itemName}
                  onChange={(e) => setItemName(e.currentTarget.value)}
                  style={{ flex: 2 }}
                />
                <TextInput
                  placeholder="Mengde (f.eks. 2 liter)"
                  value={itemAmount}
                  onChange={(e) => setItemAmount(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <Select
                  data={categories}
                  value={itemCategory}
                  onChange={(val) => setItemCategory((val as CategoryType) || "Annet")}
                  style={{ flex: 1.5 }}
                />
                <Button color="sage" type="submit" leftSection={<IconPlus size={16} />}>
                  Legg til
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        {/* Status og Fremgang */}
        {totalCount > 0 && (
          <Paper p="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Handlestatus: {checkedCount} av {totalCount} varer plukket
                </Text>
                <Badge color={progressPercent === 100 ? "sage" : "terracotta"} variant="light">
                  {progressPercent}% Fullført
                </Badge>
              </Group>
              <Progress value={progressPercent} color="sage" animated={progressPercent < 100} />
            </Stack>
          </Paper>
        )}

        {/* Tom liste-melding */}
        {totalCount === 0 && (
          <Paper p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
            <IconShoppingCart size={48} color="var(--mantine-color-dimmed)" style={{ margin: "0 auto" }} />
            <Text fw={500} mt="sm">
              Handlelisten din er tom!
            </Text>
            <Text size="sm" c="dimmed">
              Legg til varer manuelt ovenfor eller overfør ingredienser direkte fra måltidsplanleggeren.
            </Text>
          </Paper>
        )}

        {/* Kategoriserte Varelister */}
        {categories.map((cat) => {
          const categoryItems = items.filter((i) => i.category === cat);
          if (categoryItems.length === 0) return null;

          const Config = categoryConfig[cat];
          const CategoryIcon = Config.icon;

          return (
            <Paper key={cat} p="md" radius="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <Badge color={Config.color} variant="light" size="lg" leftSection={<CategoryIcon size={14} />}>
                      {cat}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      ({categoryItems.filter((i) => i.checked).length}/{categoryItems.length})
                    </Text>
                  </Group>
                </Group>

                <Divider />

                <Stack gap="xs">
                  {categoryItems.map((item) => (
                    <Group key={item.id} justify="space-between" align="center" wrap="nowrap">
                      <Checkbox
                        color="sage"
                        checked={item.checked}
                        onChange={() => toggleItem(item.id)}
                        label={
                          <Text
                            size="sm"
                            style={{
                              textDecoration: item.checked ? "line-through" : "none",
                              color: item.checked ? "var(--mantine-color-dimmed)" : "inherit",
                              fontWeight: item.checked ? 400 : 500,
                            }}
                          >
                            {item.name}
                          </Text>
                        }
                      />

                      <Group gap="sm" wrap="nowrap">
                        <Badge variant="outline" color="gray" size="sm">
                          {item.amount}
                        </Badge>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </AsyncMainContainer>
  );
}