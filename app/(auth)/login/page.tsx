"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Alert, Anchor, Button, Divider, Paper, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { LoginForm } from "@/components/forms/auth/LoginForm";
import { GoogleLogin } from "@/components/forms/auth/GoogleLogin";
import { agentInternal } from "@/lib/agent/agentInternal";
import { LoginRequest } from "@/lib/models/auth/loginRequest";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";
import { HttpResponse } from "@/lib/models/httpResponse";
import { useSession } from "@/lib/session/SessionProvider";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { DEV_USERS } from "@/app/(auth)/login/userData";

const LoginPage = () => {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasExpired = searchParams.get("expired") === "true";
  const errorCode = searchParams.get("error");

  // Hjelpefunksjon for å oversette OAuth/Google feilkoder til norsk
  const googleErrorMessage = useMemo(() => {
    if (!errorCode) return null;

    switch (errorCode) {
      case "account_locked":
      case "locked":
        return "Google-kontoen din er knyttet til en sperret brukerkonto på Kjøkkenhylla. Ta kontakt med support.";
      case "blacklisted":
        return "Denne e-postadressen eller domenet er utestengt fra Kjøkkenhylla.";
      case "access_denied":
        return "Innlugging med Google ble avbrutt.";
      case "google_failed":
      case "oauth_failed":
      default:
        return "Det oppstod en feil under innlogging med Google. Vennligst prøv igjen eller logg inn med e-post.";
    }
  }, [errorCode]);

  const handleStaticLogin = async (credentials: LoginRequest) => {
    try {
      const res = await agentInternal.post("/api/auth/login", credentials);
      const data = (await res.json()) as HttpResponse<UserProfileResponse | undefined>;

      if (data.statusCode === 200 && data.body) {
        session.setUser(data.body);
        session.setRole(data.body.role);

        const isAdmin = data.body.role.toLowerCase() === "admin";
        router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
      }
    } catch (err) {
      console.error("DEV Login feilet:", err);
    }
  };

  useEffect(() => {
    if (!session || !session.role) return;

    const normalizedRole = session.role.toLowerCase();
    if (normalizedRole === "admin") {
      router.push("/admin/dashboard");
    } else if (normalizedRole === "user") {
      router.push("/dashboard");
    }
  }, [session.role, router, session]);

  const isRedirecting = Boolean(session?.role);

  return (
    <AsyncMainContainer size={420} py={40} loading={isRedirecting}>
      <Stack gap="md">
        {/* VARSEL: Utløpt økt */}
        {hasExpired && (
          <Alert color="orange" title="Økten har utløpt" variant="light" radius="md">
            Du må logge inn på nytt for å fortsette.
          </Alert>
        )}

        {/* VARSEL: Feil under Google-pålogging */}
        {googleErrorMessage && (
          <Alert
            color="red"
            title="Påloggingsfeil"
            variant="light"
            radius="md"
            icon={<IconAlertCircle size={18} />}
          >
            {googleErrorMessage}
          </Alert>
        )}

        <LoginForm />

        <Divider label="eller" labelPosition="center" my="xs" />

        <GoogleLogin />

        {/* LENKE TIL REGISTRERING */}
        <Paper p="md" radius="md" withBorder ta="center">
          <Text size="sm">
            Har du ikke en konto ennå?{" "}
            <Anchor component={Link} href="/register" fw={500}>
              Registrer deg her
            </Anchor>
          </Text>
        </Paper>

        {/* DEV :: Testverktøy for hurtiginnlogging */}
        {process.env.NODE_ENV === "development" && (
          <Paper radius="md" p="md" withBorder bg="var(--mantine-color-gray-0)">
            <Divider label="DEV :: Hurtiginnlogging" labelPosition="center" mb="sm" />
            <Stack gap="xs">
              {Object.entries(DEV_USERS).map(([key, user]) => {
                if (!user.credentials.password) return null;

                return (
                  <Button
                    key={key}
                    variant="light"
                    color="gray"
                    size="xs"
                    justify="space-between"
                    onClick={() =>
                      handleStaticLogin({
                        email: user.credentials.email,
                        password: user.credentials.password!,
                      })
                    }
                  >
                    <Text size="xs" fw={500}>
                      DEV :: {user.label}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {user.credentials.email}
                    </Text>
                  </Button>
                );
              })}
            </Stack>
          </Paper>
        )}
      </Stack>
    </AsyncMainContainer>
  );
};

export default LoginPage;