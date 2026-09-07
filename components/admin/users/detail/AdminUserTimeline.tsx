"use client";

import { Paper, Title, Text, Timeline, Alert, ThemeIcon } from "@mantine/core";
import {
  IconCalendar,
  IconClock,
  IconMailCheck,
  IconUserExclamation,
  IconUserX,
  IconInfoCircle,
  IconLock,
} from "@tabler/icons-react";
import { AdminUserDetails } from "@/lib/models/admin/users/AdminUserDetails";

interface Props {
  user: AdminUserDetails;
}

export function AdminUserTimeline({ user }: Props) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Ikke inntruffet";
    return new Intl.DateTimeFormat("no-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <Paper p="lg" radius="md" withBorder shadow="xs">
      <Title order={4} mb="md">
        🕒 Kontolivssyklus & Tidslinje
      </Title>

      {user.isLocked && user.lockoutReasonDetails && (
        <Alert
          color="terracotta"
          title={`Konto sperret (${user.lockoutReason})`}
          icon={<IconInfoCircle size={18} />}
          mb="lg"
          radius="md"
        >
          {user.lockoutReasonDetails}
        </Alert>
      )}

      <Timeline active={user.isEmailConfirmed ? 1 : 0} bulletSize={24} lineWidth={2}>
        {/* Opprettet */}
        <Timeline.Item
          bullet={
            <ThemeIcon color="sage" size={24} radius="xl">
              <IconCalendar size={14} />
            </ThemeIcon>
          }
          title="Konto Opprettet"
        >
          <Text c="dimmed" size="xs">
            {formatDate(user.createdAt)}
          </Text>
        </Timeline.Item>

        {/* Siste innlogging */}
        <Timeline.Item
          bullet={
            <ThemeIcon color="sage" size={24} radius="xl">
              <IconClock size={14} />
            </ThemeIcon>
          }
          title="Siste Innlogging"
        >
          <Text c="dimmed" size="xs">
            {formatDate(user.lastLoginAt)}
          </Text>
        </Timeline.Item>

        {/* 7 dagers bekreftelsespåminnelse */}
        <Timeline.Item
          bullet={
            <ThemeIcon
              color={user.confirmation7DaysReminderSentAt ? "terracotta" : "gray"}
              size={24}
              radius="xl"
            >
              <IconMailCheck size={14} />
            </ThemeIcon>
          }
          title="7 Dagers Bekreftelsespåminnelse"
        >
          <Text c="dimmed" size="xs">
            {formatDate(user.confirmation7DaysReminderSentAt)}
          </Text>
        </Timeline.Item>

        {/* 14 dagers sperring for ubekreftet e-post */}
        <Timeline.Item
          bullet={
            <ThemeIcon
              color={user.confirmation14DaysLockedSentAt ? "red" : "gray"}
              size={24}
              radius="xl"
            >
              <IconLock size={14} />
            </ThemeIcon>
          }
          title="14 Dagers E-postsperring"
        >
          <Text c="dimmed" size="xs">
            {formatDate(user.confirmation14DaysLockedSentAt)}
          </Text>
        </Timeline.Item>

        {/* 6 måneders inaktivitetsvarsel */}
        <Timeline.Item
          bullet={
            <ThemeIcon
              color={user.inactivityWarning6MonthsSentAt ? "terracotta" : "gray"}
              size={24}
              radius="xl"
            >
              <IconUserExclamation size={14} />
            </ThemeIcon>
          }
          title="6 Måneders Inaktivitetsvarsel"
        >
          <Text c="dimmed" size="xs">
            {formatDate(user.inactivityWarning6MonthsSentAt)}
          </Text>
        </Timeline.Item>

        {/* 1 års inaktivitetssperring */}
        <Timeline.Item
          bullet={
            <ThemeIcon
              color={user.inactivity1YearLockedSentAt ? "red" : "gray"}
              size={24}
              radius="xl"
            >
              <IconUserX size={14} />
            </ThemeIcon>
          }
          title="1 Års Inaktivitetssperring"
        >
          <Text c="dimmed" size="xs">
            {formatDate(user.inactivity1YearLockedSentAt)}
          </Text>
        </Timeline.Item>
      </Timeline>
    </Paper>
  );
}