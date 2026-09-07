"use client";

import { useState } from "react";
import { useForm, isNotEmpty, isEmail } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { EditFormContainer } from "@/components/forms/common/EditFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserDetails } from "@/lib/models/admin/users/AdminUserDetails";
import { AdminUpdateUserRequest } from "@/lib/models/admin/users/AdminUpdateUserRequest";

interface Props {
  user: AdminUserDetails;
  onUserUpdated: () => void;
}

export function AdminUserEditForm({ user, onUserUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const form = useForm<AdminUpdateUserRequest>({
    mode: "controlled",
    initialValues: {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    validate: {
      firstName: isNotEmpty("Fornavn må fylles ut"),
      lastName: isNotEmpty("Etternavn må fylles ut"),
      email: isEmail("Ugyldig e-postadresse"),
    },
  });

  const handleSubmit = async (values: AdminUpdateUserRequest) => {
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const res = await agentInternal.put("/api/admin/users", values);

      if (res.ok) {
        notifications.show({
          title: "Profil oppdatert",
          message: "Brukerens personalia har blitt endret.",
          color: "sage",
        });
        onUserUpdated();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.message || "Kunne ikke oppdatere brukeren.");
      }
    } catch {
      setErrorMessage("Nettverksfeil oppstod. Vennligst prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppFormProvider form={form}>
      <EditFormContainer
        title="Rediger Personalia"
        description="Oppdater fornavn, etternavn eller e-postadresse på vegne av brukeren"
        onSubmit={form.onSubmit(handleSubmit)}
        onReset={() => form.reset()}
        loading={loading}
        errorMessage={errorMessage}
        confirmTitle="Bekreft profilendring"
        confirmMessage="Er du sikker på at du vil oppdatere denne brukerens opplysninger?"
      >
        <FormField
          name="firstName"
          label="Fornavn"
          placeholder="Fornavn"
          required
          disabled={loading}
        />

        <FormField
          name="lastName"
          label="Etternavn"
          placeholder="Etternavn"
          required
          disabled={loading}
        />

        <FormField
          name="email"
          label="E-postadresse"
          placeholder="bruker@example.com"
          required
          disabled={loading}
        />
      </EditFormContainer>
    </AppFormProvider>
  );
}