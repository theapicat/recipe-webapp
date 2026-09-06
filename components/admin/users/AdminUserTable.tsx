"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Table,
  Group,
  Avatar,
  Text,
  Badge,
  Menu,
  ActionIcon,
  Modal,
  Textarea,
  Button,
  Stack,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconLock,
  IconLockOpen,
  IconKey,
  IconTrash,
  IconShield,
  IconMailCheck,
  IconUser,
  IconAlertTriangle,
  IconUserOff,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";

interface Props {
  users: AdminUserListItem[];
  onRefreshNeeded: () => void;
}

export function AdminUserTable({ users, onRefreshNeeded }: Props) {
  const router = useRouter();

  // Tilstander for handlings-dialoger
  const [lockTarget, setLockTarget] = useState<AdminUserListItem | null>(null);
  const [lockReason, setLockReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(null);
  const [blacklistTarget, setBlacklistTarget] = useState<AdminUserListItem | null>(null);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Formatteringshjelper for dato
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Aldri";
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  // --- HANDLER: LÅS BRUKER ---
  const handleLockUser = async () => {
    if (!lockTarget) return;
    setActionLoading(true);

    try {
      const res = await agentInternal.post("/api/admin/users/lock", {
        userId: lockTarget.userId,
        reasonDetails: lockReason || "Sperret manuelt av administrator.",
      });

      if (res.ok) {
        notifications.show({
          title: "Bruker sperret",
          message: `Kontoen til ${lockTarget.email} har blitt sperret.`,
          color: "orange",
        });
        setLockTarget(null);
        setLockReason("");
        onRefreshNeeded();
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Handling mislyktes",
          message: errorData.message || "Kunne ikke sperre brukeren.",
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
      setActionLoading(false);
    }
  };

  // --- HANDLER: GJENÅPNE BRUKER ---
  const handleUnlockUser = async (user: AdminUserListItem) => {
    try {
      const res = await agentInternal.post("/api/admin/users/unlock", {
        userId: user.userId,
      });

      if (res.ok) {
        notifications.show({
          title: "Konto gjenåpnet",
          message: `Sperren for ${user.email} er nå fjernet.`,
          color: "teal",
        });
        onRefreshNeeded();
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Handling mislyktes",
          message: errorData.message || "Kunne ikke gjenåpne brukeren.",
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Nettverksfeil",
        message: "Kunne ikke koble til serveren.",
        color: "red",
      });
    }
  };

  // --- HANDLER: SEND BEKREFTELSESE-POST ---
  const handleResendConfirmation = async (user: AdminUserListItem) => {
    try {
      const res = await agentInternal.post("/api/admin/users/resend-confirmation", {
        userId: user.userId,
      });

      if (res.ok) {
        notifications.show({
          title: "E-post sendt",
          message: `Ny bekreftelseslenke sendt til ${user.email}.`,
          color: "blue",
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Handling mislyktes",
          message: errorData.message || "Kunne ikke sende bekreftelse.",
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Nettverksfeil",
        message: "Kunne ikke koble til serveren.",
        color: "red",
      });
    }
  };

  // --- HANDLER: TILBAKESTILL PASSORD ---
  const handleResetPassword = async (user: AdminUserListItem) => {
    try {
      const res = await agentInternal.post(
        "/api/admin/users/reset-password-request",
        { userId: user.userId }
      );

      if (res.ok) {
        notifications.show({
          title: "E-post sendt",
          message: `Tilbakestillingslenke for passord sendt til ${user.email}.`,
          color: "blue",
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Handling mislyktes",
          message: errorData.message || "Kunne ikke sende passord-reset.",
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Nettverksfeil",
        message: "Kunne ikke koble til serveren.",
        color: "red",
      });
    }
  };

  // --- HANDLER: SLETT BRUKER ---
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);

    try {
      const res = await agentInternal.post("/api/admin/users/delete", {
        userId: deleteTarget.userId,
      });

      if (res.ok) {
        notifications.show({
          title: "Bruker slettet",
          message: `Brukeren ${deleteTarget.email} har blitt permanent slettet.`,
          color: "red",
        });
        setDeleteTarget(null);
        onRefreshNeeded();
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Sletting mislyktes",
          message: errorData.message || "Kunne ikke slette brukeren.",
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
      setActionLoading(false);
    }
  };

  // --- HANDLER: SLETT OG SVARTELIST BRUKER ---
  const handleDeleteAndBlacklistUser = async () => {
    if (!blacklistTarget) return;
    setActionLoading(true);

    try {
      const res = await agentInternal.post("/api/admin/users/delete-and-blacklist", {
        userId: blacklistTarget.userId,
        reason: blacklistReason || "Slettet og svartelistet av administrator.",
      });

      if (res.ok) {
        notifications.show({
          title: "Bruker slettet og svartelistet",
          message: `Brukeren ${blacklistTarget.email} er slettet og e-posten er svartelistet.`,
          color: "red",
        });
        setBlacklistTarget(null);
        setBlacklistReason("");
        onRefreshNeeded();
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Handling mislyktes",
          message: errorData.message || "Kunne ikke slette og svarteliste brukeren.",
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
      setActionLoading(false);
    }
  };

  return (
    <>
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Bruker</Table.Th>
            <Table.Th>Rolle</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>E-post status</Table.Th>
            <Table.Th>Opprettet</Table.Th>
            <Table.Th style={{ width: 60 }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6} style={{ textAlign: "center", padding: "30px" }}>
                <Text c="dimmed">Ingen brukere funnet for dette søket.</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            users.map((user) => (
              <Table.Tr key={user.userId}>
                {/* Navn & E-post */}
                <Table.Td>
                  <Group gap="sm">
                    <Avatar
                      color={user.role.toLowerCase() === "admin" ? "violet" : "teal"}
                      radius="xl"
                    >
                      {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "U"}
                    </Avatar>
                    <div>
                      <Group gap={6} align="center">
                        <Text
                          size="sm"
                          fw={600}
                          style={{ cursor: "pointer" }}
                          onClick={() => router.push(`/admin/users/${user.userId}`)}
                        >
                          {user.fullName || "Navnløs bruker"}
                        </Text>
                        {user.isGoogleAccount && (
                          <Image
                            src="/icons/google.svg"
                            alt="Google"
                            width={12}
                            height={12}
                          />
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {user.email}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>

                {/* Rolle */}
                <Table.Td>
                  <Badge
                    color={user.role.toLowerCase() === "admin" ? "violet" : "gray"}
                    variant="light"
                    leftSection={
                      user.role.toLowerCase() === "admin" ? (
                        <IconShield size={12} />
                      ) : undefined
                    }
                  >
                    {user.role.toUpperCase()}
                  </Badge>
                </Table.Td>

                {/* Konto status (Aktiv / Låst) */}
                <Table.Td>
                  <Badge
                    color={user.isLocked ? "red" : "green"}
                    variant="dot"
                  >
                    {user.isLocked ? "Låst" : "Aktiv"}
                  </Badge>
                </Table.Td>

                {/* E-post bekreftet status */}
                <Table.Td>
                  <Badge
                    color={user.isEmailConfirmed ? "teal" : "orange"}
                    variant="subtle"
                  >
                    {user.isEmailConfirmed ? "Bekreftet" : "Ubekreftet"}
                  </Badge>
                </Table.Td>

                {/* Opprettet dato */}
                <Table.Td>
                  <Text size="sm">{formatDate(user.createdAt)}</Text>
                </Table.Td>

                {/* Handlingsmeny */}
                <Table.Td>
                  <Menu position="bottom-end" shadow="md" width={220}>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>Sider & Detaljer</Menu.Label>
                      <Menu.Item
                        leftSection={<IconUser size={14} />}
                        onClick={() => router.push(`/admin/users/${user.userId}`)}
                      >
                        Åpne detaljside
                      </Menu.Item>

                      <Menu.Divider />
                      <Menu.Label>Administrer</Menu.Label>

                      {!user.isEmailConfirmed && (
                        <Menu.Item
                          leftSection={<IconMailCheck size={14} />}
                          onClick={() => handleResendConfirmation(user)}
                        >
                          Send bekreftelse på nytt
                        </Menu.Item>
                      )}

                      <Menu.Item
                        leftSection={<IconKey size={14} />}
                        onClick={() => handleResetPassword(user)}
                      >
                        Send passord-reset
                      </Menu.Item>

                      {user.isLocked ? (
                        <Menu.Item
                          leftSection={<IconLockOpen size={14} />}
                          color="green"
                          onClick={() => handleUnlockUser(user)}
                        >
                          Lås opp konto
                        </Menu.Item>
                      ) : (
                        <Menu.Item
                          leftSection={<IconLock size={14} />}
                          color="orange"
                          onClick={() => setLockTarget(user)}
                        >
                          Lås konto
                        </Menu.Item>
                      )}

                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => setDeleteTarget(user)}
                      >
                        Slett bruker
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconUserOff size={14} />}
                        color="red"
                        onClick={() => setBlacklistTarget(user)}
                      >
                        Slett & Svartelist
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      {/* MODAL: LÅS BRUKER */}
      <Modal
        opened={!!lockTarget}
        onClose={() => setLockTarget(null)}
        title={`Sperr konto: ${lockTarget?.email}`}
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Når du låser denne kontoen vil brukeren bli utestengt fra innlogging inntil sperren oppheves.
          </Text>

          <Textarea
            label="Begrunnelse for sperring (valgfri)"
            placeholder="Skriv inn årsaken her..."
            value={lockReason}
            onChange={(e) => setLockReason(e.currentTarget.value)}
            rows={3}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setLockTarget(null)}>
              Avbryt
            </Button>

            <Button
              color="orange"
              onClick={handleLockUser}
              loading={actionLoading}
            >
              Bekreft sperring
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL: SLETT BRUKER */}
      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Bekreft permanent sletting"
        centered
      >
        <Stack gap="md">
          <Group gap="xs" c="red">
            <IconAlertTriangle size={24} />
            <Text fw={600}>Advarsel: Denne handlingen kan ikke angres!</Text>
          </Group>

          <Text size="sm">
            Er du sikker på at du vil slette brukerkontoen til{" "}
            <b>{deleteTarget?.email}</b>? Alle tilknyttede brukerdata vil også bli oppryddet.
          </Text>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setDeleteTarget(null)}>
              Avbryt
            </Button>

            <Button
              color="red"
              onClick={handleDeleteUser}
              loading={actionLoading}
            >
              Slett bruker
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL: SLETT OG SVARTELIST BRUKER */}
      <Modal
        opened={!!blacklistTarget}
        onClose={() => setBlacklistTarget(null)}
        title="Bekreft sletting og svartelisting"
        centered
      >
        <Stack gap="md">
          <Group gap="xs" c="red">
            <IconAlertTriangle size={24} />
            <Text fw={600}>Advarsel: Sletting og permanent utestengelse!</Text>
          </Group>

          <Text size="sm">
            Er du sikker på at du vil slette kontoen til <b>{blacklistTarget?.email}</b> OG legge e-posten inn i svartelisten?
          </Text>

          <Textarea
            label="Begrunnelse for svartelisting (valgfri)"
            placeholder="Skriv inn årsaken for vedtaket..."
            value={blacklistReason}
            onChange={(e) => setBlacklistReason(e.currentTarget.value)}
            rows={3}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setBlacklistTarget(null)}>
              Avbryt
            </Button>

            <Button
              color="red"
              onClick={handleDeleteAndBlacklistUser}
              loading={actionLoading}
            >
              Slett & Svartelist
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}