"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Button,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconSearch,
  IconFilter,
  IconFilterOff,
  IconUsers,
  IconBan,
  IconMail,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserStatsCards } from "@/components/admin/users/AdminUserStatsCards";
import { AdminUserTable } from "@/components/admin/users/AdminUserTable";
import { AdminBlacklistTable } from "@/components/admin/users/AdminBlacklistTable";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<AdminUserListItem[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>("users");

  // --- OPPDELEDE FILTRE ---
  const [search, setSearch] = useState("");
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>("all"); // "all", "active", "locked"
  const [emailStatusFilter, setEmailStatusFilter] = useState<string>("all");     // "all", "confirmed", "unconfirmed"
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");         // "all", "unconfirmed_7d", "unconfirmed_14d", "inactive_6m", "inactive_1y"

  // --- SORTERING ---
  const [sortBy, setSortBy] = useState<string>("createdAt"); // "name", "email", "createdAt"
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Paginering
  const [page, setPage] = useState(1);
  const pageSize = 15;

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

  // Sjekk om noen filtre eller sorteringer avviker fra standard
  const isFiltered = useMemo(() => {
    return (
      search.trim() !== "" ||
      accountStatusFilter !== "all" ||
      emailStatusFilter !== "all" ||
      lifecycleFilter !== "all" ||
      sortBy !== "createdAt" ||
      sortOrder !== "desc"
    );
  }, [search, accountStatusFilter, emailStatusFilter, lifecycleFilter, sortBy, sortOrder]);

  // Tilbakestill alle filtre
  const handleResetFilters = () => {
    setSearch("");
    setAccountStatusFilter("all");
    setEmailStatusFilter("all");
    setLifecycleFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  // Sorteringsveksler dersom man klikker på kolonneoverskrift
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // --- KLIENT-SIDE FILTRERING & SORTERING ---
  const filteredUsers = useMemo(() => {
    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const monthsAgo = (months: number) => {
      const d = new Date();
      d.setMonth(d.getMonth() - months);
      return d;
    };

    let result = allUsers.filter((u) => {
      const createdAt = new Date(u.createdAt);
      const lastLoginAt = u.lastLoginAt ? new Date(u.lastLoginAt) : null;

      // 1. Kontostatus (Aktiv / Låst)
      if (accountStatusFilter === "active" && u.isLocked) return false;
      if (accountStatusFilter === "locked" && !u.isLocked) return false;

      // 2. E-poststatus (Bekreftet / Ubekreftet)
      if (emailStatusFilter === "confirmed" && !u.isEmailConfirmed) return false;
      if (emailStatusFilter === "unconfirmed" && u.isEmailConfirmed) return false;

      // 3. Livssyklus / Vilkår
      if (lifecycleFilter === "unconfirmed_7d") {
        if (u.isEmailConfirmed || createdAt > daysAgo(7)) return false;
      }
      if (lifecycleFilter === "unconfirmed_14d") {
        if (u.isEmailConfirmed || createdAt > daysAgo(14)) return false;
      }
      if (lifecycleFilter === "inactive_6m") {
        const checkDate = lastLoginAt || createdAt;
        if (checkDate >= monthsAgo(6)) return false;
      }
      if (lifecycleFilter === "inactive_1y") {
        const checkDate = lastLoginAt || createdAt;
        if (checkDate >= monthsAgo(12)) return false;
      }

      // 4. Tekstsøk
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

    // 5. Sortering
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        const nameA = (a.fullName || a.email).toLowerCase();
        const nameB = (b.fullName || b.email).toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === "email") {
        comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
      } else if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [allUsers, search, accountStatusFilter, emailStatusFilter, lifecycleFilter, sortBy, sortOrder]);

  // Paginerte rader
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Tekstlig oppsummering til statistikkortet
  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (accountStatusFilter !== "all") {
      parts.push(accountStatusFilter === "active" ? "Aktive" : "Låste");
    }
    if (emailStatusFilter !== "all") {
      parts.push(emailStatusFilter === "confirmed" ? "Bekreftet e-post" : "Ubekreftet e-post");
    }
    if (lifecycleFilter !== "all") {
      parts.push("Vilkårsregel");
    }
    return parts.length > 0 ? parts.join(" • ") : "Alle brukere";
  }, [accountStatusFilter, emailStatusFilter, lifecycleFilter]);

  return (
    <AsyncMainContainer size="lg" py={30} loading={loading}>
      <Stack gap="lg">
        {/* Overskrift & Topphandling */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={2}>👥 Brukeradministrasjon</Title>
            <Text c="dimmed" size="sm">
              Oversikt og styring av registrerte brukerkontoer, kontolivssyklus og svartelister
            </Text>
          </div>

          <Button
            leftSection={<IconMail size={18} />}
            color="teal"
            onClick={() => router.push("/admin/users/email")}
          >
            Skriv e-post
          </Button>
        </Group>

        {/* Nøkkeltall / Statistikkbrikker */}
        <AdminUserStatsCards
          totalItems={filteredUsers.length}
          activeFilterSummary={activeFilterSummary}
        />

        {/* Faneinndeling (Brukere vs Svarteliste) */}
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
                {/* RAD 1: SØK & TEKSTINFO */}
                <Group justify="space-between" align="center" wrap="wrap">
                  <TextInput
                    placeholder="Søk på navn eller e-post..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.currentTarget.value);
                      setPage(1);
                    }}
                    style={{ minWidth: 260, flex: 1 }}
                  />

                  <Text size="xs" c="dimmed">
                    Viser {paginatedUsers.length} av {filteredUsers.length} brukere ({allUsers.length} totalt)
                  </Text>
                </Group>

                {/* RAD 2: OPPDELT FILTRERING, SORTERING & NULLSTILL-KNAPP */}
                <Group gap="sm" align="flex-end" wrap="wrap">
                  {/* Select 1: Kontostatus */}
                  <Select
                    label="Kontostatus"
                    size="xs"
                    value={accountStatusFilter}
                    onChange={(val) => {
                      setAccountStatusFilter(val || "all");
                      setPage(1);
                    }}
                    data={[
                      { value: "all", label: "Alle kontostatusere" },
                      { value: "active", label: "Kun aktive kontoer" },
                      { value: "locked", label: "Kun låste kontoer" },
                    ]}
                    style={{ width: 170 }}
                  />

                  {/* Select 2: E-poststatus */}
                  <Select
                    label="E-poststatus"
                    size="xs"
                    value={emailStatusFilter}
                    onChange={(val) => {
                      setEmailStatusFilter(val || "all");
                      setPage(1);
                    }}
                    data={[
                      { value: "all", label: "Alle e-poststatuser" },
                      { value: "confirmed", label: "Kun bekreftet" },
                      { value: "unconfirmed", label: "Kun ubekreftet" },
                    ]}
                    style={{ width: 170 }}
                  />

                  {/* Select 3: Vilkår & Livssyklus */}
                  <Select
                    label="Vilkår / Inaktivitet"
                    size="xs"
                    leftSection={<IconFilter size={14} />}
                    value={lifecycleFilter}
                    onChange={(val) => {
                      setLifecycleFilter(val || "all");
                      setPage(1);
                    }}
                    data={[
                      { value: "all", label: "Ingen særskilte vilkår" },
                      { value: "unconfirmed_7d", label: "Ubekreftet > 7 dager (Påminnelse)" },
                      { value: "unconfirmed_14d", label: "Ubekreftet > 14 dager (Sperring)" },
                      { value: "inactive_6m", label: "Inaktiv > 6 måneder (Varsel)" },
                      { value: "inactive_1y", label: "Inaktiv > 1 år (Sletting)" },
                    ]}
                    style={{ width: 230 }}
                  />

                  {/* Sortering */}
                  <Group gap={4} align="flex-end">
                    <Select
                      label="Sorter etter"
                      size="xs"
                      value={sortBy}
                      onChange={(val) => setSortBy(val || "createdAt")}
                      data={[
                        { value: "createdAt", label: "Opprettet dato" },
                        { value: "name", label: "Navn / Brukernavn" },
                        { value: "email", label: "E-postadresse" },
                      ]}
                      style={{ width: 160 }}
                    />

                    <Tooltip label={sortOrder === "asc" ? "Stigende (A-Å / Eldst)" : "Synkende (Å-A / Nyest)"}>
                      <ActionIcon
                        variant="default"
                        size="input-xs"
                        onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                        mb={2}
                      >
                        {sortOrder === "asc" ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  </Group>

                  {/* Nullstill-knapp (vises kun når filter/søk/sortering er aktivt) */}
                  {isFiltered && (
                    <Button
                      variant="subtle"
                      color="gray"
                      size="xs"
                      leftSection={<IconFilterOff size={14} />}
                      onClick={handleResetFilters}
                      mb={2}
                    >
                      Nullstill filter
                    </Button>
                  )}
                </Group>

                {/* Brukertabell */}
                <AdminUserTable
                  users={paginatedUsers}
                  onRefreshNeeded={fetchUsers}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
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