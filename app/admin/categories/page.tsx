"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  TextInput,
  Table,
  Badge,
  ActionIcon,
  Menu,
  Button,
  Alert,
  SimpleGrid,
  Card,
  Modal,
  Tabs,
  Select,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconDotsVertical,
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconTags,
  IconEdit,
  IconMeat,
  IconScale,
  IconCategory,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

// Mock Data
const mockCategories = [
  { id: "cat-1", name: "Middag", count: 128, status: "Aktiv" },
  { id: "cat-2", name: "Frokost & Lunsj", count: 45, status: "Aktiv" },
  { id: "cat-3", name: "Bakst", count: 62, status: "Aktiv" },
  { id: "cat-4", name: "Dessert", count: 29, status: "Aktiv" },
  { id: "cat-5", name: "Saus & Tilbehør", count: 18, status: "Aktiv" },
];

const mockIngredients = [
  { id: "ing-1", name: "Kyllingfilet", category: "Kjøtt & Fjell", allergens: "Ingen", defaultUnit: "g" },
  { id: "ing-2", name: "Hvetemel", category: "Tørrvarer", allergens: "Gluten", defaultUnit: "g" },
  { id: "ing-3", name: "Helmelk", category: "Meieri", allergens: "Laktose", defaultUnit: "dl" },
  { id: "ing-4", name: "Egg", category: "Meieri/Egg", allergens: "Egg", defaultUnit: "stk" },
  { id: "ing-5", name: "Olivenolje", category: "Olje & Krydder", allergens: "Ingen", defaultUnit: "ss" },
];

const mockUnits = [
  { id: "unit-1", name: "Gram", abbreviation: "g", type: "Vekt" },
  { id: "unit-2", name: "Kilogram", abbreviation: "kg", type: "Vekt" },
  { id: "unit-3", name: "Deciliter", abbreviation: "dl", type: "Volum" },
  { id: "unit-4", name: "Liter", abbreviation: "l", type: "Volum" },
  { id: "unit-5", name: "Spiseskje", abbreviation: "ss", type: "Mål" },
  { id: "unit-6", name: "Teskje", abbreviation: "ts", type: "Mål" },
  { id: "unit-7", name: "Stykk", abbreviation: "stk", type: "Antall" },
];

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<string | null>("categories");
  const [search, setSearch] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <AsyncMainContainer size="lg" py={30}>
      <Stack gap="lg">
        {/* Prototyping Varsel */}
        <Alert
          color="terracotta"
          title="🎨 Prototyping / Mockup-side"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Dette er en visuell skisse for <b>Kategori- og Råvareregisteret</b>. Herfra kan admin styre de globale masterdataene som brukes til kategorisering, søk og ingrediensberegninger i oppskriftene.
        </Alert>

        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>🏷️ Kategorier & Råvareregister</Title>
            <Text c="dimmed" size="sm">
              Administrer globale kategorier, standard ingredienser og måleenheter
            </Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} color="sage" onClick={open}>
            {activeTab === "categories"
              ? "Ny Kategori"
              : activeTab === "ingredients"
                ? "Ny Råvare"
                : "Ny Måleenhet"}
          </Button>
        </Group>

        {/* Nøkkeltall */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Card withBorder padding="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Kategorier
                </Text>
                <Title order={3}>{mockCategories.length}</Title>
              </div>
              <IconTags size={32} color="var(--mantine-color-sage-6)" />
            </Group>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Registrerte Råvarer
                </Text>
                <Title order={3}>{mockIngredients.length}</Title>
              </div>
              <IconMeat size={32} color="var(--mantine-color-terracotta-filled)" />
            </Group>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Måleenheter
                </Text>
                <Title order={3}>{mockUnits.length}</Title>
              </div>
              <IconScale size={32} color="var(--mantine-color-sage-6)" />
            </Group>
          </Card>
        </SimpleGrid>

        {/* Hovedinnhold i Tabs */}
        <Paper p="md" radius="md" withBorder>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="categories" leftSection={<IconCategory size={16} />}>
                Oppskriftskategorier
              </Tabs.Tab>
              <Tabs.Tab value="ingredients" leftSection={<IconMeat size={16} />}>
                Råvareregister
              </Tabs.Tab>
              <Tabs.Tab value="units" leftSection={<IconScale size={16} />}>
                Måleenheter
              </Tabs.Tab>
            </Tabs.List>

            {/* Søkefelt */}
            <Group justify="space-between" mb="md">
              <TextInput
                placeholder="Søk i registeret..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ width: 300 }}
              />
            </Group>

            {/* TAB 1: KATEGORIER */}
            <Tabs.Panel value="categories">
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Kategorinavn</Table.Th>
                    <Table.Th>Antall Oppskrifter</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th style={{ width: 60 }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {mockCategories
                    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                    .map((cat) => (
                      <Table.Tr key={cat.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {cat.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{cat.count} oppskrifter</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="sage" variant="light">
                            {cat.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<IconEdit size={14} />}>Rediger</Menu.Item>
                              <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                                Slett
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

            {/* TAB 2: RÅVAREREGISTER */}
            <Tabs.Panel value="ingredients">
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Råvare / Ingrediens</Table.Th>
                    <Table.Th>Kategori</Table.Th>
                    <Table.Th>Kjente Allergener</Table.Th>
                    <Table.Th>Standard Enhet</Table.Th>
                    <Table.Th style={{ width: 60 }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {mockIngredients
                    .filter((ing) => ing.name.toLowerCase().includes(search.toLowerCase()))
                    .map((ing) => (
                      <Table.Tr key={ing.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {ing.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{ing.category}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={ing.allergens === "Ingen" ? "gray" : "terracotta"}
                            variant="light"
                          >
                            {ing.allergens}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="outline" color="gray">{ing.defaultUnit}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<IconEdit size={14} />}>Rediger</Menu.Item>
                              <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                                Slett
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

            {/* TAB 3: MÅLEENHETER */}
            <Tabs.Panel value="units">
              <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Enhet</Table.Th>
                    <Table.Th>Forkortelse</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th style={{ width: 60 }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {mockUnits
                    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
                    .map((unit) => (
                      <Table.Tr key={unit.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {unit.name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="sage">{unit.abbreviation}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{unit.type}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item leftSection={<IconEdit size={14} />}>Rediger</Menu.Item>
                              <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                                Slett
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>

      {/* Opprettelses-Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          activeTab === "categories"
            ? "Legg til ny oppskriftskategori"
            : activeTab === "ingredients"
              ? "Legg til ny råvare"
              : "Legg til ny måleenhet"
        }
        centered
        radius="md"
      >
        <Stack gap="md">
          {activeTab === "categories" && (
            <TextInput label="Kategorinavn" placeholder="f.eks. Suppe" required />
          )}

          {activeTab === "ingredients" && (
            <>
              <TextInput label="Ingrediensnavn" placeholder="f.eks. Paprika" required />
              <Select
                label="Kategori"
                placeholder="Velg type"
                data={["Grønnsaker", "Kjøtt", "Meieri", "Tørrvarer", "Krydder"]}
              />
              <TextInput label="Allergener" placeholder="f.eks. Ingen, Gluten, Laktose" />
            </>
          )}

          {activeTab === "units" && (
            <>
              <TextInput label="Fullt navn" placeholder="f.eks. Milliliter" required />
              <TextInput label="Forkortelse" placeholder="f.eks. ml" required />
              <Select label="Type" placeholder="Velg typografi" data={["Vekt", "Volum", "Mål", "Antall"]} />
            </>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>
              Avbryt
            </Button>
            <Button color="sage" onClick={close}>
              Lagre
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AsyncMainContainer>
  );
}