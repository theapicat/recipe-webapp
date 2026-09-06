"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Divider, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { RegisterForm } from "@/components/forms/auth/RegisterForm";
import { GoogleRegister } from "@/components/forms/auth/GoogleRegister";
import { useSession } from "@/lib/session/SessionProvider";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

const RegisterPage = () => {
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

  const errorCode = searchParams.get("error");

  const googleErrorMessage = useMemo(() => {
    if (!errorCode) return null;

    switch (errorCode) {
      case "account_locked":
      case "locked":
        return "Kontoen knyttet til denne Google-eposten er sperret.";
      case "blacklisted":
        return "Denne e-postadressen eller domenet er utestengt fra å opprette konto.";
      case "access_denied":
        return "Registrering med Google ble avbrutt.";
      case "google_failed":
      case "oauth_failed":
      default:
        return "Det oppstod en feil under registrering med Google. Prøv igjen eller registrer med e-post.";
    }
  }, [errorCode]);

  useEffect(() => {
    if (!session || !session.user) return;

    if (!session.user.welcomeCompleted) {
      router.push("/user/welcome");
      return;
    }

    const role = session.role?.toLowerCase();
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "user") {
      router.push("/dashboard");
    }
  }, [session?.user, session?.role, router]);

  const isRedirecting = Boolean(session?.user);

  return (
    <AsyncMainContainer size={480} py={40} loading={isRedirecting}>
      <Stack gap="md">
        {googleErrorMessage && (
          <Alert
            color="red"
            title="Registreringsfeil"
            variant="light"
            radius="md"
            icon={<IconAlertCircle size={18} />}
          >
            {googleErrorMessage}
          </Alert>
        )}

        <RegisterForm />

        <Divider label="eller" labelPosition="center" my="xs" />

        <GoogleRegister />
      </Stack>
    </AsyncMainContainer>
  );
};

export default RegisterPage;