"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paper, Title, Text, Button, Group, Alert, Modal, Stack, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconAlertTriangle, IconLock } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { agentInternal } from "@/lib/agent/agentInternal";
import { useSession } from "@/lib/session/SessionProvider";

export const DeleteAccountForm = () => {
  const router = useRouter();
  const { user, setUser } = useSession();
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const handleDelete = async () => {
    if (isAdmin) return;

    setLoading(true);

    try {
      const res = await agentInternal.delete("/api/auth/deleteProfile");

      if (res.ok) {
        notifications.show({
          title: "Konto slettet",
          message: "Din brukerkonto er nå permanent slettet.",
          color: "sage",
        });
        setUser(undefined);
        close();
        router.push("/login");
      } else {
        const data = await res.json();
        notifications.show({
          title: "Feil ved sletting",
          message: data.message || "Kunne ikke slette kontoen.",
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
    <>
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="md">
          <Group gap="xs">
            <IconAlertTriangle size={22} color="var(--mantine-color-red-filled)" />
            <Title order={3} size="h4" c="red">
              Faresone
            </Title>
          </Group>

          {isAdmin ? (
            <Alert color="gray" icon={<IconLock size={20} />} title="Beskyttet administratorkonto">
              Systemadministratorkontoen er låst mot sletting. Kontakt systemansvarlig dersom du ønsker å gjøre endringer på denne kontoen.
            </Alert>
          ) : (
            <Alert color="red" variant="light" icon={<IconAlertTriangle size={20} />}>
              Sletting av brukerkontoen din vil umiddelbart fjerne alle dine lagrede oppskrifter, ukesmenyer og personlige preferanser. Handlingen er permanent og kan ikke reverseres.
            </Alert>
          )}

          <Group justify="flex-end">
            <Tooltip label={isAdmin ? "Systemadmin kan ikke slettes" : undefined} disabled={!isAdmin}>
              <span>
                <Button
                  color="red"
                  variant="filled"
                  leftSection={isAdmin ? <IconLock size={16} /> : <IconTrash size={16} />}
                  onClick={open}
                  disabled={isAdmin}
                >
                  Slett Min Konto
                </Button>
              </span>
            </Tooltip>
          </Group>
        </Stack>
      </Paper>

      {/* SLETTE-BEKREFTELSE MODAL */}
      <Modal
        opened={opened && !isAdmin}
        onClose={close}
        title="⚠️ Slette brukerkonto?"
        centered
        radius="md"
      >
        <Stack gap="md">
          <Alert color="red" icon={<IconAlertTriangle size={20} />}>
            Er du helt sikker? Alt av data tilknyttet din konto slettes permanent.
          </Alert>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close} disabled={loading}>
              Avbryt
            </Button>
            <Button color="red" onClick={handleDelete} loading={loading}>
              Ja, slett kontoen min
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};