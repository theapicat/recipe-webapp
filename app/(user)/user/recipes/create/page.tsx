"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Button,
  ActionIcon,
  SimpleGrid,
  Divider,
  Image,
  Alert,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconClock,
  IconInfoCircle,
  IconCheck,
  IconPhoto,
} from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

interface IngredientInput {
  id: string;
  name: string;
  amount: number | "";
  unit: string;
}

interface StepInput {
  id: string;
  stepNumber: number;
  instruction: string;
  suggestedTimerMinutes?: number | "";
}

interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  prepTimeMinutes: number | "";
  cookTimeMinutes: number | "";
  servings: number;
  image: string;
  ingredients: IngredientInput[];
  steps: StepInput[];
}

// Tomme startverdier for ny oppskrift
const initialFormState: RecipeFormData = {
  title: "",
  description: "",
  category: "Middag",
  prepTimeMinutes: "",
  cookTimeMinutes: "",
  servings: 4,
  image: "",
  ingredients: [{ id: "ing-1", name: "", amount: "", unit: "g" }],
  steps: [
    {
      id: "step-1",
      stepNumber: 1,
      instruction: "",
      suggestedTimerMinutes: "",
    },
  ],
};

export default function RecipeCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<RecipeFormData>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  // --- INGREDIENS-HÅNDTERING ---
  const handleIngredientChange = (
    index: number,
    field: keyof IngredientInput,
    value: string | number
  ) => {
    setForm((prev) => {
      const updated = [...prev.ingredients];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ingredients: updated };
    });
  };

  const addIngredient = () => {
    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: `ing-${Date.now()}`, name: "", amount: "", unit: "g" },
      ],
    }));
  };

  const removeIngredient = (index: number) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // --- STEG-HÅNDTERING ---
  const handleStepChange = (
    index: number,
    field: keyof StepInput,
    value: string | number
  ) => {
    setForm((prev) => {
      const updated = [...prev.steps];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, steps: updated };
    });
  };

  const addStep = () => {
    setForm((prev) => {
      const nextStepNum = prev.steps.length + 1;
      return {
        ...prev,
        steps: [
          ...prev.steps,
          {
            id: `step-${Date.now()}`,
            stepNumber: nextStepNum,
            instruction: "",
            suggestedTimerMinutes: "",
          },
        ],
      };
    });
  };

  const removeStep = (index: number) => {
    setForm((prev) => {
      const updated = prev.steps.filter((_, i) => i !== index);
      const reindexed = updated.map((step, idx) => ({
        ...step,
        stepNumber: idx + 1,
      }));
      return { ...prev, steps: reindexed };
    });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= form.steps.length) return;

    setForm((prev) => {
      const updated = [...prev.steps];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;

      const reindexed = updated.map((step, idx) => ({
        ...step,
        stepNumber: idx + 1,
      }));

      return { ...prev, steps: reindexed };
    });
  };

  // --- OPPRETTELSE / LAGRING ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      notifications.show({
        id: "recipe-created",
        title: "Oppskrift opprettet! 🎉",
        message: `"${form.title}" er lagret i din private samling.`,
        color: "sage",
        icon: <IconCheck size={16} />,
      });
      router.push("/user/recipes");
    }, 600);
  };

  return (
    <AsyncMainContainer size="md" py={30}>
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* INFORMASJONSVARSEL */}
          <Alert
            color="terracotta"
            variant="light"
            title="✨ Ny Egen Oppskrift"
            icon={<IconInfoCircle size={20} />}
            radius="md"
          >
            Legg inn din egen favorittoppskrift helt fra bunnen. Alt du registrerer lagres 100 % privat på din konto.
          </Alert>

          {/* HEADER MED AVBRYT OG LAGRE-KNAPP */}
          <Group justify="space-between" align="center">
            <Button
              component={Link}
              href="/user/recipes"
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
            >
              Avbryt
            </Button>

            <Group gap="xs">
              <Button
                type="submit"
                color="sage"
                leftSection={<IconDeviceFloppy size={18} />}
                loading={isSaving}
              >
                Opprett Oppskrift
              </Button>
            </Group>
          </Group>

          {/* HOVEDINFORMASJON */}
          <Paper p="lg" radius="md" withBorder shadow="xs">
            <Stack gap="md">
              <Title order={3} size="h4">
                Grunnleggende Informasjon
              </Title>
              <Divider />

              <TextInput
                label="Oppskriftens tittel"
                placeholder="f.eks. Bestemors Kjøttkaker"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
                required
              />

              <Textarea
                label="Kort beskrivelse"
                placeholder="Skriv en kort introduksjon eller tips til retten..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
                rows={3}
              />

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Select
                  label="Kategori"
                  data={["Middag", "Frokost & Lunsj", "Dessert & Bakst", "Tilbehør", "Snacks"]}
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val || "Middag" })}
                />

                <NumberInput
                  label="Forberedelsestid (min)"
                  placeholder="15"
                  leftSection={<IconClock size={16} />}
                  value={form.prepTimeMinutes}
                  onChange={(val) => setForm({ ...form, prepTimeMinutes: Number(val) || "" })}
                  min={0}
                />

                <NumberInput
                  label="Koke-/Steketid (min)"
                  placeholder="20"
                  leftSection={<IconClock size={16} />}
                  value={form.cookTimeMinutes}
                  onChange={(val) => setForm({ ...form, cookTimeMinutes: Number(val) || "" })}
                  min={0}
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <NumberInput
                  label="Standard porsjoner"
                  value={form.servings}
                  onChange={(val) => setForm({ ...form, servings: Number(val) || 1 })}
                  min={1}
                  max={50}
                  required
                />

                <TextInput
                  label="Bilde-URL (Valgfritt)"
                  placeholder="https://images.unsplash.com/..."
                  leftSection={<IconPhoto size={16} />}
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.currentTarget.value })}
                />
              </SimpleGrid>

              {/* FORHÅNDSVISNING AV BILDE */}
              {form.image && (
                <Stack gap="xs">
                  <Text size="xs" c="dimmed">
                    Forhåndsvisning av bilde:
                  </Text>
                  <Paper radius="md" withBorder style={{ overflow: "hidden", maxWidth: 300 }}>
                    <Image src={form.image} height={140} alt="Forhåndsvisning" />
                  </Paper>
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* INGREDIENSER */}
          <Paper p="lg" radius="md" withBorder shadow="xs">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <div>
                  <Title order={3} size="h4">
                    Ingredienser
                  </Title>
                  <Text size="xs" c="dimmed">
                    Oppgi mengde, enhet og råvare
                  </Text>
                </div>

                <Button
                  variant="light"
                  color="sage"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={addIngredient}
                >
                  Legg til ingrediens
                </Button>
              </Group>

              <Divider />

              <Stack gap="xs">
                {form.ingredients.map((ing, idx) => (
                  <Group key={ing.id} gap="xs" align="flex-start" wrap="nowrap">
                    <NumberInput
                      placeholder="Mengde"
                      value={ing.amount}
                      onChange={(val) => handleIngredientChange(idx, "amount", Number(val) || "")}
                      style={{ width: 100 }}
                      min={0}
                      decimalScale={2}
                    />

                    <Select
                      placeholder="Enhet"
                      data={["g", "kg", "stk", "dl", "l", "ss", "ts", "klype", "pakke", "boks"]}
                      value={ing.unit}
                      onChange={(val) => handleIngredientChange(idx, "unit", val || "stk")}
                      style={{ width: 90 }}
                    />

                    <TextInput
                      placeholder="Ingrediensnavn (f.eks. Hvetemel)"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(idx, "name", e.currentTarget.value)}
                      style={{ flex: 1 }}
                      required
                    />

                    <ActionIcon
                      color="red"
                      variant="subtle"
                      size="lg"
                      onClick={() => removeIngredient(idx)}
                      disabled={form.ingredients.length <= 1}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Paper>

          {/* TRINNVIS FREMGANGSMÅTE */}
          <Paper p="lg" radius="md" withBorder shadow="xs">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <div>
                  <Title order={3} size="h4">
                    Fremgangsmåte
                  </Title>
                  <Text size="xs" c="dimmed">
                    Forklar stegene og legg eventuelt til en nedtellingstimer
                  </Text>
                </div>

                <Button
                  variant="light"
                  color="sage"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={addStep}
                >
                  Legg til steg
                </Button>
              </Group>

              <Divider />

              <Stack gap="md">
                {form.steps.map((step, idx) => (
                  <Paper key={step.id} p="sm" radius="md" withBorder bg="gray.0">
                    <Stack gap="xs">
                      <Group justify="space-between" align="center">
                        <Group gap="xs">
                          <ActionIcon color="sage" radius="xl" variant="filled" size="sm">
                            <Text fw={700} size="xs">
                              {step.stepNumber}
                            </Text>
                          </ActionIcon>
                          <Text fw={600} size="sm">
                            Steg {step.stepNumber}
                          </Text>
                        </Group>

                        <Group gap={4}>
                          <Tooltip label="Flytt opp">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              disabled={idx === 0}
                              onClick={() => moveStep(idx, "up")}
                            >
                              <IconArrowUp size={14} />
                            </ActionIcon>
                          </Tooltip>

                          <Tooltip label="Flytt ned">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              disabled={idx === form.steps.length - 1}
                              onClick={() => moveStep(idx, "down")}
                            >
                              <IconArrowDown size={14} />
                            </ActionIcon>
                          </Tooltip>

                          <ActionIcon
                            color="red"
                            variant="subtle"
                            size="sm"
                            disabled={form.steps.length <= 1}
                            onClick={() => removeStep(idx)}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      <Textarea
                        placeholder="Forklar hva som skal gjøres i dette steget..."
                        value={step.instruction}
                        onChange={(e) => handleStepChange(idx, "instruction", e.currentTarget.value)}
                        rows={2}
                        required
                      />

                      <Group align="center" gap="xs">
                        <NumberInput
                          placeholder="Timer i minutter (valgfritt)"
                          leftSection={<IconClock size={14} />}
                          value={step.suggestedTimerMinutes}
                          onChange={(val) =>
                            handleStepChange(idx, "suggestedTimerMinutes", Number(val) || "")
                          }
                          size="xs"
                          min={1}
                          style={{ width: 220 }}
                        />
                        <Text size="xs" c="dimmed">
                          Genererer nedtellingsur i kokkemodus
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>

          {/* BUNNBAR */}
          <Group justify="flex-end" gap="sm" mt="md">
            <Button component={Link} href="/user/recipes" variant="default">
              Avbryt
            </Button>
            <Button
              type="submit"
              color="sage"
              leftSection={<IconDeviceFloppy size={18} />}
              loading={isSaving}
            >
              Opprett Oppskrift
            </Button>
          </Group>
        </Stack>
      </form>
    </AsyncMainContainer>
  );
}