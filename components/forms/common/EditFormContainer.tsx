"use client";

import React, { useState, SyntheticEvent } from "react";
import { Alert, Button, Grid, Group, Modal, Paper, Text, Title } from "@mantine/core";

export interface EditFormContainerProps {
  /** Hovedtittel for redigeringsskjemaet (f.eks. "Rediger profil"). */
  title: string;

  /** Valgfri undertekst eller forklaring plassert rett under tittelen. */
  description?: string;

  /**
   * Handlingsfunksjon som kjøres når lagring bekreftes i dialogen.
   * Kobles som regel til `form.onSubmit(submitHandler)`.
   */
  onSubmit?: (e?: SyntheticEvent<HTMLFormElement>) => void;

  /**
   * Handlingsfunksjon for å tilbakestille endringer.
   * Kobles som regel til `form.reset`.
   */
  onReset?: () => void;

  /** Tekst på lagre-knappen. Standard: "Lagre endringer". */
  submitText?: string;

  /** Tekst på nullstill/avbryt-knappen. Standard: "Nullstill endringer". */
  resetText?: string;

  /** Tittel på bekreftelsesdialogen. Standard: "Bekreft lagring". */
  confirmTitle?: string;

  /** Melding i bekreftelsesdialogen. Standard: "Er du sikker på at du vil lagre endringene?". */
  confirmMessage?: string;

  /** Setter skjemaet og knapper i opptatt-tilstand (lasteindikator). */
  loading?: boolean;

  /** Deaktiverer knappene i skjemaet. */
  disabled?: boolean;

  /** Feilmeldingstekst. Hvis angitt, vises en rød Mantine Alert øverst i skjemaet. */
  errorMessage?: string;

  /** Valgfritt element plassert under skjemaet. */
  footer?: React.ReactNode;

  /** Innholdet i skjemaet, vanligvis bestående av `<FormField>`-komponenter. */
  children: React.ReactNode;
}

/**
 * Layout-wrapper for redigeringsskjemaer (Edit Forms) med nullstill-knapp og bekreftelsesmodal.
 */
export const EditFormContainer = ({
                                    title,
                                    description,
                                    onSubmit,
                                    onReset,
                                    submitText = "Lagre endringer",
                                    resetText = "Nullstill endringer",
                                    confirmTitle = "Bekreft lagring",
                                    confirmMessage = "Er du sikker på at du vil lagre endringene?",
                                    loading = false,
                                    disabled = false,
                                    errorMessage,
                                    footer,
                                    children,
                                  }: EditFormContainerProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Forhindrer direkte submit og åpner bekreftelsesdialogen i stedet
  const handleSubmitClick = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  // Kjøres når brukeren bekrefter i modalen
  const handleConfirmSave = () => {
    setIsConfirmOpen(false);
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <>
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mb={description ? "xs" : "lg"}>
          {title}
        </Title>

        {description && (
          <Text c="dimmed" size="sm" ta="center" mb="lg">
            {description}
          </Text>
        )}

        <form onSubmit={handleSubmitClick}>
          <Grid gap="md">
            {children}

            {errorMessage && (
              <Grid.Col span={12}>
                <Alert color="red" variant="light" radius="md" title="Feil">
                  {errorMessage}
                </Alert>
              </Grid.Col>
            )}

            <Grid.Col span={12} mt="xs">
              <Group justify="flex-end" gap="sm">
                {onReset && (
                  <Button
                    type="button"
                    variant="default"
                    onClick={onReset}
                    disabled={loading || disabled}
                  >
                    {resetText}
                  </Button>
                )}

                <Button type="submit" loading={loading} disabled={disabled}>
                  {submitText}
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>

        {footer && (
          <Text ta="center" size="sm" mt="md" c="dimmed">
            {footer}
          </Text>
        )}
      </Paper>

      <Modal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmTitle}
        centered
        radius="md"
      >
        <Text size="sm" mb="lg">
          {confirmMessage}
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setIsConfirmOpen(false)}>
            Avbryt
          </Button>
          <Button color="sage" onClick={handleConfirmSave} loading={loading}>
            Ja, lagre
          </Button>
        </Group>
      </Modal>
    </>
  );
};