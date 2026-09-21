"use client";

import { CSSProperties, useState } from "react";
import {
  Alert,
  ActionIcon,
  Badge,
  Button,
  Center,
  Drawer,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useElementSize, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCopyPlus,
  IconDatabase,
  IconEdit,
  IconRosetteDiscountCheck,
  IconRosetteDiscountCheckOff,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { deleteBlockedReason } from "@/components/admin/catalog/deleteBlockedReason";
import { IngredientDetailView } from "@/components/admin/ingredients/IngredientDetailView";
import { IngredientForm } from "@/components/admin/ingredients/IngredientForm";
import {
  emptyIngredientFormValues,
  ingredientToFormValues,
  ingredientToRequest,
  isOfficialIngredient,
  verifyBlockedReason,
} from "@/components/admin/ingredients/ingredientForm";
import { IngredientLookups } from "@/components/admin/ingredients/ingredientLookups";
import { useIngredient } from "@/components/admin/ingredients/useIngredient";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";
import { capitalize } from "@/lib/text/names";

export type IngredientDrawerState =
  | { mode: "view"; id: string }
  | { mode: "edit"; id: string }
  | { mode: "create"; baseId: string | null };

interface IngredientDrawerProps {
  /** null = lukket. */
  state: IngredientDrawerState | null;
  onStateChange: (state: IngredientDrawerState | null) => void;
  /** Id-ene i rekkefølgen de vises i listen (filtrert og sortert) — til forrige/neste. */
  orderedIds: string[];
  lookups: IngredientLookups;
  /** Leser ingredienslisten på nytt etter en endring. */
  onChanged: () => void;
}

// Utvidet visning, redigering og oppretting av én ingrediensen i en bred skuff til høyre. Listen (med filtre og side)
// blir stående uendret bak, så admin kan gå fra ingrediens til ingrediens (forrige/neste) uten å miste plassen.
export const IngredientDrawer = ({
  state,
  onStateChange,
  orderedIds,
  lookups,
  onChanged,
}: IngredientDrawerProps) => {
  const isNarrow = useMediaQuery("(max-width: 48em)");
  // Skuffens topplinje er «sticky»; skjemaets handlingslinje festes rett under den, så høyden måles og deles som CSS-variabel.
  const { ref: headerRef, height: headerHeight } = useElementSize();

  // Innholdet beholdes gjennom lukke-animasjonen (state blir null før skuffen er borte).
  const [lastState, setLastState] = useState<IngredientDrawerState | null>(state);
  if (state && state !== lastState) setLastState(state);
  const current = state ?? lastState;

  const [dirty, setDirty] = useState(false);
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | undefined>();

  const ingredientId = current && current.mode !== "create" ? current.id : null;
  const { ingredient, loading, errorMessage, setIngredient, retry } = useIngredient(ingredientId);

  // Ulagrede endringer i skjemaet: spør før vi går bort (lukker, blar, bytter modus).
  const guard = (action: () => void) => (dirty ? setDiscardAction(() => action) : action());
  const go = (next: IngredientDrawerState | null) =>
    guard(() => {
      setDirty(false);
      setActionError(undefined);
      onStateChange(next);
    });

  const index = ingredientId ? orderedIds.indexOf(ingredientId) : -1;
  const goToIndex = (i: number) => go({ mode: "view", id: orderedIds[i] });

  const variantCount = ingredientId
    ? lookups.ingredients.filter((i) => i.variantOfIngredientId === ingredientId).length
    : 0;

  const saveVerified = async (isVerified: boolean) => {
    if (!ingredient) return;
    setBusy(true);
    setActionError(undefined);

    try {
      const res = await agentInternal.put<Ingredient>(
        `/api/admin/ingredients/${ingredient.id}`,
        ingredientToRequest(ingredient, { isVerified }),
      );
      const data: Partial<HttpResponse<Ingredient>> = await res.json().catch(() => ({}));

      if (res.ok && data.body) {
        setIngredient(data.body);
        onChanged();
        notifications.show({
          title: isVerified ? "Ingrediensen er verifisert" : "Verifiseringen er fjernet",
          message: `«${capitalize(data.body.name)}»`,
          color: "sage",
          icon: <IconCheck size={16} />,
        });
      } else {
        setActionError(data.message || "Kunne ikke oppdatere ingrediensen.");
      }
    } catch {
      setActionError("Kunne ikke koble til serveren.");
    } finally {
      setBusy(false);
    }
  };

  const handleSaved = (saved: Ingredient) => {
    setDirty(false);
    setIngredient(saved);
    onChanged();
    onStateChange({ mode: "view", id: saved.id });
  };

  const title =
    current?.mode === "create"
      ? "Ny ingrediens"
      : ingredient
        ? capitalize(ingredient.name)
        : "Ingrediens";

  const definitionsMissing = lookups.definitions.length === 0;

  const renderBody = () => {
    if (!current) return null;

    if (current.mode === "create") {
      return (
        <CreateContent
          baseId={current.baseId}
          lookups={lookups}
          definitionsMissing={definitionsMissing}
          onSaved={handleSaved}
          onCancel={() => go(null)}
          onDirtyChange={setDirty}
        />
      );
    }

    if (loading) {
      return (
        <Center mih={240}>
          <Loader color="sage" type="dots" />
        </Center>
      );
    }

    if (errorMessage || !ingredient) {
      return (
        <Alert color="red" variant="light" radius="md" title="Kunne ikke hente ingrediensen">
          <Group justify="space-between">
            <Text size="sm">{errorMessage}</Text>
            <Button size="xs" variant="light" color="red" onClick={retry}>
              Prøv igjen
            </Button>
          </Group>
        </Alert>
      );
    }

    if (current.mode === "edit") {
      return definitionsMissing ? (
        <NutrientsMissingAlert />
      ) : (
        <IngredientForm
          key={ingredient.id}
          mode="edit"
          ingredientId={ingredient.id}
          initialValues={ingredientToFormValues(ingredient, lookups.definitions)}
          lookups={lookups}
          onSaved={handleSaved}
          onCancel={() => go({ mode: "view", id: ingredient.id })}
          onDirtyChange={setDirty}
          official={isOfficialIngredient(ingredient)}
          onCreateVariant={() => go({ mode: "create", baseId: ingredient.id })}
        />
      );
    }

    const verifyBlock = ingredient.isVerified
      ? null
      : verifyBlockedReason(ingredient.nutrientValues.length);
    const deleteBlock = deleteBlockedReason({ usageCount: ingredient.usageCount, variantCount });

    return (
      <Stack gap="lg">
        <div>
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconEdit size={16} />}
              onClick={() => go({ mode: "edit", id: ingredient.id })}
            >
              Rediger
            </Button>
            {ingredient.isVerified ? (
              <Button
                variant="default"
                leftSection={<IconRosetteDiscountCheckOff size={16} />}
                loading={busy}
                onClick={() => saveVerified(false)}
              >
                Fjern verifisering
              </Button>
            ) : (
              <Button
                variant="light"
                color="sage"
                leftSection={<IconRosetteDiscountCheck size={16} />}
                loading={busy}
                disabled={verifyBlock !== null}
                onClick={() => saveVerified(true)}
              >
                Verifiser
              </Button>
            )}
            <Button
              variant="default"
              leftSection={<IconCopyPlus size={16} />}
              onClick={() => go({ mode: "create", baseId: ingredient.id })}
            >
              Opprett variant
            </Button>
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconTrash size={16} />}
              disabled={deleteBlock !== null}
              onClick={() => setDeleteOpen(true)}
            >
              Slett
            </Button>
          </Group>
          {(verifyBlock || deleteBlock) && (
            <Stack gap={2} mt="xs">
              {verifyBlock && (
                <Text size="xs" c="dimmed">
                  Verifiser: {verifyBlock}
                </Text>
              )}
              {deleteBlock && (
                <Text size="xs" c="dimmed">
                  Slett: {deleteBlock}
                </Text>
              )}
            </Stack>
          )}
        </div>

        {actionError && (
          <Alert
            color="red"
            variant="light"
            radius="md"
            title="Feil"
            icon={<IconAlertCircle size={18} />}
          >
            {actionError}
          </Alert>
        )}

        <IngredientDetailView
          ingredient={ingredient}
          lookups={lookups}
          onOpenIngredient={(id) => go({ mode: "view", id })}
        />
      </Stack>
    );
  };

  return (
    <>
      <Drawer.Root
        opened={state !== null}
        onClose={() => go(null)}
        position="right"
        size={isNarrow ? "100%" : 920}
        closeOnClickOutside={false}
      >
        <Drawer.Overlay />
        <Drawer.Content
          style={{ "--drawer-header-height": `${headerHeight || 60}px` } as CSSProperties}
        >
          <Drawer.Header ref={headerRef}>
            <Group justify="space-between" wrap="nowrap" style={{ flex: 1 }} gap="sm">
              <Group gap="xs" wrap="nowrap" miw={0}>
                <Drawer.Title fw={600} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {title}
                </Drawer.Title>
                {current?.mode !== "create" && ingredient && (
                  <Badge
                    variant="light"
                    color={ingredient.isVerified ? "sage" : "gray"}
                    leftSection={ingredient.isVerified ? <IconCheck size={12} /> : undefined}
                  >
                    {ingredient.isVerified ? "Verifisert" : "Ikke verifisert"}
                  </Badge>
                )}
                {current?.mode !== "create" && ingredient && (
                  <Badge
                    variant="outline"
                    color="gray"
                    leftSection={
                      isOfficialIngredient(ingredient) ? (
                        <IconDatabase size={12} />
                      ) : (
                        <IconUser size={12} />
                      )
                    }
                  >
                    {isOfficialIngredient(ingredient) ? "Offisiell" : "Egen"}
                  </Badge>
                )}
              </Group>
              {index >= 0 && current?.mode !== "create" && (
                <Group gap={4} wrap="nowrap">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Forrige ingrediens"
                    disabled={index === 0}
                    onClick={() => goToIndex(index - 1)}
                  >
                    <IconChevronLeft size={18} />
                  </ActionIcon>
                  <Text size="sm" c="dimmed" aria-label="Plassering i listen">
                    {index + 1} / {orderedIds.length}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    aria-label="Neste ingrediens"
                    disabled={index === orderedIds.length - 1}
                    onClick={() => goToIndex(index + 1)}
                  >
                    <IconChevronRight size={18} />
                  </ActionIcon>
                </Group>
              )}
            </Group>
            <Drawer.CloseButton aria-label="Lukk" />
          </Drawer.Header>
          <Drawer.Body>{renderBody()}</Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>

      <DeleteConfirmModal
        opened={deleteOpen}
        name={ingredient ? capitalize(ingredient.name) : null}
        url={`/api/admin/ingredients/${ingredientId ?? ""}`}
        title="Slett ingrediens"
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          setDeleteOpen(false);
          setDirty(false);
          onStateChange(null);
          onChanged();
        }}
      />

      <Modal
        opened={discardAction !== null}
        onClose={() => setDiscardAction(null)}
        title="Forkaste endringene?"
        // Escape er av: dialogen åpnes av selve Escape-trykket (skuffens onClose), og dens egen Escape-håndtering fanget
        // det samme tastetrykket og lukket den igjen umiddelbart — så Escape med ulagrede endringer gjorde ingenting.
        // Man velger med knappene (og et utilsiktet dobbelt-Escape forkaster dermed heller ikke noe).
        closeOnEscape={false}
        centered
        radius="md"
      >
        <Text size="sm">Du har ulagrede endringer som går tapt hvis du fortsetter.</Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setDiscardAction(null)}>
            Fortsett redigering
          </Button>
          <Button
            color="red"
            onClick={() => {
              const action = discardAction;
              setDiscardAction(null);
              action?.();
            }}
          >
            Forkast
          </Button>
        </Group>
      </Modal>
    </>
  );
};

const NutrientsMissingAlert = () => (
  <Alert color="red" variant="light" radius="md" title="Næringsstoffene er ikke lastet">
    <Text size="sm">
      Næringsstoffkatalogen kunne ikke hentes, så ingrediensen kan ikke redigeres akkurat nå. Last
      siden på nytt.
    </Text>
  </Alert>
);

interface CreateContentProps {
  baseId: string | null;
  lookups: IngredientLookups;
  definitionsMissing: boolean;
  onSaved: (ingredient: Ingredient) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

// Ny ingrediens: enten fra bunnen av, eller avledet fra en eksisterende (en variant). Velger man en mal, fylles skjemaet
// ut fra den (backend kopierer ikke selv) og `variantOfIngredientId` settes.
const CreateContent = ({
  baseId: initialBaseId,
  lookups,
  definitionsMissing,
  onSaved,
  onCancel,
  onDirtyChange,
}: CreateContentProps) => {
  const [baseId, setBaseId] = useState<string | null>(initialBaseId);
  const { ingredient: base, loading, errorMessage } = useIngredient(baseId);

  if (definitionsMissing) return <NutrientsMissingAlert />;

  return (
    <Stack gap="lg">
      <Select
        label="Basert på eksisterende ingrediens (valgfritt)"
        description="Fyller ut skjemaet fra en eksisterende ingrediens og markerer den nye som en variant. Å velge en mal fyller ut skjemaet på nytt."
        placeholder="Start fra bunnen av"
        data={lookups.ingredients.map((i) => ({ value: i.id, label: capitalize(i.name) }))}
        value={baseId}
        onChange={setBaseId}
        searchable
        clearable
        limit={50}
      />

      {errorMessage && (
        <Alert color="red" variant="light" radius="md" title="Kunne ikke hente malen">
          {errorMessage}
        </Alert>
      )}

      {loading ? (
        <Center mih={160}>
          <Loader color="sage" type="dots" />
        </Center>
      ) : (
        <IngredientForm
          key={base?.id ?? "empty"}
          mode="create"
          initialValues={
            base
              ? ingredientToFormValues(base, lookups.definitions, { asVariantOf: true })
              : emptyIngredientFormValues(lookups.definitions)
          }
          lookups={lookups}
          onSaved={onSaved}
          onCancel={onCancel}
          onDirtyChange={onDirtyChange}
        />
      )}
    </Stack>
  );
};
