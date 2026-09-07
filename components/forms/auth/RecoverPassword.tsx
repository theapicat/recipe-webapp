"use client";

import { useState } from "react";
import { Anchor, Alert } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { useForm, isEmail } from "@mantine/form";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { CreateFormContainer } from "@/components/forms/common/CreateFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import {RecoverRequest} from "@/lib/models/auth/recoverRequest";

export const RecoverPassword = () => {
  const [requestActive, setRequestActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const form = useForm<RecoverRequest>({
    mode: "controlled",
    initialValues: {
      email: "",
    },
    validate: {
      email: isEmail("Ikke gyldig e-post"),
    },
  });

  const submitHandler = async (values: RecoverRequest) => {
    setRequestActive(true);
    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    try {
      const res = await agentInternal.post("/api/auth/recover", values);
      const data = (await res.json()) as HttpResponse<undefined>;

      if (res.ok) {
        setSuccessMessage(
          data.message ||
          "Dersom e-postadressen eksisterer i systemet, har vi sendt instruksjoner for å tilbakestille passordet."
        );
        form.reset();
      } else {
        setErrorMessage(data.message || "Kunne ikke utføre forespørselen. Prøv igjen senere.");
      }
    } catch {
      setErrorMessage("Det oppstod en nettverksfeil. Vennligst prøv igjen.");
    } finally {
      setRequestActive(false);
    }
  };

  return (
    <AppFormProvider form={form}>
      <CreateFormContainer
        title="Glemt passord?"
        description="Skriv inn e-postadressen din, så sender vi deg instruksjoner for å tilbakestille passordet."
        onSubmit={form.onSubmit(submitHandler)}
        submitText="Send tilbakestillingslenke"
        loading={requestActive}
        errorMessage={errorMessage}
        footer={
          <>
            Husket du passordet allikevel?{" "}
            <Anchor component={Link} href="/login" size="sm" fw={500}>
              Logg inn
            </Anchor>
          </>
        }
      >
        {successMessage && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Forespørsel sendt"
            color="sage"
            mb="md"
            radius="md"
          >
            {successMessage}
          </Alert>
        )}

        <FormField
          name="email"
          label="E-post"
          placeholder="din@epost.no"
          required
          disabled={requestActive}
        />
      </CreateFormContainer>
    </AppFormProvider>
  );
};