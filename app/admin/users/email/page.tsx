"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Group, Stack } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";
import {AdminSendEmailForm} from "@/components/admin/users/email/AdminSendEmailForm";

export default function AdminSendEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedUserId = searchParams.get("userId");

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentInternal.get("/api/admin/users");
      if (res.ok) {
        const responseData = await res.json();
        const items = Array.isArray(responseData.body)
          ? responseData.body
          : responseData.body?.items || [];
        setUsers(items);
      }
    } catch (err) {
      console.error("Feil ved henting av brukere:", err);
    } finally {
      setLoading(false);
    }
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

        <AdminSendEmailForm
          users={users}
          preselectedUserId={preselectedUserId}
        />
      </Stack>
    </AsyncMainContainer>
  );
}