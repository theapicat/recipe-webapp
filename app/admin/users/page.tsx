"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  TextInput,
  Pagination,
  Select,
  Tabs,
} from "@mantine/core";
import { IconSearch, IconFilter, IconUsers, IconBan } from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserStatsCards } from "@/components/admin/users/AdminUserStatsCards";
import { AdminUserTable } from "@/components/admin/users/AdminUserTable";
import { AdminBlacklistTable } from "@/components/admin/users/AdminBlacklistTable";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<AdminUserListItem[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>("users");

  // Filter- og pagineringstilstander
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Henter HELE brukerlisten fra API-et
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentInternal.get("/api/admin/users");
      if (res.ok) {
        const responseData = await res.json();
        const items = Array.isArray(responseData.body)
          ? responseData.body
          : responseData.body?.items || [];
        setAllUsers(items);
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

  // --- FILTRERING I HENHOLD TIL BRUKERVILKÅRENE ---
  const filteredUsers = useMemo(() => {
    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const monthsAgo = (months: number) => {
      const d = new Date();
      d.setMonth(d.getMonth() - months);
      return d;
    };

    return allUsers.filter((u) => {
      const createdAt = new Date(u.createdAt);
      const lastLoginAt = u.lastLoginAt ? new Date(u.lastLoginAt) : null;

      // 1. Status- og Vilkårsfiltrering
      if (statusFilter === "locked" && !u.isLocked) return false;
      if (statusFilter === "unconfirmed" && u.isEmailConfirmed) return false;

      // Vilkår: 7 dagers påminnelse for ubekreftet e-post
      if (statusFilter === "unconfirmed_7d") {
        if (u.isEmailConfirmed || createdAt > daysAgo(7)) return false;
      }

      // Vilkår: 14 dagers sperring for ubekreftet e-post
      if (statusFilter === "unconfirmed_14d") {
        if (u.isEmailConfirmed || createdAt > daysAgo(14)) return false;
      }

      // Vilkår: 6 måneders inaktivitetsvarsel
      if (statusFilter === "inactive_6m") {
        const checkDate = lastLoginAt || createdAt;
        if (checkDate >= monthsAgo(6)) return false;
      }

      // Vilkår: 1 års inaktivitetssperring / slettekandidat
      if (statusFilter === "inactive_1y") {
        const checkDate = lastLoginAt || createdAt;
        if (checkDate >= monthsAgo(12)) return false;
      }

      // 2. Søk på navn eller e-post
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesFullName = u.fullName?.toLowerCase().includes(q);
        const matchesFirstName = u.firstName?.toLowerCase().includes(q);
        const matchesLastName = u.lastName?.toLowerCase().includes(q);

        if (!matchesEmail && !matchesFullName && !matchesFirstName && !matchesLastName) {
          return false;
        }
      }

      return true;
    });
  }, [allUsers, search, statusFilter]);

  // --- KLIENT-SIDE PAGINERING ---
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (val: string | null) => {
    setStatusFilter(val || "all");
    setPage(1);
  };

  return (
    <AsyncMainContainer size="lg" py={30} loading={loading}>
      <Stack gap="lg">
        {/* Overskrift */}
        <div>
          <Title order={2}>👥 Brukeradministrasjon</Title>
          <Text c="dimmed" size="sm">
            Oversikt og styring av registrerte brukerkontoer, kontolivssyklus og svartelister i Kjøkkenhylla
          </Text>
        </div>

        {/* Nøkkeltall / Statistikkbrikker */}
        <AdminUserStatsCards
          totalItems={filteredUsers.length}
          activeFilter={statusFilter}
        />

        {/* Hovedvisning med Faneinndeling (Brukere vs Svarteliste) */}
        <Tabs value={activeTab} onChange={setActiveTab} color="teal" variant="outline">
          <Tabs.List mb="md">
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
              Brukere ({allUsers.length})
            </Tabs.Tab>
            <Tabs.Tab value="blacklist" leftSection={<IconBan size={16} />}>
              Svarteliste (E-post & Domener)
            </Tabs.Tab>
          </Tabs.List>

          {/* FANE 1: BRUKERE */}
          <Tabs.Panel value="users">
            <Paper p="md" radius="md" withBorder shadow="xs">
              <Stack gap="md">
                <Group justify="space-between" align="center" wrap="wrap">
                  <Group gap="sm">
                    <TextInput
                      placeholder="Søk på navn eller e-post..."
                      leftSection={<IconSearch size={16} />}
                      value={search}
                      onChange={(e) => handleSearchChange(e.currentTarget.value)}
                      style={{ width: 280 }}
                    />

                    <Select
                      value={statusFilter}
                      onChange={handleFilterChange}
                      leftSection={<IconFilter size={16} />}
                      data={[
                        { value: "all", label: "Alle brukere" },
                        { value: "locked", label: "Kun låste kontoer" },
                        { value: "unconfirmed", label: "Ubekreftet e-post (alle)" },
                        { value: "unconfirmed_7d", label: "Ubekreftet > 7 dager (Påminnelse)" },
                        { value: "unconfirmed_14d", label: "Ubekreftet > 14 dager (Sperring)" },
                        { value: "inactive_6m", label: "Inaktiv > 6 måneder (Varsel)" },
                        { value: "inactive_1y", label: "Inaktiv > 1 år (Sletting)" },
                      ]}
                      style={{ width: 280 }}
                    />
                  </Group>

                  <Text size="xs" c="dimmed">
                    Viser {paginatedUsers.length} av {filteredUsers.length} brukere ({allUsers.length} totalt)
                  </Text>
                </Group>

                {/* Brukertabell */}
                <AdminUserTable
                  users={paginatedUsers}
                  onRefreshNeeded={fetchUsers}
                />

                {/* Paginering */}
                {totalPages > 1 && (
                  <Group justify="center" mt="md">
                    <Pagination
                      total={totalPages}
                      value={page}
                      onChange={setPage}
                      color="teal"
                      size="sm"
                    />
                  </Group>
                )}
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* FANE 2: SVARTELISTE */}
          <Tabs.Panel value="blacklist">
            <AdminBlacklistTable />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </AsyncMainContainer>
  );
}