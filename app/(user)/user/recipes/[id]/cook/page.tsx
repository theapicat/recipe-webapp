"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Button,
  ActionIcon,
  NumberInput,
  Checkbox,
  Progress,
  ThemeIcon,
  Drawer,
  Alert,
  RingProgress,
  Divider,
  Tooltip,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconChefHat,
  IconClock,
  IconListCheck,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
  IconPlayerPause,
  IconCheck,
  IconSun,
  IconSparkles,
  IconBellRinging,
  IconTrash,
  IconRotate,
} from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

// Syntetiserer et behagelig "pling" via nettleserens Web Audio API uten eksterne lydfiler
const playKitchenChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    // Gli fra D5 (587.33Hz) til A5 (880Hz) for et rent, lyst "pling"
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    console.error("Kunne ikke spille av lyd:", e);
  }
};

interface RecipeStep {
  stepNumber: number;
  instruction: string;
  suggestedTimerMinutes?: number;
}

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

interface CookModeRecipe {
  id: string;
  title: string;
  defaultServings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

interface StepTimer {
  stepNumber: number;
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

const mockCookRecipe: CookModeRecipe = {
  id: "rec-1",
  title: "Kremet Kyllinggryte med Paprika",
  defaultServings: 4,
  ingredients: [
    { id: "ing-1", name: "Kyllingfilet", amount: 600, unit: "g" },
    { id: "ing-2", name: "Rød paprika", amount: 2, unit: "stk" },
    { id: "ing-3", name: "Matfløte", amount: 3, unit: "dl" },
    { id: "ing-4", name: "Gul løk", amount: 1, unit: "stk" },
    { id: "ing-5", name: "Hvitløksfedd", amount: 2, unit: "stk" },
    { id: "ing-6", name: "Kyllingbuljong (utblandet)", amount: 2, unit: "dl" },
  ],
  steps: [
    {
      stepNumber: 1,
      instruction: "Skjær kyllingfilet i jevne strimler og finhakk løk, hvitløk og rød paprika.",
    },
    {
      stepNumber: 2,
      instruction:
        "Varm opp en stekepanne med litt olje eller smør på middels høy varme. Brun kyllingen i 5 minutter til den har fått fin stekeskorpe.",
      suggestedTimerMinutes: 5,
    },
    {
      stepNumber: 3,
      instruction:
        "Tilsett finkuttet løk og hvitløk i pannen. La det surre mykt sammen med kyllingen i ca. 2 minutter.",
      suggestedTimerMinutes: 2,
    },
    {
      stepNumber: 4,
      instruction:
        "Hell over utblandet kyllingbuljong og matfløte, og tilsett strimlet paprika. La gryten småkoke under lokk i 10 minutter til sausen tykner.",
      suggestedTimerMinutes: 10,
    },
    {
      stepNumber: 5,
      instruction:
        "Smak til med salt, nykvernet pepper og eventuelt litt frisk timian før servering. Bon appétit!",
    },
  ],
};

export default function RecipeCookPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params?.id as string;

  const [recipe] = useState<CookModeRecipe>(mockCookRecipe);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [servings, setServings] = useState<number>(mockCookRecipe.defaultServings);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Multi-timer tilstand (Nøkkel = stepNumber)
  const [timers, setTimers] = useState<Record<number, StepTimer>>({});

  // Skjerm Keep-Alive (Web Wake Lock API)
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Ingrediens-skuff (Drawer)
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const currentStep = recipe.steps[currentStepIndex];
  const totalSteps = recipe.steps.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const scaleRatio = servings / recipe.defaultServings;

  // Aktiver Web Wake Lock
  useEffect(() => {
    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          setIsWakeLockActive(true);
        } catch {
          setIsWakeLockActive(false);
        }
      }
    };

    requestWakeLock().then();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        });
      }
    };
  }, []);

  // Felles nedtellings-effekt for alle aktive timere
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        let hasChanges = false;
        const nextTimers = { ...prevTimers };

        Object.keys(nextTimers).forEach((keyStr) => {
          const stepNum = Number(keyStr);
          const timer = nextTimers[stepNum];

          if (timer && timer.isRunning) {
            hasChanges = true;
            if (timer.remainingSeconds > 1) {
              nextTimers[stepNum] = {
                ...timer,
                remainingSeconds: timer.remainingSeconds - 1,
              };
            } else {
              // Timer ferdig
              nextTimers[stepNum] = {
                ...timer,
                remainingSeconds: 0,
                isRunning: false,
              };

              // Spill av lyd
              playKitchenChime();

              // Unngå duplikater ved å bruke eksplisitt notification ID
              notifications.show({
                id: `timer-done-${stepNum}`,
                title: `⏰ Timer for Steg ${stepNum} er ferdig!`,
                message: `Tiden er ute for dette steget i ${recipe.title}.`,
                color: "orange",
                icon: <IconBellRinging size={20} />,
                autoClose: false,
              });
            }
          }
        });

        return hasChanges ? nextTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [recipe.title]);

  // --- TIMER HANDSKER ---
  const handleStartTimer = (stepNum: number, minutes: number) => {
    const totalSecs = minutes * 60;
    setTimers((prev) => ({
      ...prev,
      [stepNum]: {
        stepNumber: stepNum,
        initialSeconds: totalSecs,
        remainingSeconds: totalSecs,
        isRunning: true,
      },
    }));
  };

  const handleTogglePause = (stepNum: number) => {
    setTimers((prev) => {
      const existing = prev[stepNum];
      if (!existing) return prev;
      return {
        ...prev,
        [stepNum]: {
          ...existing,
          isRunning: !existing.isRunning,
        },
      };
    });
  };

  const handleResetTimer = (stepNum: number) => {
    setTimers((prev) => {
      const existing = prev[stepNum];
      if (!existing) return prev;
      return {
        ...prev,
        [stepNum]: {
          ...existing,
          remainingSeconds: existing.initialSeconds,
          isRunning: false,
        },
      };
    });
  };

  const handleDeleteTimer = (stepNum: number) => {
    setTimers((prev) => {
      const existing = prev[stepNum];
      if (existing && existing.isRunning) return prev;

      const updated = { ...prev };
      delete updated[stepNum];
      return updated;
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeTimerList = Object.values(timers);
  const currentStepTimer = timers[currentStep.stepNumber];

  return (
    <AsyncMainContainer size="lg" py={20}>
      <Stack gap="lg">
        {/* TOPP-LINJE FOR KOKKEMODUS */}
        <Paper
          p="md"
          radius="md"
          withBorder
          bg="light-dark(var(--mantine-color-sage-0), var(--mantine-color-dark-6))"
          style={{
            borderColor: "light-dark(var(--mantine-color-sage-2), var(--mantine-color-dark-4))"
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Button
                component={Link}
                href={`/user/recipes/${recipeId}`}
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={16} />}
                size="sm"
              >
                Avslutt Kokkemodus
              </Button>
              <Badge color="sage" variant="filled" size="lg" leftSection={<IconChefHat size={14} />}>
                Kokkemodus
              </Badge>
            </Group>

            <Group gap="md">
              <Badge
                color={isWakeLockActive ? "sage" : "gray"}
                variant="light"
                leftSection={<IconSun size={14} />}
              >
                {isWakeLockActive ? "Skjerm på" : "Standard skjerm"}
              </Badge>

              <Button
                variant="outline"
                color="sage"
                size="xs"
                leftSection={<IconListCheck size={16} />}
                onClick={openDrawer}
              >
                Vis Ingredienser
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* TITTEL & PORSJONER */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>{recipe.title}</Title>
            <Text size="sm" c="dimmed">
              Steg {currentStepIndex + 1} av {totalSteps}
            </Text>
          </div>

          <Group gap="xs">
            <Text size="sm" fw={500}>
              Porsjoner:
            </Text>
            <NumberInput
              value={servings}
              onChange={(val) => setServings(Number(val) || 1)}
              min={1}
              max={20}
              size="xs"
              style={{ width: 70 }}
            />
          </Group>
        </Group>

        {/* FREMDRIFTSLINJE */}
        <Progress value={progressPercent} color="sage" size="md" radius="xl" animated />

        {/* GLOBALE AKTIVE TIMER-OVERSIKT */}
        {activeTimerList.length > 0 && (
          <Paper p="md" radius="md" withBorder bg="orange.0" style={{ borderColor: "var(--mantine-color-orange-3)" }}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconClock size={18} color="var(--mantine-color-orange-7)" />
                  <Text fw={700} size="sm" c="orange.9">
                    Aktive timere i bakgrunnen ({activeTimerList.length})
                  </Text>
                </Group>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                {activeTimerList.map((t) => (
                  <Paper key={t.stepNumber} p="xs" radius="sm" withBorder bg="white">
                    <Group justify="space-between" align="center">
                      <div>
                        <Text size="xs" fw={700} c="dimmed">
                          Steg {t.stepNumber}
                        </Text>
                        <Text fw={800} size="md" style={{ fontFamily: "monospace" }}>
                          {formatTimer(t.remainingSeconds)}
                        </Text>
                      </div>

                      <Group gap={4}>
                        <ActionIcon
                          color="orange"
                          size="md"
                          variant="light"
                          onClick={() => handleTogglePause(t.stepNumber)}
                        >
                          {t.isRunning ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
                        </ActionIcon>

                        <ActionIcon
                          color="gray"
                          size="md"
                          variant="subtle"
                          onClick={() => handleResetTimer(t.stepNumber)}
                        >
                          <IconRotate size={14} />
                        </ActionIcon>

                        <Tooltip
                          label={t.isRunning ? "Pause timeren for å slette" : "Fjern timer"}
                          position="top"
                        >
                          <span>
                            <ActionIcon
                              color="red"
                              size="md"
                              variant="subtle"
                              disabled={t.isRunning}
                              onClick={() => handleDeleteTimer(t.stepNumber)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </span>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          </Paper>
        )}

        {/* FOKUSKORT: NÅVÆRENDE STEG */}
        <Paper p={{ base: "lg", md: "25" }} radius="md" withBorder shadow="md">
          <Stack gap="xl">
            <Group justify="space-between" align="flex-start">
              <ThemeIcon color="sage" size={54} radius="xl" variant="filled">
                <Text fw={800} size="xl">
                  {currentStep.stepNumber}
                </Text>
              </ThemeIcon>

              {currentStep.suggestedTimerMinutes && !currentStepTimer && (
                <Button
                  variant="light"
                  color="orange"
                  size="xs"
                  leftSection={<IconClock size={16} />}
                  onClick={() => handleStartTimer(currentStep.stepNumber, currentStep.suggestedTimerMinutes!)}
                >
                  Start timer ({currentStep.suggestedTimerMinutes} min)
                </Button>
              )}
            </Group>

            <Text size="xl" lh={1.6} fw={500}>
              {currentStep.instruction}
            </Text>

            {/* DEDIKERT TIMERKORT FOR AKTUELT STEG */}
            {currentStepTimer && (
              <Paper p="md" radius="md" bg="orange.0" style={{ borderColor: "var(--mantine-color-orange-3)" }} withBorder>
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                  <Group gap="md">
                    <RingProgress
                      size={60}
                      thickness={6}
                      roundCaps
                      color="orange"
                      sections={[
                        {
                          value: (currentStepTimer.remainingSeconds / currentStepTimer.initialSeconds) * 100,
                          color: "orange",
                        },
                      ]}
                      label={
                        <ThemeIcon color="orange" variant="light" radius="xl" size="sm" style={{ margin: "0 auto" }}>
                          <IconClock size={12} />
                        </ThemeIcon>
                      }
                    />
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        Timer for Steg {currentStep.stepNumber}
                      </Text>
                      <Text fw={800} size="xl" style={{ fontFamily: "monospace" }}>
                        {formatTimer(currentStepTimer.remainingSeconds)}
                      </Text>
                    </div>
                  </Group>

                  <Group gap="xs">
                    <Button
                      color="orange"
                      size="sm"
                      leftSection={currentStepTimer.isRunning ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                      onClick={() => handleTogglePause(currentStep.stepNumber)}
                    >
                      {currentStepTimer.isRunning ? "Pause" : "Start"}
                    </Button>

                    <ActionIcon
                      color="gray"
                      size="lg"
                      variant="light"
                      onClick={() => handleResetTimer(currentStep.stepNumber)}
                    >
                      <IconRotate size={18} />
                    </ActionIcon>

                    <Tooltip
                      label={currentStepTimer.isRunning ? "Pause timeren for å slette" : "Slett timer"}
                      position="top"
                    >
                      <span>
                        <ActionIcon
                          color="red"
                          size="lg"
                          variant="light"
                          disabled={currentStepTimer.isRunning}
                          onClick={() => handleDeleteTimer(currentStep.stepNumber)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </span>
                    </Tooltip>
                  </Group>
                </Group>
              </Paper>
            )}

            <Divider />

            {/* NAVIGASJONSKNAPPER */}
            <Group justify="space-between" align="center">
              <Button
                size="lg"
                variant="default"
                leftSection={<IconChevronLeft size={20} />}
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((prev) => prev - 1)}
              >
                Forrige Steg
              </Button>

              {currentStepIndex < totalSteps - 1 ? (
                <Button
                  size="lg"
                  color="sage"
                  rightSection={<IconChevronRight size={20} />}
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                >
                  Neste Steg
                </Button>
              ) : (
                <Button
                  size="lg"
                  color="sage"
                  leftSection={<IconCheck size={20} />}
                  onClick={() => {
                    notifications.show({
                      id: "cook-complete",
                      title: "🎉 Måltidet er ferdig!",
                      message: `God middag! "${recipe.title}" er klar til servering.`,
                      color: "sage",
                    });
                    router.push(`/user/recipes/${recipeId}`);
                  }}
                >
                  Fullfør Måltid
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>

        {/* HURTIGVISNING AV INGREDIENSER */}
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <IconListCheck size={18} color="var(--mantine-color-sage-6)" />
              <Text fw={600} size="sm">
                Ingredienser for {servings} porsjoner
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Kryss av ettersom du tilsetter
            </Text>
          </Group>

          <Group gap="md">
            {recipe.ingredients.map((ing) => {
              const scaledAmount = Math.round(ing.amount * scaleRatio * 10) / 10;
              const isChecked = checkedIngredients[ing.id];

              return (
                <Checkbox
                  key={ing.id}
                  checked={isChecked || false}
                  onChange={() => toggleIngredient(ing.id)}
                  label={
                    <Text
                      size="xs"
                      style={{
                        textDecoration: isChecked ? "line-through" : "none",
                        color: isChecked ? "var(--mantine-color-dimmed)" : "inherit",
                      }}
                    >
                      <b>{scaledAmount} {ing.unit}</b> {ing.name}
                    </Text>
                  }
                  color="sage"
                  size="xs"
                />
              );
            })}
          </Group>
        </Paper>
      </Stack>

      {/* DRAWER FOR FULL INGREDIENSLISTE */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="📝 Sjekkliste for Ingredienser"
        position="right"
        size="md"
        padding="lg"
      >
        <Stack gap="md">
          <Alert color="terracotta" variant="light" icon={<IconSparkles size={16} />}>
            Mengdene er automatisk skalert til <b>{servings} porsjoner</b>.
          </Alert>

          <Stack gap="sm">
            {recipe.ingredients.map((ing) => {
              const scaledAmount = Math.round(ing.amount * scaleRatio * 10) / 10;
              const isChecked = checkedIngredients[ing.id];

              return (
                <Paper key={ing.id} p="xs" radius="sm" withBorder bg={isChecked ? "gray.0" : "white"}>
                  <Checkbox
                    checked={isChecked || false}
                    onChange={() => toggleIngredient(ing.id)}
                    label={
                      <Text
                        size="sm"
                        style={{
                          textDecoration: isChecked ? "line-through" : "none",
                          color: isChecked ? "var(--mantine-color-dimmed)" : "inherit",
                        }}
                      >
                        <b>{scaledAmount} {ing.unit}</b> {ing.name}
                      </Text>
                    }
                    color="sage"
                  />
                </Paper>
              );
            })}
          </Stack>

          <Button variant="light" color="sage" onClick={closeDrawer} mt="md">
            Lukk og fortsett matlagingen
          </Button>
        </Stack>
      </Drawer>
    </AsyncMainContainer>
  );
}