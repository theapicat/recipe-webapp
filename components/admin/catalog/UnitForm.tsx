"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { AppFormProvider } from "@/components/forms/common/FormContext";
import { CreateFormContainer } from "@/components/forms/common/CreateFormContainer";
import { EditFormContainer } from "@/components/forms/common/EditFormContainer";
import { FormField } from "@/components/forms/common/FormField";
import { toWritable } from "@/components/admin/catalog/catalogPayload";
import { validateAbbreviation, validateName } from "@/components/admin/catalog/catalogValidation";
import {
  BASE_UNIT_BY_TYPE,
  COUNT_UNIT_TYPE,
  formatRatio,
} from "@/components/admin/catalog/unitTypeInfo";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { Unit } from "@/lib/models/units/Unit";
import { UnitType } from "@/lib/models/units/UnitType";
import { capitalize } from "@/lib/text/names";

interface UnitFormProps {
  /** Enheten som redigeres, eller null for en ny. */
  item: Unit | null;
  /** Alle enheter — brukes til å avvise duplikate navn og forkortelser før noe sendes. */
  existing: Unit[];
  unitTypes: UnitType[];
  onSaved: () => void;
}

interface UnitFormValues {
  name: string;
  abbreviation: string;
  unitTypeId: string | null;
  // NumberInput gir tall, eller "" mens feltet er tomt.
  baseUnitRatio: number | string;
}

// Opprett/rediger enhet. Backend validerer kun navn og fremmednøkler — forkortelse, enhetstype og forholdstall
// (må være > 0; alltid 1 for «antall») valideres derfor her.
export const UnitForm = ({ item, existing, unitTypes, onSaved }: UnitFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const form = useForm<UnitFormValues>({
    mode: "controlled",
    initialValues: {
      name: item ? capitalize(item.name) : "",
      abbreviation: item?.abbreviation ?? "",
      unitTypeId: item?.unitTypeId ?? null,
      baseUnitRatio: item?.baseUnitRatio ?? "",
    },
    validate: {
      name: (value) => validateName(value, existing, item?.id),
      abbreviation: (value) => validateAbbreviation(value, existing, item?.id),
      unitTypeId: (value) => (value ? null : "Velg enhetstype"),
      baseUnitRatio: (value) =>
        typeof value === "number" && value > 0 ? null : "Forholdstallet må være større enn 0",
    },
  });

  // «antall»-enheter omregnes ikke: forholdstallet er alltid 1 (feltet låses under).
  const countTypeId = unitTypes.find((type) => type.name === COUNT_UNIT_TYPE)?.id;
  form.watch("unitTypeId", ({ value }) => {
    if (value && value === countTypeId) form.setFieldValue("baseUnitRatio", 1);
  });

  const values = form.getValues();
  const selectedType = unitTypes.find((type) => type.id === values.unitTypeId);
  const isCountType = selectedType?.name === COUNT_UNIT_TYPE;
  const baseUnit = selectedType ? BASE_UNIT_BY_TYPE[selectedType.name] : undefined;
  const abbreviation = values.abbreviation.trim();

  let ratioHint = "Velg enhetstype først.";
  if (isCountType) {
    ratioHint = "Antall-enheter omregnes ikke — forholdstallet er alltid 1.";
  } else if (baseUnit) {
    ratioHint =
      typeof values.baseUnitRatio === "number" && abbreviation
        ? `1 ${abbreviation} = ${formatRatio(values.baseUnitRatio)} ${baseUnit}`
        : `Hvor mange ${baseUnit} én enhet tilsvarer (f.eks. 1 dl = 100 ml).`;
  }

  const handleSubmit = async (submitted: UnitFormValues) => {
    const payload: Omit<Unit, "id"> = {
      name: submitted.name.trim(),
      abbreviation: submitted.abbreviation.trim(),
      unitTypeId: submitted.unitTypeId ?? "",
      baseUnitRatio: Number(submitted.baseUnitRatio),
    };

    setLoading(true);
    setErrorMessage(undefined);

    try {
      const res = item
        ? await agentInternal.put("/api/admin/units", { ...toWritable(item), ...payload })
        : await agentInternal.post("/api/admin/units", payload);

      if (res.ok) {
        notifications.show({
          title: item ? "Endringen er lagret" : "Enheten er opprettet",
          message: `«${payload.name}» ble lagret.`,
          color: "sage",
          icon: <IconCheck size={16} />,
        });
        onSaved();
      } else {
        const data: Partial<HttpResponse> = await res.json().catch(() => ({}));
        setErrorMessage(data.message || "Kunne ikke lagre enheten.");
      }
    } catch {
      setErrorMessage("Kunne ikke koble til serveren.");
    } finally {
      setLoading(false);
    }
  };

  const fields = (
    <>
      <FormField
        name="name"
        label="Navn"
        placeholder="f.eks. Milliliter"
        required
        disabled={loading}
      />
      <FormField
        name="abbreviation"
        label="Forkortelse"
        placeholder="f.eks. ml"
        span={6}
        required
        disabled={loading}
      />
      <FormField
        name="unitTypeId"
        label="Enhetstype"
        type="select"
        placeholder="Velg type"
        data={unitTypes.map((type) => ({ value: type.id, label: capitalize(type.name) }))}
        span={6}
        required
        disabled={loading}
      />
      <FormField
        name="baseUnitRatio"
        label="Forholdstall"
        type="number"
        decimalScale={10}
        required
        disabled={loading || isCountType}
        extra={
          <Text size="xs" c="dimmed" mt={4}>
            {ratioHint}
          </Text>
        }
      />
    </>
  );

  // Å endre forholdstallet eller typen endrer næringsberegningen for alle eksisterende oppskrifter som bruker enheten.
  const changesConversion =
    item !== null &&
    (Number(values.baseUnitRatio) !== item.baseUnitRatio || values.unitTypeId !== item.unitTypeId);

  return (
    <AppFormProvider form={form}>
      {item ? (
        <EditFormContainer
          bare
          title="Rediger enhet"
          submitText="Lagre"
          onSubmit={form.onSubmit(handleSubmit)}
          loading={loading}
          errorMessage={errorMessage}
          confirmMessage={
            changesConversion
              ? "Du endrer hvordan enheten regnes om. Det endrer næringsberegningen for alle oppskrifter som bruker enheten. Vil du lagre endringene?"
              : undefined
          }
        >
          {fields}
        </EditFormContainer>
      ) : (
        <CreateFormContainer
          bare
          title="Ny enhet"
          submitText="Legg til"
          onSubmit={form.onSubmit(handleSubmit)}
          loading={loading}
          errorMessage={errorMessage}
        >
          {fields}
        </CreateFormContainer>
      )}
    </AppFormProvider>
  );
};
