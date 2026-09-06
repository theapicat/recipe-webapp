"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Paper, Group, Avatar, Stack, Title, Text, Badge, Button } from "@mantine/core";
import {
  IconArrowLeft,
  IconShield,
  IconMailCheck,
  IconMailOff,
  IconLock,
  IconCheck,
  IconX,
  IconId,
  IconMail,
} from "@tabler/icons-react";
import { AdminUserDetails } from "@/lib/models/admin/users/AdminUserDetails";

interface Props {
  user: AdminUserDetails;
}

export function AdminUserHeader({ user }: Props) {
  const router = useRouter();

  return (
    <Paper p="lg" radius="md" withBorder shadow="xs">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push("/admin/users")}
          >
            Tilbake til brukeroversikt
          </Button>

          <Group gap="sm">
            {user.isGoogleAccount && (
              <Badge
                variant="outline"
                color="gray"
                leftSection={
                  <Image
                    src="/icons/google.svg"
                    alt="Google"
                    width={14}
                    height={14}
                  />
                }
              >
                Innkoblet med Google
              </Badge>
            )}

            <Button
              color="teal"
              leftSection={<IconMail size={16} />}
              onClick={() => router.push(`/admin/users/email?userId=${user.userId}`)}
            >
              Send e-post
            </Button>
          </Group>
        </Group>

        <Group align="center" gap="lg">
          <Avatar
            size={70}
            radius="xl"
            color={user.role.toLowerCase() === "admin" ? "violet" : "teal"}
          >
            {user.firstName && user.lastName
              ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
              : "U"}
          </Avatar>

          <Stack gap={4} style={{ flex: 1 }}>
            <Group align="center" gap="xs">
              <Title order={2}>
                {user.firstName} {user.lastName}
              </Title>
              <Badge
                color={user.role.toLowerCase() === "admin" ? "violet" : "teal"}
                variant="light"
                size="md"
                leftSection={<IconShield size={12} />}
              >
                {user.role.toUpperCase()}
              </Badge>
            </Group>

            <Text size="sm" c="dimmed">
              {user.email}
            </Text>

            <Group gap="xs" mt={4} wrap="wrap">
              <Badge
                variant="light"
                color="gray"
                size="xs"
                leftSection={<IconId size={10} />}
              >
                ID: {user.userId}
              </Badge>

              <Badge
                variant="light"
                color={user.isLocked ? "red" : "green"}
                size="xs"
                leftSection={user.isLocked ? <IconLock size={10} /> : undefined}
              >
                {user.isLocked ? "Sperret konto" : "Aktiv konto"}
              </Badge>

              <Badge
                variant="light"
                color={user.isEmailConfirmed ? "teal" : "orange"}
                size="xs"
                leftSection={
                  user.isEmailConfirmed ? (
                    <IconMailCheck size={10} />
                  ) : (
                    <IconMailOff size={10} />
                  )
                }
              >
                E-post: {user.isEmailConfirmed ? "Bekreftet" : "Ubekreftet"}
              </Badge>

              <Badge
                variant="light"
                color={user.welcomeCompleted ? "blue" : "gray"}
                size="xs"
                leftSection={
                  user.welcomeCompleted ? <IconCheck size={10} /> : <IconX size={10} />
                }
              >
                Velkomstreise: {user.welcomeCompleted ? "Fullført" : "Ufullstendig"}
              </Badge>
            </Group>
          </Stack>
        </Group>
      </Stack>
    </Paper>
  );
}