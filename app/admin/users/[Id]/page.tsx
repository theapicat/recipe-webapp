"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Stack } from "@mantine/core";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserDetails } from "@/lib/models/admin/users/AdminUserDetails";
import { AdminUserHeader } from "@/components/admin/users/detail/AdminUserHeader";
import { AdminUserTimeline } from "@/components/admin/users/detail/AdminUserTimeline";
import { AdminUserEditForm } from "@/components/admin/users/detail/AdminUserEditForm";
import { AdminUserActionPanel } from "@/components/admin/users/detail/AdminUserActionPanel";

export default function AdminUserDetailsPage() {
  const pathname = usePathname();
  // Henter ut siste segment i URL-en (f.eks. "01a07106-9d47-7f6e-834e-1bfdae55d58f")
  const id = pathname.split("/").pop();

  // `key={id}` gir et rent remount når brukeren navigerer til en annen bruker, slik at
  // `loading` starter friskt fra initialiseringen under i stedet for at vi må kalle
  // setLoading(true) synkront inni en effekt ved id-endring.
  return <AdminUserDetailsContent key={id} id={id} />;
}

function AdminUserDetailsContent({ id }: { id?: string }) {
  // Sjekker at ID faktisk er en gyldig verdi og ikke mappenavnet "users" eller "undefined"
  const isValidId = Boolean(id && id !== "users" && id !== "undefined");

  const [loading, setLoading] = useState(isValidId);
  const [user, setUser] = useState<AdminUserDetails | null>(null);

  // .then()-kjede (ikke async/await): react-hooks/set-state-in-effect flagger setState etter en
  // `await` inni en async-funksjon kalt fra en effekt, men ikke samme mønster i en .then()-kjede.
  const fetchUserDetails = useCallback(() => {
    if (!isValidId) return;

    agentInternal
      .get(`/api/admin/users/${id}`)
      .then(async (res) => {
        if (res.ok) {
          const responseData = await res.json();
          setUser(responseData.body);
        }
      })
      .catch((err) => {
        console.error("Feil ved henting av brukerdetaljer:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, isValidId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const refetchWithLoading = () => {
    setLoading(true);
    fetchUserDetails();
  };

  return (
    <AsyncMainContainer size="md" py={30} loading={loading}>
      {user && (
        <Stack gap="xl">
          {/* 1. Hovedheader / Brukersummering */}
          <AdminUserHeader user={user} />

          {/* 2. Rediger personalia skjema */}
          <AdminUserEditForm user={user} onUserUpdated={refetchWithLoading} />

          {/* 3. Tidslinje for kontolivssyklus */}
          <AdminUserTimeline user={user} />

          {/* 4. Administrative Handlinger */}
          <AdminUserActionPanel user={user} onRefreshNeeded={refetchWithLoading} />
        </Stack>
      )}
    </AsyncMainContainer>
  );
}
