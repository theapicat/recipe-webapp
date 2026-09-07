"use client";

import { useState } from "react";
import { Paper, Stack, Group, Title, Text, Button, Alert } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconSend, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { useSession } from "@/lib/session/SessionProvider";
import { agentInternal } from "@/lib/agent/agentInternal";

export const ResendConfirmationForm = () => {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);

  // Hvis brukeren allerede har bekreftet e-posten, rendres ingenting
  if (!user || user.isEmailConfirmed) {
    return null;
  }

  const handleResend = async () => {
    setLoading(true);

    try {
      const res = await agentInternal.post("/api/auth/resend-confirmation", {});
      const data = await res.json();

      if (res.ok) {
        notifications.show({
          title: "Bekreftelseslenke sendt!",
          message: data.message || `En ny e-post har blitt sendt til ${user.email}.`,
          color: "sage",
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: "Feil ved utsending",
          message: data.message || "Kunne ikke sende bekreftelses-epost. Prøv igjen om litt.",
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Nettverksfeil",
        message: "Kunne ikke koble til serveren. Vennligst prøv igjen senere.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          <IconAlertTriangle size={22} color="var(--mantine-color-terracotta-filled)" />
          <Title order={3} size="h4" c="terracotta">
            Bekreft din e-postadresse
          </Title>
        </Group>

        <Alert color="terracotta" variant="light" radius="md">
          E-postadressen din (<b>{user.email}</b>) er ikke bekreftet ennå. For å holde kontoen din aktiv og forhindre at den sperres etter 14 dager, må e-posten verifiseres.
        </Alert>

        <Text size="sm" c="dimmed">
          Sjekk innboksen din (og eventuelt søppelpost) for aktiveringslenken. Hvis du ikke finner e-posten, kan du be om å få tilsendt en ny ved å trykke på knappen under.
        </Text>

        <Group justify="flex-end">
          <Button
            color="terracotta"
            variant="filled"
            leftSection={<IconSend size={16} />}
            onClick={handleResend}
            loading={loading}
          >
            Send ny bekreftelses-epost
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};