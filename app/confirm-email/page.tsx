"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  Alert,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import {
  IconCheck,
  IconAlertCircle,
  IconArrowRight,
  IconLogin,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { agentInternal } from "@/lib/agent/agentInternal";
import { useSession } from "@/lib/session/SessionProvider";

type Status = "loading" | "success" | "error";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile, updateUser } = useSession();

  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (!userId || !token) {
      setStatus("error");
      setErrorMessage("Ugyldig eller manglende bekreftelseslenke.");
      return;
    }

    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    agentInternal
      .post("/api/auth/confirm-email", { userId, token })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          // Oppdaterer lokalt i state med en gang, og henter deretter fersk profil fra backend
          updateUser({ isEmailConfirmed: true });
          await refreshProfile();
        } else {
          const data = await res.json().catch(() => null);
          setErrorMessage(
            data?.message || "Ugyldig eller utløpt bekreftelseskode."
          );
          setStatus("error");
        }
      })
      .catch((err) => {
        console.error("Feil ved bekreftelse av e-post:", err);
        setErrorMessage("Nettverksfeil. Kunne ikke koble til serveren.");
        setStatus("error");
      });
  }, [userId, token, refreshProfile, updateUser]);

  return (
    <AsyncMainContainer size="sm" py={60} loading={status === "loading"}>
      {status === "success" && (
        <Paper p="xl" radius="md" withBorder shadow="sm">
          <Stack gap="lg" align="center" style={{ textAlign: "center" }}>
            <ThemeIcon color="sage" size={70} radius="xl" variant="light">
              <IconCheck size={40} />
            </ThemeIcon>

            <Stack gap="xs">
              <Title order={1} size="h2">
                E-posten din er bekreftet! 🎉
              </Title>
              <Text size="sm" c="dimmed">
                Takk for at du bekreftet e-postadressen din. Kontoen din er nå fullstendig aktivert og klar til bruk.
              </Text>
            </Stack>

            <Divider my="xs" style={{ width: "100%" }} />

            <Group justify="center">
              <Button
                color="sage"
                size="md"
                rightSection={<IconArrowRight size={18} />}
                onClick={() => router.push("/dashboard")}
              >
                Gå til Min Side
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {status === "error" && (
        <Paper p="xl" radius="md" withBorder shadow="sm">
          <Stack gap="lg">
            <Group align="center" gap="md">
              <ThemeIcon color="red" size={50} radius="xl" variant="light">
                <IconAlertCircle size={30} />
              </ThemeIcon>
              <Stack gap={2}>
                <Title order={2} size="h3">
                  Bekreftelse mislyktes
                </Title>
                <Text size="xs" c="dimmed">
                  Det oppstod et problem med bekreftelseslenken.
                </Text>
              </Stack>
            </Group>

            <Alert color="red" variant="light" radius="md">
              {errorMessage || "Kunne ikke bekrefte e-postadressen."}
            </Alert>

            <Text size="sm" c="dimmed">
              Lenken kan være utløpt, eller e-posten kan allerede være bekreftet. Du kan logge inn for å sjekke din kontostatus eller be om en ny bekreftelseslenke.
            </Text>

            <Divider my="xs" />

            <Group justify="space-between" align="center">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => router.push("/welcome")}
              >
                Tilbake til velkomstsiden
              </Button>

              <Button
                color="sage"
                leftSection={<IconLogin size={18} />}
                onClick={() => router.push("/login")}
              >
                Gå til innlogging
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}
    </AsyncMainContainer>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<AsyncMainContainer size="sm" py={60} loading={true} />}>
      <ConfirmEmailContent />
    </Suspense>
  );
}