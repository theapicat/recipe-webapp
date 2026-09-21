"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Group, Stack } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";
import { AdminSendEmailForm } from "@/components/admin/users/email/AdminSendEmailForm";

function AdminSendEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUserId = searchParams.get("userId");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);

  // `loading` starter allerede som `true` — ingen andre steder trigger et nytt kall her.
  // NB: bruker en .then()-kjede (ikke async/await) — den nyere react-hooks/set-state-in-effect-
  // regelen flagger setState etter en `await` inni en async-funksjon kalt fra en effekt, men ikke
  // det samme mønsteret som en .then()-kjede.
  const fetchUsers = useCallback(() => {
    agentInternal
      .get<AdminUserListItem[]>("/api/admin/users")
      .then(async (res) => {
        if (res.ok) {
          const responseData = await res.json();
          const items = responseData.body ?? [];
          setUsers(items);
        }
      })
      .catch((err) => {
        console.error("Feil ved henting av brukere:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <AsyncMainContainer size="sm" py={30} loading={loading}>
      <Stack gap="md">
        <Group>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() =>
              preselectedUserId
                ? router.push(`/admin/users/${preselectedUserId}`)
                : router.push("/admin/users")
            }
          >
            Tilbake
          </Button>
        </Group>

        <AdminSendEmailForm users={users} preselectedUserId={preselectedUserId} />
      </Stack>
    </AsyncMainContainer>
  );
}

export default function AdminSendEmailPage() {
  return (
    <Suspense fallback={<AsyncMainContainer size="sm" py={30} loading={true} />}>
      <AdminSendEmailContent />
    </Suspense>
  );
}
