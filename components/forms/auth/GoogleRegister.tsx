"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import Image from "next/image";
import { AuthCard } from "@/components/forms/common/AuthCard";

export const GoogleRegister = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = () => {
    setLoading(true);
    // Må være en ekte nettleser-navigasjon (ikke router.push) — /api/auth/google er en
    // full HTTP-redirect-kjede videre til Googles OAuth-dialog og tilbake via Gatewayen.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/auth/google";
  };

  return (
    <AuthCard>
      <Button
        variant="default"
        fullWidth
        loading={loading}
        leftSection={
          !loading && (
            <Image
              src="/icons/google.svg"
              alt="Google"
              width={18}
              height={18}
            />
          )
        }
        onClick={handleGoogleRegister}
      >
        Registrer med Google
      </Button>
    </AuthCard>
  );
};