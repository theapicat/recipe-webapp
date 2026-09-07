"use client";

import Image from "next/image";
import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Grid,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import {
  IconShield,
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
  IconId,
  IconMailCheck,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { useSession } from "@/lib/session/SessionProvider";
import { ProfileEditForm } from "@/components/forms/auth/ProfileEditForm";
import { ChangePasswordForm } from "@/components/forms/auth/ChangePasswordForm";
import { DeleteAccountForm } from "@/components/forms/auth/DeleteAccountForm";
import { ResendConfirmationForm } from "@/components/forms/auth/ResendConfirmationForm";

export default function UserProfilePage() {
  const { user } = useSession();

  // Hjelpefunksjon for å formattere ISO-datoer
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Aldri";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <AsyncMainContainer size="sm" py={30}>
      <Stack gap="xl">
        {/* SIDETITTEL OG BRUKERSUMMERING */}
        <div>
          <Group justify="space-between" align="center">
            <Title order={2}>Min Profil</Title>
            {user?.role && (
              <Badge
                color={user.role.toLowerCase() === "admin" ? "terracotta" : "sage"}
                variant="light"
                size="lg"
                leftSection={<IconShield size={14} />}
              >
                Rolle: {user.role.toUpperCase()}
              </Badge>
            )}
          </Group>
          <Text c="dimmed" size="sm">
            Administrer dine personopplysninger, sikkerhet og kontoinnstillinger.
          </Text>
        </div>

        {/* 0. KONTO METADATA & PERSONDATA */}
        <Paper p="lg" radius="md" withBorder shadow="xs">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Text fw={600} size="md">
                Konto & Persondata
              </Text>
              {user?.isGoogleAccount && (
                <Badge
                  variant="outline"
                  color="gray"
                  leftSection={
                    <Image
                      src="/icons/google.svg"
                      alt="Google logo"
                      width={14}
                      height={14}
                    />
                  }
                >
                  Innkoblet med Google
                </Badge>
              )}
            </Group>

            <Grid>
              {/* Opprettet dato */}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs">
                  <ThemeIcon color="sage" variant="light" size="md">
                    <IconCalendar size={18} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">
                      Konto opprettet
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatDate(user?.createdAt)}
                    </Text>
                  </div>
                </Group>
              </Grid.Col>

              {/* Siste innlogging */}
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs">
                  <ThemeIcon color="sage" variant="light" size="md">
                    <IconClock size={18} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">
                      Siste innlogging
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatDate(user?.lastLoginAt)}
                    </Text>
                  </div>
                </Group>
              </Grid.Col>
            </Grid>

            <Divider my="xs" />

            {/* Ekstra status- og ID-metadata */}
            <Group gap="xs" wrap="wrap">
              <Badge
                variant="light"
                color="gray"
                leftSection={<IconId size={12} />}
              >
                ID: {user?.userId || "N/A"}
              </Badge>

              <Badge
                variant="light"
                color={user?.isEmailConfirmed ? "sage" : "terracotta"}
                leftSection={<IconMailCheck size={12} />}
              >
                E-post: {user?.isEmailConfirmed ? "Bekreftet" : "Ubekreftet"}
              </Badge>

              <Badge
                variant="light"
                color={user?.welcomeCompleted ? "sage" : "gray"}
                leftSection={
                  user?.welcomeCompleted ? (
                    <IconCheck size={12} />
                  ) : (
                    <IconX size={12} />
                  )
                }
              >
                Velkomstreise: {user?.welcomeCompleted ? "Fullført" : "Ikke fullført"}
              </Badge>
            </Group>

            {user?.isGoogleAccount && (
              <Text size="xs" c="dimmed" mt={2}>
                💡 Din konto er opprettet via Google OAuth. Du kan fritt opprette et lokalt passord i skjemaet under dersom du også ønsker å logge inn med e-post og passord.
              </Text>
            )}
          </Stack>
        </Paper>

        {/* 1. E-postbekreftelsesvarsel (vises kun om isEmailConfirmed === false) */}
        <ResendConfirmationForm />

        {/* 2. Personalia */}
        <ProfileEditForm />

        {/* 3. Passord */}
        <ChangePasswordForm />

        {/* 4. Slett konto */}
        <DeleteAccountForm />
      </Stack>
    </AsyncMainContainer>
  );
}