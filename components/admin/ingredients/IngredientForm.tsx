"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  Accordion,
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconLock, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  countMeasuredNutrients,
  createIngredientValidators,
  formValuesToRequest,
  IngredientFormValues,
  verifyBlockedReason,
} from "@/components/admin/ingredients/ingredientForm";
import { IngredientLookups } from "@/components/admin/ingredients/ingredientLookups";
import { groupNutrients } from "@/lib/nutrients/nutrientGrouping";
import { norwegianNumberProps } from "@/components/forms/common/numberInputProps";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";
import { unitsOfType, unitTypeId, WEIGHT_UNIT_TYPE } from "@/lib/units/unitTypeInfo";
import { capitalize } from "@/lib/text/names";

interface IngredientFormProps {
  mode: "create" | "edit";
  /** Kun ved redigering: ingrediensen som lagres over (PUT). */
  ingredientId?: string;
  initialValues: IngredientFormValues;
  lookups: IngredientLookups;
  onSaved: (ingredient: Ingredient) => void;
  onCancel: () => void;
  /** Meldes til drawer-en, som spør om forkasting hvis brukeren prøver å gå bort med ulagrede endringer. */
  onDirtyChange: (dirty: boolean) => void;
  /** Offisiell ingrediens: kildedata (navn, energi, spiselig del, næringsverdier, kilde) er låst. Se ingredientForm.ts. */
  official?: boolean;
  /** Snarvei fra låse-varselet: opprett en variant (egen, fullt redigerbar) av denne ingrediensen. */
  onCreateVariant?: () => void;
}

const options = (items: { id: string; name: string }[]) =>
  items.map((item) => ({ value: item.id, label: capitalize(item.name) }));

// Opprett/rediger en ingrediens (alle felt: grunndata, allergener, søkeord, kilde/variant, porsjoner og næringsverdier).
// Backend erstatter ALT ved PUT, så skjemaet sender alltid hele settet. Valideringen speiler backend og legger på
// det backend ikke sjekker ennå (se ingredientForm.ts). Verifisering krever næringsverdier. Handlingene (verifisert, avbryt,
// lagre) ligger i en fast linje øverst, så man slipper å scrolle ned i det lange skjemaet for å lagre eller avbryte.
export const IngredientForm = ({
  mode,
  ingredientId,
  initialValues,
  lookups,
  onSaved,
  onCancel,
  onDirtyChange,
  official = false,
  onCreateVariant,
}: IngredientFormProps) => {
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  // Valgt enhetstype per porsjonsrad, FØR en enhet er valgt (rad-nøkkel -> enhetstype-id). Selve porsjonen lagrer
  // bare unitId, så dette er ren UI-state for det to-stegs valget (type -> enhet) under, ikke en del av skjemaet.
  const [portionUnitTypeByKey, setPortionUnitTypeByKey] = useState<Record<string, string | null>>(
    {},
  );
  const weightTypeId = unitTypeId(lookups.unitTypes, WEIGHT_UNIT_TYPE);

  const form = useForm<IngredientFormValues>({
    mode: "controlled",
    initialValues,
    validate: createIngredientValidators({
      ingredients: lookups.ingredients,
      units: lookups.units,
      ownId: ingredientId,
    }),
  });

  const dirty = form.isDirty();
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Standardenheten må høre til enhetstypen: bytter man type, nullstilles en enhet som ikke passer.
  form.watch("primaryUnitTypeId", ({ value }) => {
    const unit = lookups.units.find((u) => u.id === form.getValues().defaultUnitId);
    if (unit && unit.unitTypeId !== value) form.setFieldValue("defaultUnitId", null);
  });

  const values = form.getValues();
  const locked = official;
  const measured = countMeasuredNutrients(values.nutrients);
  const verifyBlock = verifyBlockedReason(measured);
  const blocks = useMemo(() => groupNutrients(lookups.definitions), [lookups.definitions]);
  const definitionIndex = useMemo(
    () => new Map(lookups.definitions.map((definition, index) => [definition.id, index])),
    [lookups.definitions],
  );

  const primaryTypeUnits = lookups.units.filter((u) => u.unitTypeId === values.primaryUnitTypeId);

  const handleSubmit = async (submitted: IngredientFormValues) => {
    setSaving(true);
    setErrorMessage(undefined);

    try {
      const request = formValuesToRequest(submitted);
      const res =
        mode === "edit"
          ? await agentInternal.put<Ingredient>(`/api/admin/ingredients/${ingredientId}`, request)
          : await agentInternal.post<Ingredient>("/api/admin/ingredients", request);
      const data: Partial<HttpResponse<Ingredient>> = await res.json().catch(() => ({}));

      if (res.ok && data.body) {
        notifications.show({
          title: mode === "edit" ? "Endringene er lagret" : "Ingrediensen er opprettet",
          message: `«${capitalize(data.body.name)}» ble lagret.`,
          color: "sage",
          icon: <IconCheck size={16} />,
        });
        onSaved(data.body);
      } else {
        setErrorMessage(data.message || "Kunne ikke lagre ingrediensen.");
      }
    } catch {
      setErrorMessage("Kunne ikke koble til serveren.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit, () =>
        setErrorMessage("Rett feilene som er markert i skjemaet, og prøv igjen."),
      )}
      noValidate
    >
      <Box
        bg="var(--mantine-color-body)"
        py="sm"
        mb="md"
        style={{
          position: "sticky",
          // Rett under skuffens topplinje (høyden måles i IngredientDrawer og deles som CSS-variabel).
          top: "var(--drawer-header-height, 60px)",
          zIndex: 2,
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Group justify="space-between" gap="md">
          <Switch
            label="Verifisert"
            description={
              verifyBlock && !values.isVerified
                ? verifyBlock
                : "Gjennomgått av admin. Krever næringsverdier."
            }
            disabled={saving || (verifyBlock !== null && !values.isVerified)}
            error={form.errors.isVerified}
            {...form.getInputProps("isVerified", { type: "checkbox" })}
          />
          <Group gap="sm">
            <Button variant="default" onClick={onCancel} disabled={saving}>
              Avbryt
            </Button>
            <Button type="submit" color="sage" loading={saving}>
              {mode === "edit" ? "Lagre" : "Opprett ingrediens"}
            </Button>
          </Group>
        </Group>
      </Box>

      <Stack gap="xl">
        {locked && (
          <Alert
            color="gray"
            variant="light"
            radius="md"
            title="Offisiell ingrediens"
            icon={<IconLock size={18} />}
          >
            <Text size="sm">
              Navn, energi, spiselig del, næringsverdier og kilde kommer fra det offentlige og er
              låst. Allergener, søkeord, kategori, enheter og porsjoner kan du fortsatt endre. Vil
              du endre en låst verdi, oppretter du en variant — den er din egen og fullt redigerbar.
            </Text>
            {onCreateVariant && (
              <Button size="xs" variant="light" mt="xs" onClick={onCreateVariant} disabled={saving}>
                Opprett variant
              </Button>
            )}
          </Alert>
        )}

        {errorMessage && (
          <Alert
            color="red"
            variant="light"
            radius="md"
            title="Feil"
            icon={<IconAlertCircle size={18} />}
          >
            {errorMessage}
          </Alert>
        )}

        <Stack gap="md">
          <Text fw={600}>Grunndata</Text>
          <TextInput
            label="Navn"
            required
            withAsterisk
            disabled={saving || locked}
            rightSection={locked ? <IconLock size={14} /> : undefined}
            {...form.getInputProps("name")}
          />
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Select
              label="Kategori"
              placeholder="Velg kategori"
              data={options(lookups.categories)}
              searchable
              required
              withAsterisk
              disabled={saving}
              {...form.getInputProps("categoryId")}
            />
            <Select
              label="Enhetstype"
              placeholder="Velg type"
              data={options(lookups.unitTypes)}
              allowDeselect={false}
              required
              withAsterisk
              disabled={saving}
              {...form.getInputProps("primaryUnitTypeId")}
            />
            <Select
              label="Standardenhet"
              placeholder={values.primaryUnitTypeId ? "Velg enhet" : "Velg enhetstype først"}
              data={primaryTypeUnits.map((u) => ({
                value: u.id,
                label: `${capitalize(u.name)} (${u.abbreviation})`,
              }))}
              searchable
              allowDeselect={false}
              required
              withAsterisk
              disabled={saving || !values.primaryUnitTypeId}
              {...form.getInputProps("defaultUnitId")}
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <NumberInput
              label="Energi (kcal per 100 g)"
              required
              withAsterisk
              decimalScale={2}
              disabled={saving || locked}
              rightSection={locked ? <IconLock size={14} /> : undefined}
              {...norwegianNumberProps}
              {...form.getInputProps("energyKcal")}
            />
            <NumberInput
              label="Energi (kJ per 100 g)"
              decimalScale={2}
              disabled={saving || locked}
              rightSection={locked ? <IconLock size={14} /> : undefined}
              {...norwegianNumberProps}
              {...form.getInputProps("energyKj")}
            />
            <NumberInput
              label="Spiselig del (%)"
              description="Andel av varen som er spiselig"
              decimalScale={2}
              disabled={saving || locked}
              rightSection={locked ? <IconLock size={14} /> : undefined}
              {...norwegianNumberProps}
              {...form.getInputProps("ediblePartPercent")}
            />
          </SimpleGrid>
        </Stack>

        <Stack gap="md">
          <Text fw={600}>Allergener og søkeord</Text>
          <MultiSelect
            label="Allergener"
            description="Allergendata er ufullstendig i registeret: tomt betyr at ingenting er registrert, ikke at ingrediensen er fri for allergener."
            placeholder="Velg allergener"
            data={options(lookups.allergens)}
            searchable
            clearable
            disabled={saving}
            {...form.getInputProps("allergenIds")}
          />
          <MultiSelect
            label="Søkeord"
            placeholder="Søk etter søkeord"
            data={options(lookups.keywords)}
            searchable
            clearable
            limit={50}
            disabled={saving}
            {...form.getInputProps("searchKeywordIds")}
          />
        </Stack>

        <Stack gap="md">
          <Text fw={600}>Kilde og variant</Text>
          {locked ? (
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label="Kilde-id"
                disabled
                rightSection={<IconLock size={14} />}
                {...form.getInputProps("sourceId")}
              />
              <TextInput
                label="Kilde-URL"
                disabled
                rightSection={<IconLock size={14} />}
                {...form.getInputProps("sourceUrl")}
              />
            </SimpleGrid>
          ) : (
            // Kilde-id er forbeholdt offisielle (importerte) ingredienser — den avgjør at en ingrediens regnes som offisiell.
            <TextInput
              label="Kilde-URL (valgfri referanse)"
              placeholder="https://"
              disabled={saving}
              {...form.getInputProps("sourceUrl")}
            />
          )}
          <Select
            label="Variant av"
            description="Sett hvis dette er en variant av en annen ingrediens. Næringsdata følger ikke basen videre."
            placeholder="Ingen"
            data={options(lookups.ingredients.filter((i) => i.id !== ingredientId))}
            searchable
            clearable
            limit={50}
            disabled={saving || locked}
            {...form.getInputProps("variantOfIngredientId")}
          />
        </Stack>

        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Porsjoner</Text>
            <Button
              variant="light"
              size="xs"
              leftSection={<IconPlus size={14} />}
              disabled={saving}
              onClick={() =>
                form.insertListItem("portions", {
                  key: globalThis.crypto.randomUUID(),
                  unitId: null,
                  gramsPerPortion: "",
                })
              }
            >
              Legg til porsjon
            </Button>
          </Group>
          {values.portions.length === 0 ? (
            <Text size="sm" c="dimmed">
              Ingen porsjoner. Uten porsjoner kan mengder i andre enheter enn vekt ikke regnes om
              til gram.
            </Text>
          ) : (
            values.portions.map((portion, index) => {
              // Enhetstypen for raden: enten valgt lokalt (før en enhet er valgt), eller utledet fra enheten som
              // allerede er lagret (ved redigering av en eksisterende porsjon).
              const currentTypeId =
                portionUnitTypeByKey[portion.key] ??
                lookups.units.find((u) => u.id === portion.unitId)?.unitTypeId ??
                null;
              const unitOptions = unitsOfType(lookups.units, currentTypeId, weightTypeId).map(
                (u) => ({
                  value: u.id,
                  label: `${capitalize(u.name)} (${u.abbreviation})`,
                }),
              );

              return (
                <Group key={portion.key} align="flex-start" wrap="nowrap">
                  <Select
                    label={index === 0 ? "Enhetstype" : undefined}
                    aria-label="Enhetstype"
                    placeholder="Velg type"
                    data={lookups.unitTypes.map((t) => ({
                      value: t.id,
                      label: capitalize(t.name),
                    }))}
                    allowDeselect={false}
                    disabled={saving}
                    style={{ width: 140 }}
                    value={currentTypeId}
                    onChange={(value) => {
                      setPortionUnitTypeByKey((prev) => ({ ...prev, [portion.key]: value }));
                      form.setFieldValue(`portions.${index}.unitId`, null);
                    }}
                  />
                  <Select
                    label={index === 0 ? "Enhet" : undefined}
                    aria-label="Enhet"
                    placeholder={currentTypeId ? "Velg enhet" : "Velg enhetstype først"}
                    data={unitOptions}
                    searchable
                    allowDeselect={false}
                    disabled={saving || !currentTypeId}
                    style={{ flex: 1 }}
                    {...form.getInputProps(`portions.${index}.unitId`)}
                  />
                  <NumberInput
                    label={index === 0 ? "Gram (spiselig del)" : undefined}
                    aria-label="Gram"
                    decimalScale={2}
                    disabled={saving}
                    w={170}
                    {...norwegianNumberProps}
                    {...form.getInputProps(`portions.${index}.gramsPerPortion`)}
                  />
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label="Fjern porsjon"
                    mt={index === 0 ? 25 : 0}
                    disabled={saving}
                    onClick={() => form.removeListItem("portions", index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              );
            })
          )}
        </Stack>

        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Næringsverdier per 100 g</Text>
            <Text size="sm" c="dimmed">
              {measured} av {lookups.definitions.length} registrert
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {locked
              ? "Næringsverdiene er offisielle og låst."
              : "Tomt felt = ikke målt. 0 = målt til null."}
          </Text>
          <Accordion multiple variant="separated" defaultValue={blocks.map((b) => b.id)}>
            {blocks.map((block) => {
              const indexes = block.sections.flatMap((s) =>
                s.definitions.map((d) => definitionIndex.get(d.id) ?? 0),
              );
              const filled = indexes.filter((i) => values.nutrients[i]?.quantity !== "").length;

              return (
                <Accordion.Item key={block.id} value={block.id}>
                  <Accordion.Control>
                    <Group gap="xs">
                      {capitalize(block.name)}
                      <Badge size="sm" variant="light" color="sage">
                        {filled}/{indexes.length}
                      </Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="sm">
                      {block.sections.map((section) => (
                        <div key={section.subgroup?.id ?? "main"}>
                          {section.subgroup && (
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                              {section.subgroup.name}
                            </Text>
                          )}
                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                            {section.definitions.map((definition) => {
                              const index = definitionIndex.get(definition.id) ?? 0;
                              return (
                                <NumberInput
                                  key={definition.id}
                                  label={definition.name}
                                  size="xs"
                                  decimalScale={4}
                                  rightSection={
                                    <Text size="xs" c="dimmed" pr={6}>
                                      {definition.unit}
                                    </Text>
                                  }
                                  rightSectionWidth={52}
                                  disabled={saving || locked}
                                  {...norwegianNumberProps}
                                  {...form.getInputProps(`nutrients.${index}.quantity`)}
                                />
                              );
                            })}
                          </SimpleGrid>
                        </div>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Stack>
      </Stack>
    </form>
  );
};
