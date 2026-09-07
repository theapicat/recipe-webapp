"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Badge, Group } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { EditFormContainer } from "@/components/forms/common/EditFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { useSession } from "@/lib/session/SessionProvider";
import { agentInternal } from "@/lib/agent/agentInternal";

interface PasswordFormValues {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordForm = () => {
  const { user, updateUser } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Sjekker om brukeren har lokalt passord fra før
  const hasPassword = user?.hasPassword ?? true;

  const form = useForm<PasswordFormValues>({
    mode: "controlled",
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (val) =>
        hasPassword && !val ? "Nåværende passord må oppgis" : null,
      newPassword: (val) =>
        !val || val.length < 8 ? "Passordet må bestå av minst 8 tegn" : null,
      confirmPassword: (val, values) =>
        val !== values.newPassword ? "Passordene er ikke identiske" : null,
    },
  });

  const handleSubmit = async (values: PasswordFormValues) => {
    setLoading(true);
    setErrorMessage(undefined);

    // Velger dynamisk endepunkt og payload basert på om brukeren har passord
    const endpoint = hasPassword
      ? "/api/auth/change-password"
      : "/api/auth/set-password";

    const payload = hasPassword
      ? {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }
      : {
        newPassword: values.newPassword,
      };

    try {
      const res = await agentInternal.post(endpoint, payload);
      const data = await res.json();

      if (res.ok) {
        notifications.show({
          title: hasPassword ? "Passord endret!" : "Passord opprettet!",
          message: data.message || "Ditt passord ble oppdatert.",
          color: "sage",
          icon: <IconCheck size={16} />,
        });
        form.reset();

        // Oppdaterer sesjonen så UI-et umiddelbart vet at brukeren nå har et passord
        updateUser({ hasPassword: true });
      } else {
        setErrorMessage(
          data.message ||
          "Kunne ikke oppdatere passord. Sjekk at oppgitte opplysninger er korrekte."
        );
      }
    } catch {
      setErrorMessage("Det oppstod en feil under kommunikasjon med serveren.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppFormProvider form={form}>
      <EditFormContainer
        title={hasPassword ? "Endre Passord" : "Opprett Passord"}
        description={
          hasPassword
            ? "Oppdater ditt passord for å holde kontoen din sikker"
            : "Du er innlogget med Google. Opprett et lokalt passord for å kunne logge inn med e-post og passord i tillegg."
        }
        onSubmit={form.onSubmit(handleSubmit)}
        onReset={() => form.reset()}
        submitText={hasPassword ? "Oppdater passord" : "Opprett passord"}
        loading={loading}
        errorMessage={errorMessage}
        confirmTitle={
          hasPassword ? "Bekreft passordbytte" : "Bekreft opprettelse av passord"
        }
        confirmMessage="Er du sikker på at du vil lagre dette passordet?"
      >
        {!hasPassword && (
          <Group mb="xs">
            <Badge color="terracotta" variant="light">
              Google-konto (Mangler lokalt passord)
            </Badge>
          </Group>
        )}

        {hasPassword && (
          <FormField
            name="currentPassword"
            type="password"
            label="Nåværende passord"
            placeholder="Ditt nåværende passord"
            required
            disabled={loading}
          />
        )}

        <FormField
          name="newPassword"
          type="password"
          label="Nytt passord"
          placeholder="Minst 8 tegn"
          required
          disabled={loading}
        />

        <FormField
          name="confirmPassword"
          type="password"
          label="Gjenta nytt passord"
          placeholder="Gjenta det nye passordet"
          required
          disabled={loading}
        />
      </EditFormContainer>
    </AppFormProvider>
  );
};