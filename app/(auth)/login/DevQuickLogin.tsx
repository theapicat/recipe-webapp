import { Menu, Button, Text } from "@mantine/core";
import { DEV_USERS } from "@/app/(auth)/login/userData";

interface DevQuickLoginProps {
  onSelect: (email: string, password?: string) => void;
}

export const DevQuickLogin = ({ onSelect }: DevQuickLoginProps) => {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <Menu shadow="md" width={280}>
      <Menu.Target>
        <Button variant="outline" color="gray" size="xs">
          ⚡ Hurtiginnlogging (Dev)
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Velg testbruker</Menu.Label>
        {Object.entries(DEV_USERS).map(([key, user]) => (
          <Menu.Item
            key={key}
            onClick={() => onSelect(user.credentials.email, user.credentials.password)}
          >
            <Text size="sm" fw={500}>
              {user.label}
            </Text>
            <Text size="xs" c="dimmed">
              {user.description}
            </Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};