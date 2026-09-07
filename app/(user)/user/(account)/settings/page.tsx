"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  Alert,
  Switch,
  NumberInput,
  MultiSelect,
  Select,
  TextInput,
  Badge,
  Card,
  ThemeIcon,
  Divider,
  ActionIcon,
  SegmentedControl,
} from "@mantine/core";
import {
  IconSettings,
  IconAlertTriangle,
  IconUsers,
  IconBell,
  IconSun,
  IconMoon,
  IconInfoCircle,
  IconChefHat,
  IconCheck,
  IconUserPlus,
  IconTrash,
  IconFlame,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

export default function UserSettingsPage() {
  // States
  const [dietType, setDietType] = useState<string>("Altetende");
  const [allergies, setAllergies] = useState<string[]>(["Gluten"]);
  const [defaultServings, setDefaultServings] = useState<number>(4);
  const [colorScheme, setColorScheme] = useState<string>("system");

  // Notifications
  const [weekMenuReminder, setWeekMenuReminder] = useState(true);
  const [thawReminder, setThawReminder] = useState(true);

  // Sharing / Household
  const [sharedUsers, setSharedUsers] = useState<
    { email: string; role: string; accepted: boolean }[]
  >([
    { email: "samboer@eksempel.no", role: "Full tilgang", accepted: true },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleAddUser = () => {
    if (!inviteEmail.trim()) return;
    setSharedUsers((prev) => [
      ...prev,
      { email: inviteEmail.trim(), role: "Full tilgang", accepted: false },
    ]);
    setInviteEmail("");
  };

  const handleRemoveUser = (email: string) => {
    setSharedUsers((prev) => prev.filter((u) => u.email !== email));
  };

  return (
    <AsyncMainContainer size="lg" py={30}>
      <Stack gap="lg">
        {/* Prototyping Varsel */}
        <Alert
          color="terracotta"
          title="🎨 Prototyping / Mockup-side"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Dette er en visuell skisse for <b>App-innstillinger</b>. Her setter du opp kostholds- og allergipreferanser, deling av ukesmeny og handleliste i husholdningen, samt påminnelser.
        </Alert>

        {/* Overskrift */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>⚙️ Innstillinger & Preferanser</Title>
            <Text c="dimmed" size="sm">
              Tilpass Kjøkkenhylla til ditt hushold og dine matvaner
            </Text>
          </div>
          <Button color="sage" leftSection={<IconCheck size={18} />}>
            Lagre endringer
          </Button>
        </Group>

        {/* 1. Kosthold & Allergier */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon color="terracotta" size="lg" radius="md" variant="light">
                <IconFlame size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="md">
                  Kosthold & Allergier
                </Text>
                <Text size="xs" c="dimmed">
                  Allergier du velger her vil automatisk flagges med advarsel ved import av oppskrifter
                </Text>
              </div>
            </Group>

            <Divider />

            <Select
              label="Kostholdstype"
              description="Hvilken matprofil passer deg best?"
              data={[
                "Altetende",
                "Vegetar",
                "Vegansk",
                "Pesketar",
                "Lavkarbo / Keto",
                "Melkefri",
              ]}
              value={dietType}
              onChange={(val) => setDietType(val || "Altetende")}
            />

            <MultiSelect
              label="Allergier & Intoleranser"
              description="Velg allergener som må følges opp"
              placeholder="Velg allergier..."
              data={[
                "Gluten",
                "Laktose / Melk",
                "Nøtter",
                "Peanøtter",
                "Skalldyr",
                "Egg",
                "Fisk",
                "Soyabønner",
                "Selleri",
              ]}
              value={allergies}
              onChange={setAllergies}
              searchable
              clearable
            />

            {allergies.length > 0 && (
              <Alert color="terracotta" variant="light" icon={<IconAlertTriangle size={18} />}>
                Når du importerer nye oppskrifter vil systemet sjekke ingrediensene og si fra dersom de inneholder:{" "}
                <b>{allergies.join(", ")}</b>.
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* 2. Standardvalg for Matlaging */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon color="sage" size="lg" radius="md" variant="light">
                <IconChefHat size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="md">
                  Standard porsjoner
                </Text>
                <Text size="xs" c="dimmed">
                  Oppskrifter og mengder i ukesmenyen blir automatisk skalert til dette antall porsjoner
                </Text>
              </div>
            </Group>

            <Divider />

            <NumberInput
              label="Standard antall porsjoner"
              description="Settes automatisk på nye oppskrifter og ukesmeny-beregnere"
              value={defaultServings}
              onChange={(val) => setDefaultServings(Number(val) || 1)}
              min={1}
              max={20}
              style={{ maxWidth: 250 }}
            />
          </Stack>
        </Paper>

        {/* 3. Husholdning, Deling & Oppskrifter */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon color="sage" size="lg" radius="md" variant="light">
                <IconUsers size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="md">
                  Husholdning & Deling
                </Text>
                <Text size="xs" c="dimmed">
                  Del ukesmeny, handleliste og oppskriftsbok med familien eller samboeren din
                </Text>
              </div>
            </Group>

            <Divider />

            <Text size="sm" fw={500}>
              Inviter medlem til husholdningen
            </Text>

            <Group align="flex-end">
              <TextInput
                placeholder="E-postadresse til samboer/familiemedlem"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Button
                color="sage"
                leftSection={<IconUserPlus size={16} />}
                onClick={handleAddUser}
              >
                Send Invitasjon
              </Button>
            </Group>

            <Text size="xs" c="dimmed">
              Medlemmer i din husholdning vil se og kunne redigere din felles ukesmeny og handleliste. Importerte/egne oppskrifter vil merkes med hvem som opprettet dem.
            </Text>

            <Stack gap="xs" mt="xs">
              {sharedUsers.map((u) => (
                <Card key={u.email} withBorder padding="xs" radius="sm">
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>
                        {u.email}
                      </Text>
                      <Group gap={6}>
                        <Badge size="xs" color={u.accepted ? "sage" : "terracotta"} variant="light">
                          {u.accepted ? "Aktiv i husholdningen" : "Ventende invitasjon"}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          • {u.role}
                        </Text>
                      </Group>
                    </div>

                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleRemoveUser(u.email)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* 4. Varsler & Påminnelser */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon color="sage" size="lg" radius="md" variant="light">
                <IconBell size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="md">
                  Varsler & Påminnelser
                </Text>
                <Text size="xs" c="dimmed">
                  Få hjelp til å holde rutinene i hverdagen
                </Text>
              </div>
            </Group>

            <Divider />

            <Switch
              label="Ukesmeny-påminnelse"
              description="Send varsel på søndager om å planlegge neste ukes middager"
              checked={weekMenuReminder}
              onChange={(e) => setWeekMenuReminder(e.currentTarget.checked)}
              color="sage"
            />

            <Switch
              label="Tine- og forberedelsespåminnelse"
              description="Få varsel kvelden før dersom morgendagens middag krever tining av kjøtt/fisk"
              checked={thawReminder}
              onChange={(e) => setThawReminder(e.currentTarget.checked)}
              color="sage"
            />
          </Stack>
        </Paper>

        {/* 5. Utseende & Tema */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon color="gray" size="lg" radius="md" variant="light">
                <IconSun size={20} />
              </ThemeIcon>
              <div>
                <Text fw={600} size="md">
                  Utseende & Tema
                </Text>
                <Text size="xs" c="dimmed">
                  Velg hvordan Kjøkkenhylla skal se ut på din enhet
                </Text>
              </div>
            </Group>

            <Divider />

            <div>
              <Text size="sm" fw={500} mb="xs">
                Fargetema
              </Text>
              <SegmentedControl
                value={colorScheme}
                onChange={setColorScheme}
                color="sage"
                data={[
                  {
                    label: (
                      <CenterGroup icon={IconSun} text="Lyst" />
                    ),
                    value: "light",
                  },
                  {
                    label: (
                      <CenterGroup icon={IconMoon} text="Mørkt" />
                    ),
                    value: "dark",
                  },
                  {
                    label: (
                      <CenterGroup icon={IconDeviceDesktop} text="System" />
                    ),
                    value: "system",
                  },
                ]}
              />
            </div>
          </Stack>
        </Paper>
      </Stack>
    </AsyncMainContainer>
  );
}

// Hjelpekomponent for SegmentedControl
function CenterGroup({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <Group gap={6} justify="center">
      <Icon size={16} />
      <span>{text}</span>
    </Group>
  );
}