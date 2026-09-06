"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  Alert,
  ThemeIcon,
  List,
  Divider,
  SimpleGrid,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconMailCheck,
  IconAlertTriangle,
  IconArrowRight,
  IconSend,
  IconCheck,
  IconClock,
  IconLock,
  IconBook,
  IconFridge,
  IconCalendarCheck,
  IconSparkles,
  IconShieldCheck,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { useSession } from "@/lib/session/SessionProvider";
import { agentInternal } from "@/lib/agent/agentInternal";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";

export default function WelcomePage() {
  const router = useRouter();
  const { user, setUser } = useSession();

  const [resendingEmail, setResendingEmail] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Refs for å sikre at logikken kun kjører én gang
  const hasHandledWelcomeRef = useRef(false);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    if (hasHandledWelcomeRef.current) return;
    hasHandledWelcomeRef.current = true;

    // 1. Hvis brukeren allerede har fullført velkomsten tidligere, send til dashboard
    if (user.welcomeCompleted) {
      isRedirectingRef.current = true;
      router.replace("/dashboard");
      return;
    }

    // 2. Marker velkomst som fullført i databasen
    agentInternal
      .get("/api/auth/complete-welcome")
      .then(async (res) => {
        if (res.ok) {
          const updatedUser = (await res.json()) as UserProfileResponse;
          setUser(updatedUser);
        }
      })
      .catch((err) => {
        console.error("Kunne ikke merke velkomst som fullført:", err);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [user, router, setUser]);

  const handleProceedToDashboard = () => {
    router.push("/dashboard");
  };

  const handleResendConfirmation = async () => {
    setResendingEmail(true);

    try {
      const res = await agentInternal.post("/api/auth/resend-confirmation", {
        email: user?.email,
      });

      if (res.ok) {
        notifications.show({
          title: "Bekreftelseslenke sendt!",
          message: "Sjekk innboksen din (og ev. søppelpost).",
          color: "teal",
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: "Feil ved utsending",
          message: "Kunne ikke sende bekreftelses-epost. Prøv igjen om litt.",
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
      setResendingEmail(false);
    }
  };

  const isLoading = !user || isRedirectingRef.current || isInitializing;
  const isEmailConfirmed = user?.isEmailConfirmed ?? false;

  return (
    <AsyncMainContainer size="md" py={40} loading={isLoading}>
      {!isLoading && user && (
        <Stack gap="xl">
          {/* TOPPSEKSJON / HERO */}
          <Paper
            p="xl"
            radius="md"
            withBorder
            bg="teal.0"
            style={{ borderColor: "var(--mantine-color-teal-3)" }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group gap="xs">
                  <Badge color="teal" variant="filled" size="sm">
                    {isEmailConfirmed ? "Konto klar" : "Nesten i mål"}
                  </Badge>
                </Group>
                <Title order={1} size="h2" c="teal.9">
                  Velkommen til Kjøkkenhylla, {user.firstName || "kokk"}! 🍳
                </Title>
                <Text size="sm" c="teal.9">
                  {isEmailConfirmed
                    ? "Kontoen din er bekreftet og klar! Du har nå tilgang til din helt egne, digitale og støyfrie kokebok."
                    : "Kontoen din er opprettet. For å holde plattformen trygg og fri for inaktive brukere, ber vi deg bekrefte e-postadressen din."}
                </Text>
              </Stack>
              <ThemeIcon color="teal" size={60} radius="xl">
                {isEmailConfirmed ? <IconSparkles size={36} /> : <IconMailCheck size={36} />}
              </ThemeIcon>
            </Group>
          </Paper>

          {/* DERSOM BRUKEREN IKKE ER BEKREFTET (STANDARD BRUKER) */}
          {!isEmailConfirmed && (
            <Paper p="lg" radius="md" withBorder shadow="xs">
              <Stack gap="md">
                <Group gap="xs">
                  <IconClock size={22} color="var(--mantine-color-orange-6)" />
                  <Title order={3} size="h4">
                    Viktig om bekreftelse av konto (`{user.email}`)
                  </Title>
                </Group>

                <Divider />

                <Alert color="orange" icon={<IconAlertTriangle size={20} />} radius="md">
                  Vi har nylig sendt en aktiveringslenke til <b>{user.email}</b>. Klikk på lenken i e-posten for å bekrefte kontoen din.
                </Alert>

                <Text size="sm" fw={600} mt="xs">
                  Tidsfrister for ubekreftede kontoer:
                </Text>
                <List
                  spacing="sm"
                  size="sm"
                  center
                  icon={
                    <ThemeIcon color="orange" size={20} radius="xl" variant="light">
                      <IconClock size={12} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>
                    <b>Påminnelse (1 uke):</b> Du mottar en e-postpåminnelse om du ikke har bekreftet kontoen din innen 7 dager.
                  </List.Item>
                  <List.Item>
                    <b>Konto låses (2 uker):</b> Kontoer som ikke er bekreftet innen 14 dager blir automatisk sperret for innlogging.
                  </List.Item>
                  <List.Item>
                    <b>Sletting (1 måned):</b> Sperrede kontoer som ikke bekreftes slettes permanent fra databasen etter 30 dager.
                  </List.Item>
                </List>

                <Divider mt="sm" />

                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                  <Text size="xs" c="dimmed">
                    Finner du ikke e-posten? Sjekk søppelpost-mappen din.
                  </Text>
                  <Button
                    variant="outline"
                    color="gray"
                    leftSection={<IconSend size={16} />}
                    onClick={handleResendConfirmation}
                    loading={resendingEmail}
                  >
                    Send ny e-post
                  </Button>
                </Group>
              </Stack>
            </Paper>
          )}

          {/* INTRODUKSJON TIL FUNKSJONER PÅ KJØKKENHYLLA */}
          <Stack gap="md">
            <div>
              <Title order={2} size="h3" mb={4}>
                Hva kan du gjøre på Kjøkkenhylla?
              </Title>
              <Text size="sm" c="dimmed">
                Her er fire smarte verktøy som hjelper deg med å organisere måltidene i hverdagen:
              </Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Paper p="lg" radius="md" withBorder shadow="xs">
                <ThemeIcon color="teal" variant="light" size={42} radius="md" mb="sm">
                  <IconBook size={24} />
                </ThemeIcon>
                <Text fw={600} size="md" mb={4}>
                  Din egen samling
                </Text>
                <Text size="sm" c="dimmed" lh={1.5}>
                  Bygg din egen kokebok ved å hente oppskrifter fra favorittsidene dine på nett, opprette egne retter eller ta imot oppskrifter fra venner.
                </Text>
              </Paper>

              <Paper p="lg" radius="md" withBorder shadow="xs">
                <ThemeIcon color="teal" variant="light" size={42} radius="md" mb="sm">
                  <IconFridge size={24} />
                </ThemeIcon>
                <Text fw={600} size="md" mb={4}>
                  Tøm kjøleskapet
                </Text>
                <Text size="sm" c="dimmed" lh={1.5}>
                  Søk etter oppskrifter i din samling basert på råvarene du allerede har liggende for å redusere matsvinn og spare penger.
                </Text>
              </Paper>

              <Paper p="lg" radius="md" withBorder shadow="xs">
                <ThemeIcon color="teal" variant="light" size={42} radius="md" mb="sm">
                  <IconCalendarCheck size={24} />
                </ThemeIcon>
                <Text fw={600} size="md" mb={4}>
                  Ukesmeny & Handleliste
                </Text>
                <Text size="sm" c="dimmed" lh={1.5}>
                  Sett sammen en visuell ukesmeny fra mandag til søndag, og la appen automatisk generere en sammenslått handleliste for deg.
                </Text>
              </Paper>

              <Paper p="lg" radius="md" withBorder shadow="xs">
                <ThemeIcon color="teal" variant="light" size={42} radius="md" mb="sm">
                  <IconShieldCheck size={24} />
                </ThemeIcon>
                <Text fw={600} size="md" mb={4}>
                  100 % Privat & Støyfritt
                </Text>
                <Text size="sm" c="dimmed" lh={1.5}>
                  Ingen offentlige vurderinger, kommentarer eller algoritmer. Kjøkkenhylla er et personlig og støyfritt verktøy kun for deg.
                </Text>
              </Paper>
            </SimpleGrid>
          </Stack>

          {/* GENERELL INFORMASJON OM INAKTIVITET (FOR BEKREFTEDE BRUKERE) */}
          {isEmailConfirmed && (
            <Paper p="md" radius="md" withBorder bg="gray.0">
              <Group gap="xs">
                <IconLock size={18} color="var(--mantine-color-gray-7)" />
                <Text size="xs" c="dimmed">
                  <b>Personvern & inaktivitet:</b> Kontoer som er inaktive i over 1 år sperres og slettes automatisk for å beskytte dine personopplysninger.
                </Text>
              </Group>
            </Paper>
          )}

          {/* HOVEDKNAPP :: GÅ TIL DASHBOARD */}
          <Paper p="md" radius="md" withBorder shadow="xs" bg="teal.0" style={{ borderColor: "var(--mantine-color-teal-2)" }}>
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
              <div>
                <Text fw={600} size="sm" c="teal.9">
                  Klar til å sette i gang?
                </Text>
                <Text size="xs" c="teal.8">
                  Gå direkte til din personlige oversikt og start oppbyggingen av din kokebok.
                </Text>
              </div>

              <Button
                color="teal"
                size="md"
                rightSection={<IconArrowRight size={18} />}
                onClick={handleProceedToDashboard}
              >
                Gå til min oversikt
              </Button>
            </Group>
          </Paper>
        </Stack>
      )}
    </AsyncMainContainer>
  );
}