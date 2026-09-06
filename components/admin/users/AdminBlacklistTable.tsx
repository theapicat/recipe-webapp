"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Group,
  Text,
  Badge,
  ActionIcon,
  Button,
  Modal,
  TextInput,
  Select,
  Textarea,
  Stack,
  Paper,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconTrash,
  IconPlus,
  IconSearch,
  IconMailOff,
  IconWorldOff,
  IconAlertCircle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { agentInternal } from "@/lib/agent/agentInternal";
import { BlacklistType } from "@/lib/models/enums/BlacklistType";
import {BlacklistedEntry} from "@/lib/models/admin/users/DeleteAndBlacklistUserAdminRequest";

export function AdminBlacklistTable() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<BlacklistedEntry[]>([]);
  const [search, setSearch] = useState("");

  // Modal-tilstander for å legge til ny oppføring
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pattern, setPattern] = useState("");
  const [type, setType] = useState<string>("1"); // "1" = ExactEmail, "2" = Domain
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal-tilstand for sletting fra svarteliste
  const [deleteTarget, setDeleteTarget] = useState<BlacklistedEntry | null>(null);

  // Hent svartelisten
  const fetchBlacklist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentInternal.get("/api/admin/users/blacklist");
      if (res.ok) {
        const responseData = await res.json();
        const items = Array.isArray(responseData.body)
          ? responseData.body
          : responseData.body?.items || [];
        setEntries(items);
      }
    } catch (err) {
      console.error("Feil ved henting av svarteliste:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  // Legg til i svarteliste
  const handleAddEntry = async () => {
    if (!pattern.trim()) {
      notifications.show({
        title: "Manglende felt",
        message: "Skriv inn e-postadresse eller domene.",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await agentInternal.post("/api/admin/users/blacklist", {
        pattern: pattern.trim(),
        type: parseInt(type, 10),
        reason: reason.trim() || undefined,
      });

      if (res.ok) {
        notifications.show({
          title: "Lagt til i svarteliste",
          message: `${pattern} ble lagt til i svartelisten.`,
          color: "teal",
        });
        setAddModalOpen(false);
        setPattern("");
        setReason("");
        fetchBlacklist();
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Handling mislyktes",
          message: errorData.message || "Kunne ikke legge til i svartelisten.",
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Nettverksfeil",
        message: "Kunne ikke koble til serveren.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Fjern fra svarteliste
  const handleRemoveEntry = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);

    try {
      const res = await agentInternal.delete(`/api/admin/users/blacklist/${deleteTarget.id}`);
      if (res.ok) {
        notifications.show({
          title: "Oppføring fjernet",
          message: `${deleteTarget.pattern} ble fjernet fra svartelisten.`,
          color: "blue",
        });
        setDeleteTarget(null);
        fetchBlacklist();
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Handling mislyktes",
          message: errorData.message || "Kunne ikke fjerne oppføringen.",
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Nettverksfeil",
        message: "Kunne ikke koble til serveren.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase().trim();
    return entries.filter(
      (e) =>
        e.pattern.toLowerCase().includes(q) ||
        (e.reason && e.reason.toLowerCase().includes(q))
    );
  }, [entries, search]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Ukjent";
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <Paper p="md" radius="md" withBorder shadow="xs">
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap">
          <div>
            <Title order={4}>🚫 Registrerte Svartelister</Title>
            <Text size="xs" c="dimmed">
              E-postadresser og domener i denne listen nektes registrering i Kjøkkenhylla.
            </Text>
          </div>

          <Group gap="sm">
            <TextInput
              placeholder="Søk i svartelisten..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ width: 240 }}
            />

            <Button
              color="red"
              leftSection={<IconPlus size={16} />}
              onClick={() => setAddModalOpen(true)}
            >
              Legg til oppføring
            </Button>
          </Group>
        </Group>

        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>E-post / Domene</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Begrunnelse</Table.Th>
              <Table.Th>Lagt til</Table.Th>
              <Table.Th style={{ width: 60 }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: "center", padding: "30px" }}>
                  <Text c="dimmed">Laster svarteliste...</Text>
                </Table.Td>
              </Table.Tr>
            ) : filteredEntries.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: "center", padding: "30px" }}>
                  <Text c="dimmed">Ingen oppføringer funnet i svartelisten.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredEntries.map((entry) => (
                <Table.Tr key={entry.id}>
                  <Table.Td>
                    <Group gap="xs">
                      {entry.type === BlacklistType.ExactEmail ? (
                        <IconMailOff size={16} color="var(--mantine-color-red-6)" />
                      ) : (
                        <IconWorldOff size={16} color="var(--mantine-color-orange-6)" />
                      )}
                      <Text size="sm" fw={600}>
                        {entry.pattern}
                      </Text>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Badge
                      color={entry.type === BlacklistType.ExactEmail ? "red" : "orange"}
                      variant="light"
                      size="xs"
                    >
                      {entry.type === BlacklistType.ExactEmail ? "Eksakt E-post" : "Domene"}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {entry.reason || "Ingen begrunnelse angitt"}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs">{formatDate(entry.createdAt)}</Text>
                  </Table.Td>

                  <Table.Td>
                    <Tooltip label="Fjern fra svarteliste">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => setDeleteTarget(entry)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Stack>

      {/* MODAL: LEGG TIL I SVARTELISTE */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Legg til i svartelisten"
        centered
      >
        <Stack gap="md">
          <Select
            label="Sperretype"
            data={[
              { value: "1", label: "Eksakt e-postadresse (f.eks. spammer@bad.com)" },
              { value: "2", label: "Hele domenet (f.eks. tempmail.com)" },
            ]}
            value={type}
            onChange={(val) => setType(val || "1")}
          />

          <TextInput
            label={type === "1" ? "E-postadresse" : "Domene (uten @)"}
            placeholder={type === "1" ? "bruker@misbruk.com" : "disposable-mail.org"}
            value={pattern}
            onChange={(e) => setPattern(e.currentTarget.value)}
            required
          />

          <Textarea
            label="Begrunnelse (valgfri)"
            placeholder="f.eks. Uønsket domene / registrert spambot"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            rows={3}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setAddModalOpen(false)}>
              Avbryt
            </Button>
            <Button color="red" onClick={handleAddEntry} loading={submitting}>
              Svartelist
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL: BEKREFT FJERNING */}
      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Fjern fra svarteliste"
        centered
      >
        <Stack gap="md">
          <Group gap="xs" c="orange">
            <IconAlertCircle size={24} />
            <Text fw={600}>Gjenåpne for registrering</Text>
          </Group>

          <Text size="sm">
            Er du sikker på at du vil fjerne <b>{deleteTarget?.pattern}</b> fra svartelisten? Dette vil tillate nye registreringer med denne e-posten/domenet igjen.
          </Text>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>
              Avbryt
            </Button>
            <Button color="red" onClick={handleRemoveEntry} loading={submitting}>
              Fjern fra list
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}