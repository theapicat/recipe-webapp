"use client";

import { useState } from "react";
import { Alert, Button, Checkbox, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { UnconfirmedIngredient } from "@/lib/models/ingredients/UnconfirmedIngredient";

interface AddUnconfirmedIngredientDialogProps {
  /** Teksten brukeren skrev i søkefeltet, som ikke matchet noe i katalogen — forhåndsutfylt navn. */
  searchText: string;
  onCancel: () => void;
  onCreated: (ingredient: UnconfirmedIngredient) => void;
}

// Vises når brukeren skriver inn en ingrediens i oppskriftsskjemaet som ikke finnes i katalogen. Oppretter en
// UnconfirmedIngredient — synlig/brukbar kun for brukeren selv til en admin godkjenner, slår sammen eller avviser
// den (se lib/models/ingredients/UnconfirmedIngredient.ts og documentation/10-backlog.md, seksjon 2).
//
// Merk: backend-kontrakten (CreateUnconfirmedIngredientRequest) støtter i dag kun navn + "be om vurdering" — ikke
// en "variant av"-referanse eller en fritekst-forklaring. Dialogen tilbyr derfor bare det som faktisk lagres.
export const AddUnconfirmedIngredientDialog = ({
  searchText,
  onCancel,
  onCreated,
}: AddUnconfirmedIngredientDialogProps) => {
  const [name, setName] = useState(searchText.trim());
  const [requestReview, setRequestReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMessage("Navn må fylles ut.");
      return;
    }

    setSaving(true);
    setErrorMessage(undefined);

    try {
      const res = await agentInternal.post<UnconfirmedIngredient>(
        "/api/user/unconfirmed-ingredients",
        {
          name: name.trim(),
          requestReview,
        },
      );
      const data: Partial<HttpResponse<UnconfirmedIngredient>> = await res.json().catch(() => ({}));

      if (res.ok && data.body) {
        notifications.show({
          title: "Lagt til",
          message: `«${data.body.name}» er lagt til som din egen ingrediens.`,
          color: "sage",
          icon: <IconCheck size={16} />,
        });
        onCreated(data.body);
      } else {
        setErrorMessage(data.message || "Kunne ikke legge til ingrediensen.");
      }
    } catch {
      setErrorMessage("Kunne ikke koble til serveren.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened
      onClose={onCancel}
      title="Ingrediensen finnes ikke i katalogen"
      centered
      radius="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          «{searchText}» ble ikke funnet blant de offisielle ingrediensene. Du kan legge den til som
          din egen — den blir kun synlig for deg til en administrator godkjenner, slår den sammen
          med en eksisterende eller avviser den.
        </Text>

        <TextInput
          label="Navn"
          required
          withAsterisk
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          disabled={saving}
        />

        <Checkbox
          label="Be om vurdering for den offisielle katalogen"
          description="En administrator ser da på om den bør godkjennes, i stedet for å bare bli liggende som din egen."
          checked={requestReview}
          onChange={(event) => setRequestReview(event.currentTarget.checked)}
          disabled={saving}
        />

        {errorMessage && (
          <Alert color="red" variant="light" radius="md" icon={<IconAlertCircle size={18} />}>
            {errorMessage}
          </Alert>
        )}

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel} disabled={saving}>
            Avbryt
          </Button>
          <Button color="sage" onClick={handleCreate} loading={saving}>
            Legg til
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
