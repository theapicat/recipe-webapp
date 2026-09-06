"use client";

import { Card, Group, Avatar, Text, Badge } from "@mantine/core";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";

interface Props {
  user: AdminUserListItem;
}

export function AdminUserCard({ user }: Props) {
  return (
    <Card withBorder radius="md" p="sm" bg="var(--mantine-color-gray-0)">
      <Group justify="space-between" align="center" wrap="wrap">
        <Group gap="sm">
          <Avatar
            color={user.role.toLowerCase() === "admin" ? "violet" : "teal"}
            radius="xl"
          >
            {user.fullName
              ? user.fullName.substring(0, 2).toUpperCase()
              : "U"}
          </Avatar>

          <div>
            <Text size="sm" fw={600}>
              {user.fullName || "Navnløs bruker"}
            </Text>
            <Text size="xs" c="dimmed">
              {user.email}
            </Text>
          </div>
        </Group>

        <Group gap={6}>
          <Badge
            color={user.isLocked ? "red" : "green"}
            variant="dot"
            size="xs"
          >
            {user.isLocked ? "Låst" : "Aktiv"}
          </Badge>

          <Badge
            color={user.isEmailConfirmed ? "teal" : "orange"}
            variant="subtle"
            size="xs"
          >
            {user.isEmailConfirmed ? "Bekreftet" : "Ubekreftet"}
          </Badge>
        </Group>
      </Group>
    </Card>
  );
}