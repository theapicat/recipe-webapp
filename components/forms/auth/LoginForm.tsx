"use client";

import { useState } from "react";
import { Anchor, Group } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, isEmail, isNotEmpty } from "@mantine/form";
import { agentInternal } from "@/lib/agent/agentInternal";
import { useSession } from "@/lib/session/SessionProvider";
import { LoginRequest } from "@/lib/models/auth/loginRequest";
import { HttpResponse } from "@/lib/models/httpResponse";
import { UserProfileResponse } from "@/lib/models/auth/userProfileResponse";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { CreateFormContainer } from "@/components/forms/common/CreateFormContainer";
import { FormField } from "@/components/forms/common/FormField";

export const LoginForm = () => {
  const [requestActive, setRequestActive] = useState<boolean>(false);
  const [loginFailedMessage, setLoginFailedMessage] = useState<string | undefined>();

  const router = useRouter();
  const session = useSession();

  const form = useForm<LoginRequest>({
    mode: "controlled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: isEmail("Ikke gyldig e-post"),
      password: isNotEmpty("Passord mangler"),
    },
  });

  const submitHandler = async (value: LoginRequest) => {
    setRequestActive(true);
    setLoginFailedMessage(undefined);

    try {
      const res = await agentInternal.post("/api/auth/login", value);
      const data = (await res.json()) as HttpResponse<UserProfileResponse>;

      if (res.ok && data.body) {
        // Oppdaterer både bruker og rolle i SessionProvider
        session.setUser(data.body);

        // Rutestyring basert på rolle ("admin" vs "user")
        if (data.body.role?.toLowerCase() === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        if (res.status === 400) {
          setLoginFailedMessage(data.message || "Feil e-post eller passord!");
        } else {
          setLoginFailedMessage(
            "Pålogging ikke mulig grunnet feil på server. Prøv igjen senere...",
          );
        }
      }
    } catch {
      setLoginFailedMessage("Det oppstod en nettverksfeil. Vennligst prøv igjen.");
    } finally {
      setRequestActive(false);
    }
  };

  return (
    <AppFormProvider form={form}>
      <CreateFormContainer
        title="Logg inn"
        onSubmit={form.onSubmit(submitHandler)}
        submitText="Logg inn"
        loading={requestActive}
        errorMessage={loginFailedMessage}
      >
        <FormField
          name="email"
          label="E-post"
          placeholder="din@epost.no"
          required
          disabled={requestActive}
        />

        <FormField
          name="password"
          type="password"
          label="Passord"
          placeholder="Passord"
          required
          disabled={requestActive}
          extra={
            <Group justify="flex-end" mt={4}>
              <Anchor component={Link} href="/recover" size="xs" c="dimmed">
                Glemt passord?
              </Anchor>
            </Group>
          }
        />
      </CreateFormContainer>
    </AppFormProvider>
  );
};
