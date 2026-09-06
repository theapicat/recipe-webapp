"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Paper,
  Title,
  Text,
  Group,
  Button,
  Modal,
  Textarea,
  Stack,
  Divider,
} from "@mantine/core";
import {
  IconLock,
  IconLockOpen,
  IconMailCheck,
  IconKey,
  IconTrash,
  IconAlertTriangle,
  IconUserOff,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserDetails } from "@/lib/models/admin/users/AdminUserDetails";

interface Props {
  user: AdminUserDetails;
  onRefreshNeeded: () => void;
}

export function AdminUserActionPanel({ user, onRefreshNeeded }: Props) {
  const router = useRouter();

  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockReason, setLockReason] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [blacklistModalOpen, setBlacklistModalOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");

  const [loading, setLoading] = useState(false);

  // --- LÅS BRUKER ---
  const handleLock = async () => {
    setLoading(true);
    try {
      const res = await agentInternal.post("/api/admin/users/lock", {
        userId: user.userId,
        reasonDetails: lockReason || "Sperret manuelt av administrator.",
      });

      if (res.ok) {
        notifications.show({
          title: "Bruker sperret",
          message: `Kontoen til ${user.email} har blitt sperret.`,
          color: "orange",
        });
        setLockModalOpen(false);
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
      setLoading(false);
    }
  };

  // --- GJENÅPNE BRUKER ---
  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await agentInternal.post("/api/admin/users/unlock", {
        userId: user.userId,
      });

      if (res.ok) {
        notifications.show({
          title: "Konto gjenåpnet",
          message: `Sperren for ${user.email} er fjernet.`,
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
    } finally {
      setLoading(false);
    }
  };

  // --- MANUELL E-POSTBEKREFTELSE ---
  const handleConfirmEmailManually = async () => {
    setLoading(true);
    try {
      const res = await agentInternal.post("/api/admin/users/confirm-email", {
        userId: user.userId,
      });

      if (res.ok) {
        notifications.show({
          title: "E-post bekreftet",
          message: `E-posten til ${user.email} er nå bekreftet.`,
          color: "teal",
        });
        onRefreshNeeded();
      } else {
        const errorData = await res.json().catch(() => ({}));
        notifications.show({
          title: "Handling mislyktes",
          message: errorData.message || "Kunne ikke bekrefte e-posten.",
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
      setLoading(false);
    }
  };

  // --- SEND BEKREFTELSESE-POST ---
  const handleResendConfirmation = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // --- SEND PASSORD-RESET ---
  const handleResetPassword = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // --- SLETT BRUKER ---
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await agentInternal.post("/api/admin/users/delete", {
        userId: user.userId,
      });

      if (res.ok) {
        notifications.show({
          title: "Bruker slettet",
          message: `Brukeren ${user.email} har blitt permanent slettet.`,
          color: "red",
        });
        router.push("/admin/users");
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
      setLoading(false);
    }
  };

  // --- SLETT OG SVARTELIST BRUKER ---
  const handleDeleteAndBlacklist = async () => {
    setLoading(true);
    try {
      const res = await agentInternal.post("/api/admin/users/delete-and-blacklist", {
        userId: user.userId,
        reason: blacklistReason || "Slettet og svartelistet av administrator pga. brudd på brukervilkår.",
      });

      if (res.ok) {
        notifications.show({
          title: "Bruker slettet og svartelistet",
          message: `Brukeren ${user.email} ble slettet og e-posten er svartelistet.`,
          color: "red",
        });
        router.push("/admin/users");
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
      setLoading(false);
    }
  };

  return (
    <Paper p="lg" radius="md" withBorder shadow="xs">
      <Stack gap="md">
        <div>
          <Title order={4}>⚡ Administrative Handlinger</Title>
          <Text size="sm" c="dimmed">
            Utfør support- eller kontotiltak på denne brukeren
          </Text>
        </div>

        <Group gap="sm" wrap="wrap">
          {!user.isEmailConfirmed && (
            <Button
              variant="light"
              color="teal"
              leftSection={<IconMailCheck size={16} />}
              onClick={handleConfirmEmailManually}
              loading={loading}
            >
              Overstyr & Bekreft e-post
            </Button>
          )}

          {!user.isEmailConfirmed && (
            <Button
              variant="outline"
              color="blue"
              leftSection={<IconMailCheck size={16} />}
              onClick={handleResendConfirmation}
              loading={loading}
            >
              Send ny bekreftelsese-post
            </Button>
          )}

          <Button
            variant="outline"
            color="gray"
            leftSection={<IconKey size={16} />}
            onClick={handleResetPassword}
            loading={loading}
          >
            Send passord-reset
          </Button>

          {user.isLocked ? (
            <Button
              color="green"
              leftSection={<IconLockOpen size={16} />}
              onClick={handleUnlock}
              loading={loading}
            >
              Lås opp konto
            </Button>
          ) : (
            <Button
              color="orange"
              leftSection={<IconLock size={16} />}
              onClick={() => setLockModalOpen(true)}
              loading={loading}
            >
              Lås konto
            </Button>
          )}
        </Group>

        <Divider my="xs" />

        <Group justify="space-between" align="center" wrap="wrap">
          <div>
            <Text fw={600} size="sm" c="red">
              Faresone
            </Text>
            <Text size="xs" c="dimmed">
              Sletting fjerner kontoen permanent. Svartelisting forhindrer også ny registrering.
            </Text>
          </div>

          <Group gap="sm">
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Slett bruker
            </Button>

            <Button
              color="red"
              variant="filled"
              leftSection={<IconUserOff size={16} />}
              onClick={() => setBlacklistModalOpen(true)}
            >
              Slett & Svartelist
            </Button>
          </Group>
        </Group>
      </Stack>

      {/* MODAL: LÅS BRUKER */}
      <Modal
        opened={lockModalOpen}
        onClose={() => setLockModalOpen(false)}
        title={`Sperr konto: ${user.email}`}
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Når du låser denne kontoen vil brukeren bli utestengt fra innlogging.
          </Text>

          <Textarea
            label="Begrunnelse for sperring (valgfri)"
            placeholder="Skriv inn årsaken her..."
            value={lockReason}
            onChange={(e) => setLockReason(e.currentTarget.value)}
            rows={3}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setLockModalOpen(false)}>
              Avbryt
            </Button>
            <Button color="orange" onClick={handleLock} loading={loading}>
              Bekreft sperring
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL: SLETT BRUKER */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Bekreft permanent sletting"
        centered
      >
        <Stack gap="md">
          <Group gap="xs" c="red">
            <IconAlertTriangle size={24} />
            <Text fw={600}>Advarsel: Kan ikke angres!</Text>
          </Group>

          <Text size="sm">
            Er du sikker på at du vil slette kontoen til <b>{user.email}</b>?
          </Text>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Avbryt
            </Button>
            <Button color="red" onClick={handleDelete} loading={loading}>
              Slett bruker
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL: SLETT OG SVARTELIST BRUKER */}
      <Modal
        opened={blacklistModalOpen}
        onClose={() => setBlacklistModalOpen(false)}
        title="Bekreft sletting og svartelisting"
        centered
      >
        <Stack gap="md">
          <Group gap="xs" c="red">
            <IconAlertTriangle size={24} />
            <Text fw={600}>Advarsel: Sletting og utestengelse!</Text>
          </Group>

          <Text size="sm">
            Er du sikker på at du vil slette kontoen til <b>{user.email}</b> permanent OG legge e-postadressen inn i svartelisten? Brukeren vil bli varslet via e-post og utestengt fra å registrere seg på nytt.
          </Text>

          <Textarea
            label="Begrunnelse for svartelisting (valgfri)"
            placeholder="Skriv inn årsaken for vedtaket..."
            value={blacklistReason}
            onChange={(e) => setBlacklistReason(e.currentTarget.value)}
            rows={3}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setBlacklistModalOpen(false)}>
              Avbryt
            </Button>
            <Button color="red" onClick={handleDeleteAndBlacklist} loading={loading}>
              Slett & Svartelist
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}