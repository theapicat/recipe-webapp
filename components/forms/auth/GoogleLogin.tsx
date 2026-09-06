"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import Image from "next/image";
import { AuthCard } from "@/components/forms/common/AuthCard";

export const GoogleLogin = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
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
        onClick={handleGoogleLogin}
      >
        Logg på med Google
      </Button>
    </AuthCard>
  );
};