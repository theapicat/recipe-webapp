"use client";

import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconArrowDown, IconArrowUp, IconClock, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  emptyStepRow,
  MAX_STEPS,
  MIN_STEPS,
  RecipeFormValues,
} from "@/components/recipes/recipeForm";
import { norwegianNumberProps } from "@/components/forms/common/numberInputProps";

interface StepListEditorProps {
  form: UseFormReturnType<RecipeFormValues>;
  disabled?: boolean;
}

// Trinnvis fremgangsmåte: beskrivelse + valgfri timer, med flytt opp/ned (stegnummer settes av rekkefølgen).
export const StepListEditor = ({ form, disabled = false }: StepListEditorProps) => {
  const steps = form.getValues().steps;

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    form.reorderListItem("steps", { from: index, to: target });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <div>
          <Text fw={600}>Fremgangsmåte</Text>
          <Text size="xs" c="dimmed">
            Minst {MIN_STEPS} steg, maks {MAX_STEPS}
          </Text>
        </div>
        <Button
          variant="light"
          color="sage"
          size="xs"
          leftSection={<IconPlus size={14} />}
          disabled={disabled || steps.length >= MAX_STEPS}
          onClick={() => form.insertListItem("steps", emptyStepRow())}
        >
          Legg til steg
        </Button>
      </Group>

      <Stack gap="sm">
        {steps.map((step, index) => (
          <Paper key={step.key} p="sm" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ActionIcon color="sage" radius="xl" variant="filled" size="sm" aria-hidden>
                    <Text fw={700} size="xs">
                      {index + 1}
                    </Text>
                  </ActionIcon>
                  <Text fw={600} size="sm">
                    Steg {index + 1}
                  </Text>
                </Group>
                <Group gap={4}>
                  <Tooltip label="Flytt opp">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      disabled={disabled || index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <IconArrowUp size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Flytt ned">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      disabled={disabled || index === steps.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <IconArrowDown size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    disabled={disabled || steps.length <= MIN_STEPS}
                    onClick={() => form.removeListItem("steps", index)}
                    aria-label="Fjern steg"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>

              <Textarea
                placeholder="Forklar hva som skal gjøres i dette steget..."
                rows={2}
                disabled={disabled}
                {...form.getInputProps(`steps.${index}.description`)}
              />

              <Group align="center" gap="xs">
                <NumberInput
                  placeholder="Timer i minutter (valgfritt)"
                  leftSection={<IconClock size={14} />}
                  size="xs"
                  min={0}
                  max={10080}
                  disabled={disabled}
                  style={{ width: 220 }}
                  {...norwegianNumberProps}
                  {...form.getInputProps(`steps.${index}.timerMinutes`)}
                />
                <Text size="xs" c="dimmed">
                  Valgfri nedtellingstimer for dette steget
                </Text>
              </Group>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
};
