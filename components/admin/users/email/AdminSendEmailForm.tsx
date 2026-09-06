"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, isNotEmpty } from "@mantine/form";
import { Grid, Select } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

import { AppFormProvider } from "@/components/forms/common/FormContext";
import { EditFormContainer } from "@/components/forms/common/EditFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { agentInternal } from "@/lib/agent/agentInternal";
import { AdminUserListItem } from "@/lib/models/admin/users/AdminUserListItem";
import {AdminUserCard} from "@/components/admin/users/email/AdminUserCard";

interface FormValues {
  userId: string;
  subject: string;
  message: string;
}

interface Props {
  users: AdminUserListItem[];
  preselectedUserId?: string | null;
}

export function AdminSendEmailForm({ users, preselectedUserId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const form = useForm<FormValues>({
    mode: "controlled",
    initialValues: {
      userId: preselectedUserId || "",
      subject: "",
      message: "",
    },
    validate: {
      userId: isNotEmpty("Du må velge en mottaker"),
      subject: isNotEmpty("Emne må fylles ut"),
      message: isNotEmpty("Meldingen kan ikke være tom"),
    },
  });

  const selectData = useMemo(() => {
    return users.map((u) => ({
      value: u.userId,
      label: `${u.fullName || "Navnløs"} (${u.email})`,
    }));
  }, [users]);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.userId === form.values.userId) || null;
  }, [users, form.values.userId]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const res = await agentInternal.post("/api/admin/users/send-email", values);

      if (res.ok) {
        notifications.show({
          title: "E-post sendt",
          message: `Meldingen ble sendt til ${selectedUser?.email || "brukeren"}.`,
          color: "teal",
        });

        if (preselectedUserId) {
          router.push(`/admin/users/${preselectedUserId}`);
        } else {
          router.push("/admin/users");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.message || "Kunne ikke sende e-posten via serveren.");
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
        title="Send e-post til bruker"
        description="Forfatt og send en administrativ melding direkte til valgt bruker"
        onSubmit={form.onSubmit(handleSubmit)}
        onReset={() => form.reset()}
        loading={loading}
        errorMessage={errorMessage}
        confirmTitle="Bekreft utsending"
        confirmMessage={`Er du sikker på at du vil sende denne e-posten til ${
          selectedUser?.fullName || selectedUser?.email || "brukeren"
        }?`}
      >
        <Grid>
          {/* Mottaker velger */}
          <Grid.Col span={12}>
            <Select
              label="Mottaker"
              placeholder="Søk etter navn eller e-postadresse..."
              leftSection={<IconUser size={16} />}
              data={selectData}
              searchable
              clearable
              nothingFoundMessage="Ingen brukere funnet"
              disabled={loading}
              withAsterisk
              {...form.getInputProps("userId")}
            />
          </Grid.Col>

          {/* Mottaker-kort */}
          {selectedUser && (
            <Grid.Col span={12}>
              <AdminUserCard user={selectedUser} />
            </Grid.Col>
          )}

          {/* Emnefelt (FormField returnerer Grid.Col) */}
          <FormField
            name="subject"
            label="Emne (Subject)"
            placeholder="f.eks. Angående din brukerkonto på Kjøkkenhylla"
            required
            disabled={loading}
            span={12}
          />

          {/* Meldingsfelt (FormField returnerer Grid.Col) */}
          <FormField
            name="message"
            label="Melding (Message)"
            placeholder="Skriv inn meldingen din her..."
            type="textarea"
            minRows={6}
            required
            disabled={loading}
            span={12}
          />
        </Grid>
      </EditFormContainer>
    </AppFormProvider>
  );
}