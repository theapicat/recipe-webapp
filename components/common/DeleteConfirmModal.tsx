"use client";

import { useState } from "react";
import { Alert, Button, Group, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";

interface DeleteConfirmModalProps {
  opened: boolean;
  /** Visningsnavn (allerede med stor forbokstav) — `null` mens ingenting er valgt. */
  name: string | null;
  /** Intern rute å sende DELETE til, f.eks. `/api/admin/allergens/{id}`. */
  url: string;
  title?: string;
  onClose: () => void;
  onDeleted: () => void;
}

interface DeleteBodyProps extends Omit<DeleteConfirmModalProps, "opened" | "name" | "title"> {
  name: string;
}

// Tilstanden (laster/feil) ligger i en indre komponent som Modal avmonterer ved lukking, så den nullstilles hver gang.
const DeleteBody = ({ name, url, onClose, onDeleted }: DeleteBodyProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleDelete = async () => {
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const res = await agentInternal.delete(url);

      if (res.ok) {
        notifications.show({
          title: "Slettet",
          message: `«${name}» ble slettet.`,
          color: "sage",
          icon: <IconCheck size={16} />,
        });
        onDeleted();
        return;
      }

      const data: Partial<HttpResponse> = await res.json().catch(() => ({}));
      // 409 = foreign key: raden brukes av andre data (frontend vet ikke alltid dette på forhånd, se deleteBlockedReason).
      setErrorMessage(
        res.status === 409
          ? "Oppføringen er i bruk av andre data og kan derfor ikke slettes."
          : data.message || "Kunne ikke slette oppføringen.",
      );
    } catch {
      setErrorMessage("Kunne ikke koble til serveren.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Text size="sm">
        Er du sikker på at du vil slette <b>«{name}»</b>?
      </Text>
      <Text size="sm" c="dimmed" mt="xs">
        Handlingen kan ikke angres.
      </Text>

      {errorMessage && (
        <Alert color="red" variant="light" radius="md" title="Feil" mt="md">
          {errorMessage}
        </Alert>
      )}

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Avbryt
        </Button>
        <Button
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={handleDelete}
          loading={loading}
        >
          Slett
        </Button>
      </Group>
    </>
  );
};

// Felles bekreftelsesdialog for sletting (kataloger og ingredienser). Selve blokkeringen av «i bruk» skjer før dialogen
// åpnes (se components/admin/catalog/deleteBlockedReason.ts); 409 vises her som siste skanse.
export const DeleteConfirmModal = ({
  opened,
  name,
  url,
  title = "Slett oppføring",
  onClose,
  onDeleted,
}: DeleteConfirmModalProps) => (
  <Modal opened={opened} onClose={onClose} title={title} centered radius="md">
    {name && <DeleteBody name={name} url={url} onClose={onClose} onDeleted={onDeleted} />}
  </Modal>
);
