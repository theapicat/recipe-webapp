"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "@mantine/form";
import { Alert, Text, Anchor, Stack } from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { CreateFormContainer } from "@/components/forms/common/CreateFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { agentInternal } from "@/lib/agent/agentInternal";

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    mode: "controlled",
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      newPassword: (val) =>
        val.length < 6 ? "Passordet må være på minst 6 tegn" : null,
      confirmPassword: (val, values) =>
        val !== values.newPassword ? "Passordene er ikke like" : null,
    },
  });

  if (!email || !token) {
    return (
      <Stack gap="md">
        <Alert
          color="red"
          title="Ugyldig lenke"
          icon={<IconAlertCircle size={18} />}
        >
          Lenken for tilbakestilling av passord er ugyldig eller mangler
          nødvendige parametere. Vennligst be om en ny lenke.
        </Alert>
        <Text size="sm" ta="center">
          <Anchor component={Link} href="/recover">
            Gå til glemt passord
          </Anchor>
        </Text>
      </Stack>
    );
  }

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const res = await agentInternal.post("/api/auth/reset-password", {
        email,
        token,
        newPassword: values.newPassword,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setErrorMessage(
          errorData.message || "Tilbakestilling mislyktes. Lenken kan være utløpt."
        );
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage("Nettverksfeil oppstod. Vennligst prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Stack gap="md">
        <Alert
          color="sage"
          title="Passord tilbakestilt"
          icon={<IconCheck size={18} />}
        >
          Ditt passord har blitt oppdatert. Du kan nå logge inn med ditt nye
          passord.
        </Alert>
        <Text size="sm" ta="center">
          <Anchor component={Link} href="/login" fw={600}>
            Gå til innlogging
          </Anchor>
        </Text>
      </Stack>
    );
  }

  return (
    <AppFormProvider form={form}>
      <CreateFormContainer
        title="Velg nytt passord"
        description="Skriv inn ditt nye passord to ganger under."
        onSubmit={form.onSubmit(handleSubmit)}
        submitText="Oppdater passord"
        loading={loading}
        errorMessage={errorMessage}
      >
        <FormField
          name="newPassword"
          label="Nytt passord"
          placeholder="Minst 6 tegn"
          type="password"
          required
          disabled={loading}
        />
        <FormField
          name="confirmPassword"
          label="Bekreft nytt passord"
          placeholder="Gjenta nytt passord"
          type="password"
          required
          disabled={loading}
        />
      </CreateFormContainer>
    </AppFormProvider>
  );
};