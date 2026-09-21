"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { CreateFormContainer } from "@/components/forms/common/CreateFormContainer";
import { EditFormContainer } from "@/components/forms/common/EditFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { toWritable } from "@/components/admin/catalog/catalogPayload";
import { validateName } from "@/components/admin/catalog/catalogValidation";
import { agentInternal } from "@/lib/agent/agentInternal";
import { CatalogItem } from "@/lib/models/catalog/CatalogModelMap";
import { CatalogResource } from "@/lib/models/catalog/CatalogResource";
import { HttpResponse } from "@/lib/models/httpResponse";
import { capitalize } from "@/lib/text/names";

interface CatalogItemFormProps {
  resource: CatalogResource;
  /** Raden som redigeres, eller null for en ny. */
  item: CatalogItem | null;
  /** Hele katalogen — brukes til å avvise duplikate navn før noe sendes. */
  existing: CatalogItem[];
  onSaved: () => void;
}

interface NameFormValues {
  name: string;
}

// Opprett/rediger for alle kataloger som kun har et navn (alt unntatt enheter, se UnitForm).
export const CatalogItemForm = ({ resource, item, existing, onSaved }: CatalogItemFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const form = useForm<NameFormValues>({
    mode: "controlled",
    initialValues: { name: item ? capitalize(item.name) : "" },
    validate: { name: (value) => validateName(value, existing, item?.id) },
  });

  const handleSubmit = async (values: NameFormValues) => {
    const name = values.name.trim();

    setLoading(true);
    setErrorMessage(undefined);

    try {
      // Navnet sendes som skrevet — backend trimmer og lowercaser selv.
      const res = item
        ? await agentInternal.put(`/api/admin/${resource}`, { ...toWritable(item), name })
        : await agentInternal.post(`/api/admin/${resource}`, { name });

      if (res.ok) {
        notifications.show({
          title: item ? "Endringen er lagret" : "Oppføringen er opprettet",
          message: `«${name}» ble lagret.`,
          color: "sage",
          icon: <IconCheck size={16} />,
        });
        onSaved();
      } else {
        const data: Partial<HttpResponse> = await res.json().catch(() => ({}));
        setErrorMessage(data.message || "Kunne ikke lagre oppføringen.");
      }
    } catch {
      setErrorMessage("Kunne ikke koble til serveren.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppFormProvider form={form}>
      {item ? (
        <EditFormContainer
          bare
          title="Rediger"
          submitText="Lagre"
          onSubmit={form.onSubmit(handleSubmit)}
          loading={loading}
          errorMessage={errorMessage}
        >
          <FormField name="name" label="Navn" required disabled={loading} />
        </EditFormContainer>
      ) : (
        <CreateFormContainer
          bare
          title="Opprett"
          submitText="Legg til"
          onSubmit={form.onSubmit(handleSubmit)}
          loading={loading}
          errorMessage={errorMessage}
        >
          <FormField name="name" label="Navn" required disabled={loading} />
        </CreateFormContainer>
      )}
    </AppFormProvider>
  );
};
