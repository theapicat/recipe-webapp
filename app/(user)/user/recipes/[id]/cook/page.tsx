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
  Center,
  Loader,
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
  IconAlertCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { isToTaste } from "@/components/recipes/recipeForm";
import { unitAbbreviationOf } from "@/components/recipes/recipeLookups";
import { useRecipe } from "@/components/recipes/useRecipe";
import { useRecipeLookups } from "@/components/recipes/useRecipeLookups";
import { playKitchenChime } from "@/lib/audio/kitchenChime";
import { capitalize } from "@/lib/text/names";

interface StepTimer {
  stepNumber: number;
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export default function RecipeCookPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params?.id as string;

  const { recipe, loading: loadingRecipe, errorMessage, retry } = useRecipe(recipeId);
  const { lookups, loading: loadingLookups } = useRecipeLookups();
  const loading = loadingRecipe || loadingLookups;

  return (
    <AsyncMainContainer size="lg" py={20}>
      {loading ? (
        <Center mih={300}>
          <Loader color="sage" size="md" type="dots" />
        </Center>
      ) : errorMessage || !recipe ? (
        <Alert
          color="red"
          variant="light"
          radius="md"
          title="Kunne ikke hente oppskriften"
          icon={<IconAlertCircle size={18} />}
        >
          <Group justify="space-between" align="center">
            <Text size="sm">{errorMessage}</Text>
            <Button size="xs" variant="light" color="red" onClick={retry}>
              Prøv igjen
            </Button>
          </Group>
        </Alert>
      ) : (
        <CookMode
          recipe={recipe}
          units={lookups.units}
          onFinish={() => router.push(`/user/recipes/${recipe.id}`)}
        />
      )}
    </AsyncMainContainer>
  );
}

// Eget innhold (etter lasting) slik at all state under initialiseres med ekte data fra start, i stedet for å
// måtte håndtere en tom/skiftende oppskrift underveis.
const CookMode = ({
  recipe,
  units,
  onFinish,
}: {
  recipe: NonNullable<ReturnType<typeof useRecipe>["recipe"]>;
  units: ReturnType<typeof useRecipeLookups>["lookups"]["units"];
  onFinish: () => void;
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [servings, setServings] = useState<number>(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Multi-timer tilstand (nøkkel = stegnummer)
  const [timers, setTimers] = useState<Record<number, StepTimer>>({});

  // Skjerm Keep-Alive (Web Wake Lock API)
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Ingrediens-skuff (Drawer)
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const steps = recipe.steps;
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const scaleRatio = servings / recipe.servings;

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

              playKitchenChime();

              notifications.show({
                id: `timer-done-${stepNum}`,
                title: `Timer for steg ${stepNum} er ferdig!`,
                message: `Tiden er ute for dette steget i "${capitalize(recipe.title)}".`,
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

  // --- TIMER-HANDLINGER ---
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
      return { ...prev, [stepNum]: { ...existing, isRunning: !existing.isRunning } };
    });
  };

  const handleResetTimer = (stepNum: number) => {
    setTimers((prev) => {
      const existing = prev[stepNum];
      if (!existing) return prev;
      return {
        ...prev,
        [stepNum]: { ...existing, remainingSeconds: existing.initialSeconds, isRunning: false },
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

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const ingredientLabel = (ingredient: (typeof recipe.ingredients)[number]) => {
    const scaledAmount = Math.round(ingredient.amount * scaleRatio * 10) / 10;
    const unit = unitAbbreviationOf(units, ingredient.unitId);
    const amountText = isToTaste(ingredient.amount)
      ? "Etter smak"
      : `${scaledAmount} ${unit ?? ""}`;
    return { amountText, name: capitalize(ingredient.name ?? "") };
  };

  const activeTimerList = Object.values(timers);
  const currentStepTimer = timers[currentStep.stepNumber];

  return (
    <>
      <Stack gap="lg">
        {/* TOPPLINJE FOR KOKKEMODUS */}
        <Paper
          p="md"
          radius="md"
          withBorder
          bg="light-dark(var(--mantine-color-sage-0), var(--mantine-color-dark-6))"
          style={{
            borderColor: "light-dark(var(--mantine-color-sage-2), var(--mantine-color-dark-4))",
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Button
                component={Link}
                href={`/user/recipes/${recipe.id}`}
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={16} />}
                size="sm"
              >
                Avslutt kokkemodus
              </Button>
              <Badge
                color="sage"
                variant="filled"
                size="lg"
                leftSection={<IconChefHat size={14} />}
              >
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
                Vis ingredienser
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* TITTEL & PORSJONER */}
        <Group justify="space-between" align="center">
          <div>
            <Title order={2}>{capitalize(recipe.title)}</Title>
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
              onChange={(val) => setServings(typeof val === "number" ? val : recipe.servings)}
              min={1}
              max={1000}
              size="xs"
              style={{ width: 70 }}
            />
          </Group>
        </Group>

        {/* FREMDRIFTSLINJE */}
        <Progress value={progressPercent} color="sage" size="md" radius="xl" animated />

        {/* GLOBAL OVERSIKT OVER AKTIVE TIMERE */}
        {activeTimerList.length > 0 && (
          <Paper
            p="md"
            radius="md"
            withBorder
            bg="orange.0"
            style={{ borderColor: "var(--mantine-color-orange-3)" }}
          >
            <Stack gap="xs">
              <Group gap="xs">
                <IconClock size={18} color="var(--mantine-color-orange-7)" />
                <Text fw={700} size="sm" c="orange.9">
                  Aktive timere i bakgrunnen ({activeTimerList.length})
                </Text>
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
                          {t.isRunning ? (
                            <IconPlayerPause size={14} />
                          ) : (
                            <IconPlayerPlay size={14} />
                          )}
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

              {currentStep.timerMinutes !== null && !currentStepTimer && (
                <Button
                  variant="light"
                  color="orange"
                  size="xs"
                  leftSection={<IconClock size={16} />}
                  onClick={() =>
                    handleStartTimer(currentStep.stepNumber, currentStep.timerMinutes!)
                  }
                >
                  Start timer ({currentStep.timerMinutes} min)
                </Button>
              )}
            </Group>

            <Text size="xl" lh={1.6} fw={500}>
              {currentStep.description}
            </Text>

            {/* DEDIKERT TIMERKORT FOR AKTUELT STEG */}
            {currentStepTimer && (
              <Paper
                p="md"
                radius="md"
                bg="orange.0"
                style={{ borderColor: "var(--mantine-color-orange-3)" }}
                withBorder
              >
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                  <Group gap="md">
                    <RingProgress
                      size={60}
                      thickness={6}
                      roundCaps
                      color="orange"
                      sections={[
                        {
                          value:
                            (currentStepTimer.remainingSeconds / currentStepTimer.initialSeconds) *
                            100,
                          color: "orange",
                        },
                      ]}
                      label={
                        <ThemeIcon
                          color="orange"
                          variant="light"
                          radius="xl"
                          size="sm"
                          style={{ margin: "0 auto" }}
                        >
                          <IconClock size={12} />
                        </ThemeIcon>
                      }
                    />
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        Timer for steg {currentStep.stepNumber}
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
                      leftSection={
                        currentStepTimer.isRunning ? (
                          <IconPlayerPause size={16} />
                        ) : (
                          <IconPlayerPlay size={16} />
                        )
                      }
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
                      label={
                        currentStepTimer.isRunning ? "Pause timeren for å slette" : "Slett timer"
                      }
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
                Forrige steg
              </Button>

              {currentStepIndex < totalSteps - 1 ? (
                <Button
                  size="lg"
                  color="sage"
                  rightSection={<IconChevronRight size={20} />}
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                >
                  Neste steg
                </Button>
              ) : (
                <Button
                  size="lg"
                  color="sage"
                  leftSection={<IconCheck size={20} />}
                  onClick={() => {
                    notifications.show({
                      id: "cook-complete",
                      title: "Måltidet er ferdig!",
                      message: `God middag! "${capitalize(recipe.title)}" er klar til servering.`,
                      color: "sage",
                    });
                    onFinish();
                  }}
                >
                  Fullfør måltid
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
            {recipe.ingredients.map((ingredient) => {
              const { amountText, name } = ingredientLabel(ingredient);
              const isChecked = checkedIngredients[ingredient.id];

              return (
                <Checkbox
                  key={ingredient.id}
                  checked={isChecked || false}
                  onChange={() => toggleIngredient(ingredient.id)}
                  label={
                    <Text
                      size="xs"
                      style={{
                        textDecoration: isChecked ? "line-through" : "none",
                        color: isChecked ? "var(--mantine-color-dimmed)" : "inherit",
                      }}
                    >
                      <b>{amountText}</b> {name}
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

      {/* DRAWER MED FULL INGREDIENSLISTE */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Sjekkliste for ingredienser"
        position="right"
        size="md"
        padding="lg"
      >
        <Stack gap="md">
          <Alert color="terracotta" variant="light" icon={<IconSparkles size={16} />}>
            Mengdene er automatisk skalert til <b>{servings} porsjoner</b>.
          </Alert>

          <Stack gap="sm">
            {recipe.ingredients.map((ingredient) => {
              const { amountText, name } = ingredientLabel(ingredient);
              const isChecked = checkedIngredients[ingredient.id];

              return (
                <Paper
                  key={ingredient.id}
                  p="xs"
                  radius="sm"
                  withBorder
                  bg={isChecked ? "gray.0" : "white"}
                >
                  <Checkbox
                    checked={isChecked || false}
                    onChange={() => toggleIngredient(ingredient.id)}
                    label={
                      <Text
                        size="sm"
                        style={{
                          textDecoration: isChecked ? "line-through" : "none",
                          color: isChecked ? "var(--mantine-color-dimmed)" : "inherit",
                        }}
                      >
                        <b>{amountText}</b> {name}
                        {ingredient.note && (
                          <Text component="span" size="xs" c="dimmed">
                            {" "}
                            ({ingredient.note})
                          </Text>
                        )}
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
    </>
  );
};
