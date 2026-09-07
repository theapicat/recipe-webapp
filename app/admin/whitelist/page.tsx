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
  Switch,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconDotsVertical,
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconWorldCheck,
  IconWorld,
  IconWorldOff,
  IconExternalLink,
  IconCheck,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

interface WhitelistedDomain {
  id: string;
  domain: string;
  name: string;
  status: "Aktiv" | "Inaktiv";
  addedAt: string;
  scrapedCount: number;
}

const mockDomainsData: WhitelistedDomain[] = [
  {
    id: "dom-1",
    domain: "matprat.no",
    name: "MatPrat",
    status: "Aktiv",
    addedAt: "01.01.2026",
    scrapedCount: 142,
  },
  {
    id: "dom-2",
    domain: "godt.no",
    name: "Godt.no (VG)",
    status: "Aktiv",
    addedAt: "05.01.2026",
    scrapedCount: 89,
  },
  {
    id: "dom-3",
    domain: "trinesmatblogg.no",
    name: "Trines Matblogg",
    status: "Aktiv",
    addedAt: "10.01.2026",
    scrapedCount: 204,
  },
  {
    id: "dom-4",
    domain: "meny.no",
    name: "Meny Oppskrifter",
    status: "Inaktiv",
    addedAt: "12.02.2026",
    scrapedCount: 12,
  },
];

export default function AdminWhitelistPage() {
  const [search, setSearch] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [newDomain, setNewDomain] = useState("");
  const [newName, setNewName] = useState("");

  const filteredDomains = mockDomainsData.filter(
    (d) =>
      d.domain.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AsyncMainContainer size="lg" py={30}>
      <Stack gap="lg">
        {/* Mockup Varsel-banner */}
        <Alert
          color="terracotta"
          title="🎨 Prototyping / Mockup-side"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Dette er en visuell skisse for <b>Godkjente Nettsider (Domene-Whitelist)</b>. Core API vil bruke denne databasen til å avvise ugyldige skrapeforespørsler.
        </Alert>

        {/* Overskrift og Handling */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>🌐 Godkjente Nettsider (Whitelist)</Title>
            <Text c="dimmed" size="sm">
              Styr hvilke domener skraperen har lov til å hente oppskrifter fra
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            color="sage"
            onClick={open}
          >
            Legg til domene
          </Button>
        </Group>

        {/* Nøkkeltall */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Card withBorder padding="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Godkjente Domener
                </Text>
                <Title order={3}>{mockDomainsData.length}</Title>
              </div>
              <IconWorldCheck size={32} color="var(--mantine-color-sage-6)" />
            </Group>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Aktive Domener
                </Text>
                <Title order={3}>
                  {mockDomainsData.filter((d) => d.status === "Aktiv").length}
                </Title>
              </div>
              <IconWorld size={32} color="var(--mantine-color-sage-6)" />
            </Group>
          </Card>

          <Card withBorder padding="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Inaktive Domener
                </Text>
                <Title order={3}>
                  {mockDomainsData.filter((d) => d.status === "Inaktiv").length}
                </Title>
              </div>
              <IconWorldOff size={32} color="var(--mantine-color-gray-6)" />
            </Group>
          </Card>
        </SimpleGrid>

        {/* Tabell over Godkjente Domener */}
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <TextInput
                placeholder="Søk på domene eller navn..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ width: 320 }}
              />
              <Text size="xs" c="dimmed">
                Viser {filteredDomains.length} av {mockDomainsData.length} domener
              </Text>
            </Group>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nettside / Domene</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Lagt til</Table.Th>
                  <Table.Th>Importerte Oppskrifter</Table.Th>
                  <Table.Th style={{ width: 60 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredDomains.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <div>
                        <Group gap="xs">
                          <Text size="sm" fw={600}>
                            {item.name}
                          </Text>
                          <ActionIcon
                            component="a"
                            href={`https://${item.domain}`}
                            target="_blank"
                            size="xs"
                            variant="subtle"
                            color="gray"
                          >
                            <IconExternalLink size={12} />
                          </ActionIcon>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {item.domain}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={item.status === "Aktiv" ? "sage" : "gray"}
                        variant="dot"
                      >
                        {item.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{item.addedAt}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{item.scrapedCount} stk</Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu position="bottom-end" shadow="md" width={180}>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Label>Handlinger</Menu.Label>
                          <Menu.Item
                            leftSection={
                              item.status === "Aktiv" ? (
                                <IconWorldOff size={14} />
                              ) : (
                                <IconCheck size={14} />
                              )
                            }
                          >
                            {item.status === "Aktiv"
                              ? "Deaktiver"
                              : "Aktiver"}
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                          >
                            Fjern domene
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      </Stack>

      {/* Modal for å legge til nytt domene */}
      <Modal
        opened={opened}
        onClose={close}
        title="Legg til nytt godkjent domene"
        centered
        radius="md"
      >
        <Stack gap="md">
          <TextInput
            label="Domene URL"
            placeholder="f.eks. matprat.no"
            required
            value={newDomain}
            onChange={(e) => setNewDomain(e.currentTarget.value)}
          />
          <TextInput
            label="Beskrivende Navn"
            placeholder="f.eks. MatPrat"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
          />
          <Switch
            label="Aktivert umiddelbart"
            defaultChecked
            color="sage"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>
              Avbryt
            </Button>

            <Button color="sage" onClick={close}>
              Lagre Domene
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AsyncMainContainer>
  );
}