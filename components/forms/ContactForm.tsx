"use client";

import { useState } from "react";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { Button, Stack, Text, Title, Paper, ThemeIcon } from "@mantine/core";
import { IconCheck, IconX, IconRefresh } from "@tabler/icons-react";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { CreateFormContainer } from "@/components/forms/common/CreateFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { ContactRequest } from "@/lib/models/public/ContactRequest";

type SubmissionStatus = "idle" | "success" | "rejected";

export const ContactForm = () => {
  const [requestActive, setRequestActive] = useState<boolean>(false);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");

  const form = useForm<ContactRequest>({
    mode: "controlled",
    initialValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
    validate: {
      name: isNotEmpty("Vennligst oppgi navnet ditt"),
      email: isEmail("Ikke gyldig e-postadresse"),
      subject: (value: string) => {
        if (!value || value.trim().length === 0) return "Vennligst oppgi et emne";
        if (value.length > 150) return "Emnet kan ikke være lengre enn 150 tegn";
        return null;
      },
      message: (value: string) => {
        if (!value || value.trim().length === 0) return "Vennligst skriv inn en melding";
        if (value.length > 2000) return "Meldingen kan ikke være lengre enn 2000 tegn";
        return null;
      },
    },
  });

  const submitHandler = async (values: ContactRequest) => {
    setRequestActive(true);

    try {
      const response = await agentInternal.post(
        "/api/public/contact",
        values
      );

      const body: HttpResponse<undefined> = await response.json();

      if (body.statusCode === 200) {
        setStatus("success");
        setStatusMessage(
          body.message || "Takk! Meldingen din er mottatt og sendt videre til behandling."
        );
      } else {
        setStatus("rejected");
        setStatusMessage(
          body.message
            ? `Uff da, vi klarte dessverre ikke å sende meldingen din: ${body.message}`
            : "Uff da, vi klarte dessverre ikke å sende meldingen din akkurat nå. Vennligst prøv igjen litt senere."
        );
      }
    } catch {
      setStatus("rejected");
      setStatusMessage(
        "Uff da, det ser ut til å ha oppstått en nettverksfeil. Vennligst sjekk internettilkoblingen din og prøv igjen om et lite øyeblikk."
      );
    } finally {
      setRequestActive(false);
    }
  };

  const resetFormState = () => {
    form.reset();
    setStatus("idle");
    setStatusMessage("");
  };

  // Vis kvittering/statuskomponent når skjemaet er sendt eller avvist
  if (status !== "idle") {
    const isSuccess = status === "success";

    return (
      <Paper radius="md" p="xl" withBorder>
        <Stack align="center" gap="md">
          <ThemeIcon
            size={60}
            radius="xl"
            color={isSuccess ? "sage" : "red"}
            variant="light"
          >
            {isSuccess ? <IconCheck size={36} /> : <IconX size={36} />}
          </ThemeIcon>

          <Title order={3}>
            {isSuccess ? "Melding sendt!" : "Meldingen ble avvist"}
          </Title>

          <Text c="dimmed" size="sm" ta="center" style={{ maxWidth: 450 }}>
            {statusMessage}
          </Text>

          <Button
            variant="outline"
            color={isSuccess ? "sage" : "gray"}
            leftSection={<IconRefresh size={16} />}
            onClick={resetFormState}
            mt="sm"
          >
            {isSuccess ? "Send en ny melding" : "Prøv igjen"}
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <AppFormProvider form={form}>
      <CreateFormContainer
        title="Kontakt oss"
        description="Har du spørsmål, tilbakemeldinger eller forslag? Send oss en melding!"
        onSubmit={form.onSubmit(submitHandler)}
        submitText="Send melding"
        loading={requestActive}
      >
        <FormField
          name="name"
          label="Navn"
          placeholder="Ditt navn"
          required
          disabled={requestActive}
        />

        <FormField
          name="email"
          label="E-post"
          placeholder="din@epost.no"
          required
          disabled={requestActive}
        />

        <FormField
          name="subject"
          label="Emne"
          placeholder="Hva gjelder henvendelsen?"
          required
          disabled={requestActive}
        />

        <FormField
          name="message"
          label="Melding"
          placeholder="Hva har du på hjertet? (Maks 2000 tegn)"
          type="textarea"
          required
          disabled={requestActive}
        />
      </CreateFormContainer>
    </AppFormProvider>
  );
};