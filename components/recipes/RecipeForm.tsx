"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  Alert,
  Button,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle, IconArrowLeft, IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import Link from "next/link";
import {
  createRecipeValidators,
  formValuesToRequest,
  RecipeFormValues,
} from "@/components/recipes/recipeForm";
import { RecipeLookups } from "@/components/recipes/recipeLookups";
import { IngredientListEditor } from "@/components/recipes/IngredientListEditor";
import { StepListEditor } from "@/components/recipes/StepListEditor";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { Recipe } from "@/lib/models/recipes/Recipe";
import { capitalize } from "@/lib/text/names";

interface RecipeFormProps {
  mode: "create" | "edit";
  /** Kun ved redigering: oppskriften som lagres over (PUT). */
  recipeId?: string;
  initialValues: RecipeFormValues;
  lookups: RecipeLookups;
  /** Hvor «Avbryt» og et vellykket lagre skal navigere. */
  cancelHref: string;
}

// Opprett/rediger en oppskrift. Backend erstatter ALT ved PUT (se RecipeRequest), så skjemaet sender alltid hele
// settet. `RecipeSource.type`/`url` eies av serveren — skjemaet redigerer kun fritekst-referansen.
export const RecipeForm = ({
  mode,
  recipeId,
  initialValues,
  lookups,
  cancelHref,
}: RecipeFormProps) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const form = useForm<RecipeFormValues>({
    mode: "controlled",
    initialValues,
    validate: createRecipeValidators(),
  });

  const handleSubmit = async (values: RecipeFormValues) => {
    setSaving(true);
    setErrorMessage(undefined);

    try {
      const request = formValuesToRequest(values);
      const res =
        mode === "edit"
          ? await agentInternal.put<Recipe>(`/api/user/recipes/${recipeId}`, request)
          : await agentInternal.post<Recipe>("/api/user/recipes", request);
      const data: Partial<HttpResponse<Recipe>> = await res.json().catch(() => ({}));

      if (res.ok && data.body) {
        notifications.show({
          title: mode === "edit" ? "Endringene er lagret" : "Oppskriften er opprettet",
          message: `«${data.body.title}» ble lagret.`,
          color: "sage",
          icon: <IconCheck size={16} />,
        });
        router.push(`/user/recipes/${data.body.id}`);
      } else {
        setErrorMessage(data.message || "Kunne ikke lagre oppskriften.");
      }
    } catch {
      setErrorMessage("Kunne ikke koble til serveren.");
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = lookups.categories.map((category) => ({
    value: category.id,
    label: capitalize(category.name),
  }));

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit, () =>
        setErrorMessage("Rett feilene som er markert i skjemaet, og prøv igjen."),
      )}
      noValidate
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href={cancelHref}
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
          >
            Avbryt
          </Button>
          <Button
            type="submit"
            color="sage"
            leftSection={<IconDeviceFloppy size={18} />}
            loading={saving}
          >
            {mode === "edit" ? "Lagre endringer" : "Opprett oppskrift"}
          </Button>
        </Group>

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

        <Paper p="lg" radius="md" withBorder shadow="xs">
          <Stack gap="md">
            <Text fw={600}>Grunnleggende informasjon</Text>
            <Divider />

            <TextInput
              label="Tittel"
              placeholder="f.eks. Bestemors kjøttkaker"
              required
              withAsterisk
              disabled={saving}
              {...form.getInputProps("title")}
            />

            <Textarea
              label="Beskrivelse"
              placeholder="Skriv en kort introduksjon eller tips til retten..."
              required
              withAsterisk
              rows={3}
              disabled={saving}
              {...form.getInputProps("description")}
            />

            <Group grow align="flex-start">
              <Select
                label="Kategori"
                placeholder="Velg kategori"
                data={categoryOptions}
                searchable
                required
                withAsterisk
                disabled={saving}
                {...form.getInputProps("categoryId")}
              />
              <NumberInput
                label="Porsjoner"
                required
                withAsterisk
                min={1}
                max={1000}
                disabled={saving}
                {...form.getInputProps("servings")}
              />
            </Group>

            <Group grow align="flex-start">
              <TextInput
                label="Bilde-URL (valgfritt)"
                placeholder="https://..."
                disabled={saving}
                {...form.getInputProps("imageUrl")}
              />
              <TextInput
                label="Bildekreditering (valgfritt)"
                placeholder="f.eks. fotografnavn eller kilde"
                disabled={saving}
                {...form.getInputProps("imageAttribution")}
              />
            </Group>

            <TextInput
              label="Kilde (valgfritt)"
              placeholder="f.eks. en kokebok eller hvem oppskriften er fra"
              disabled={saving}
              {...form.getInputProps("sourceReference")}
            />
          </Stack>
        </Paper>

        <Paper p="lg" radius="md" withBorder shadow="xs">
          <IngredientListEditor form={form} lookups={lookups} disabled={saving} />
        </Paper>

        <Paper p="lg" radius="md" withBorder shadow="xs">
          <StepListEditor form={form} disabled={saving} />
        </Paper>

        <Group justify="flex-end" gap="sm">
          <Button component={Link} href={cancelHref} variant="default" disabled={saving}>
            Avbryt
          </Button>
          <Button
            type="submit"
            color="sage"
            leftSection={<IconDeviceFloppy size={18} />}
            loading={saving}
          >
            {mode === "edit" ? "Lagre endringer" : "Opprett oppskrift"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
