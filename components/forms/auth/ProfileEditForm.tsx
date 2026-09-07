"use client";

import { useState, useEffect } from "react";
import { useForm, isNotEmpty } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Alert } from "@mantine/core";
import { IconCheck, IconLock } from "@tabler/icons-react";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { EditFormContainer } from "@/components/forms/common/EditFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { useSession } from "@/lib/session/SessionProvider";
import { agentInternal } from "@/lib/agent/agentInternal";

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
}

export const ProfileEditForm = () => {
  const { user, setUser } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const form = useForm<ProfileFormValues>({
    mode: "controlled",
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validate: {
      firstName: isNotEmpty("Fornavn må fylles ut"),
      lastName: isNotEmpty("Etternavn må fylles ut"),
    },
  });

  // Synkroniser skjema med sesjonsdata
  useEffect(() => {
    if (user) {
      form.setValues({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSubmit = async (values: ProfileFormValues) => {
    if (isAdmin) return;

    setLoading(true);
    setErrorMessage(undefined);

    try {
      const res = await agentInternal.put("/api/auth/updateProfile", {
        firstName: values.firstName,
        lastName: values.lastName,
      });

      const data = await res.json();

      if (res.ok) {
        // Oppdaterer den globale sesjonstilstanden
        if (data.body) {
          setUser(data.body);
        } else {
          setUser({ ...user!, firstName: values.firstName, lastName: values.lastName });
        }

        notifications.show({
          title: "Profil oppdatert!",
          message: "Dine navneendringer har blitt lagret.",
          color: "sage",
          icon: <IconCheck size={16} />,
        });
      } else {
        setErrorMessage(data.message || "Kunne ikke oppdatere profilen.");
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
        title="Personalia"
        description={
          isAdmin
            ? "Profilinformasjonen for systemadministrator er låst"
            : "Oppdater ditt fornavn og etternavn"
        }
        onSubmit={form.onSubmit(handleSubmit)}
        onReset={() => form.reset()}
        loading={loading}
        errorMessage={errorMessage}
        confirmTitle="Bekreft profiloppdatering"
        confirmMessage="Er du sikker på at du vil lagre de nye navneendringene?"
        disabled={isAdmin}
      >
        {isAdmin && (
          <Alert color="terracotta" icon={<IconLock size={20} />} mb="md" radius="md">
            Systemadministrator sin profilinformasjon er skrivebeskyttet og kan ikke endres via grensesnittet.
          </Alert>
        )}

        <FormField
          name="email"
          label="E-postadresse"
          disabled
        />

        <FormField
          name="firstName"
          label="Fornavn"
          placeholder="Ditt fornavn"
          required
          disabled={loading || isAdmin}
        />

        <FormField
          name="lastName"
          label="Etternavn"
          placeholder="Ditt etternavn"
          required
          disabled={loading || isAdmin}
        />
      </EditFormContainer>
    </AppFormProvider>
  );
};