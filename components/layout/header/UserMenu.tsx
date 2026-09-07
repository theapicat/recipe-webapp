"use client";

import { useSession } from "@/lib/session/SessionProvider";
import { agentInternal } from "@/lib/agent/agentInternal";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconSettings,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";

export const UserMenu = () => {
  const session = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await agentInternal.post("/api/auth/logout", {});
      if (res.ok) {
        session.setUser(undefined); // Tømmer automatisk både user og role i provideren
        router.push("/");
      }
    } catch (error) {
      console.error("Utlogging mislyktes:", error);
    }
  };

  const getInitials = () => {
    if (!session.user) return "K";
    const first = session.user.firstName?.[0] || "";
    const last = session.user.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  const isAdmin = session.role?.toLowerCase() === "admin";

  return (
    <Menu position="bottom-end" shadow="md" width={220} radius="md">
      <Menu.Target>
        <UnstyledButton style={{ borderRadius: "50%" }}>
          <Avatar
            color="sage"
            radius="xl"
            size="md"
          >
            {getInitials()}
          </Avatar>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Group gap="xs">
            <Text size="xs" fw={600} truncate>
              {session.user?.firstName} {session.user?.lastName}
            </Text>
            {isAdmin && (
              <Badge color="terracotta" variant="light" size="xs">
                Admin
              </Badge>
            )}
          </Group>
        </Menu.Label>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconSettings size={16} />}
          component={Link}
          href="/user/settings"
        >
          Innstillinger
        </Menu.Item>

        <Menu.Item
          leftSection={<IconUser size={16} />}
          component={Link}
          href="/user/profile"
        >
          Profil
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
        >
          Logg ut
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};