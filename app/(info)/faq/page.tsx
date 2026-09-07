"use client";

import { useState, useMemo, ComponentType } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Accordion,
  TextInput,
  ThemeIcon,
  Badge,
  Button,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import {
  IconSearch,
  IconHelp,
  IconChefHat,
  IconCalendarEvent,
  IconHeart,
  IconUser,
  IconMessage2,
  IconFileText,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import { AsyncMainContainer } from "@/components/containers/MainContainer";

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  title: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    id: "generelt",
    title: "Generelt og personvern",
    icon: IconHelp,
    color: "sage",
    items: [
      {
        id: "gen-1",
        q: "Hvorfor finner jeg ingen oppskrifter når jeg oppretter en brukerkonto?",
        a: "Kjøkkenhylla leveres uten et fast oppskriftsregister. Appen er en personlig digital kokebok og verktøykasse. Du bygger opp din egen samling ved å importere retter fra nettet, opprette egne oppskrifter fra bunnen av, eller motta delte oppskrifter fra venner.",
      },
      {
        id: "gen-2",
        q: "Er oppskriftene og dataene mine synlige for andre?",
        a: "Nei, i utgangspunktet er alt innholdet ditt 100 % privat. Oppskriftene dine, ukeplanene og handlelistene er skjermet for andre brukere. Kjøkkenhylla er ikke et offentlig sosialt nettverk, og det finnes ingen åpne profiler eller offentlige søk.",
      },
      {
        id: "gen-3",
        q: "Kan jeg dele oppskrifter med venner og familie?",
        a: "Ja, direkte deling med venner er under utvikling. Du vil kunne sende en spesifikk oppskrift direkte til en venn slik at de kan legge den til i sin egen private samling, uten at den blir offentlig for alle andre.",
      },
      {
        id: "gen-4",
        q: "Hva gjør jeg hvis jeg finner feil eller har forslag til appen?",
        a: "Du kan sende en melding via Kontakt-siden i menyen. Kjøkkenhylla er et prosjekt under kontinuerlig utvikling, og tilbakemeldinger og feilmeldinger tas imot med stor takknemlighet.",
      },
    ],
  },
  {
    id: "oppskrifter",
    title: "Oppskrifter og import",
    icon: IconChefHat,
    color: "sage",
    items: [
      {
        id: "rec-1",
        q: "Hvilke nettsteder kan jeg importere oppskrifter fra?",
        a: "Du kan importere fra et utvalg populære matblogger og oppskriftssider (som Matprat, Trines Matblogg m.fl.) der skraping er teknisk støttet og juridisk tillatt. Listen over støttede kilder utvides fortløpende.",
      },
      {
        id: "rec-2",
        q: "Hva skjer når jeg endrer en importert oppskrift?",
        a: "Når du importerer en oppskrift, opprettes det en helt uavhengig kopi i din private samling. Du kan fritt endre ingredienser, mengder, fremgangsmåte og legge til egne notater. Endringene du gjør er dine egne og påvirker aldri originalkilden på nettet.",
      },
      {
        id: "rec-3",
        q: "Kan jeg legge til egne oppskrifter fra bunnen av?",
        a: "Ja. Du kan opprette helt egne oppskrifter manuelt med tittel, porsjoner, ingredienslister, trinnvise instruksjoner, bilder og egne notater.",
      },
    ],
  },
  {
    id: "planlegging",
    title: "Måltidsplanlegging og handleliste",
    icon: IconCalendarEvent,
    color: "terracotta",
    items: [
      {
        id: "plan-1",
        q: "Hvordan fungerer den automatiske handlelisten?",
        a: "Når du legger oppskrifter fra samlingen din inn i ukesmenyen (mandag–søndag), henter Kjøkkenhylla automatisk ingrediensene fra de valgte dagene, slår sammen like varer og genererer en strukturert handleliste.",
      },
      {
        id: "plan-2",
        q: "Hvordan finner jeg oppskrifter basert på matrester?",
        a: "Du kan bruke Tøm kjøleskapet-funksjonen i oppskriftsoversikten. Skriv inn ingrediensene eller råvarene du har liggende, så filtrerer appen ut de rettene fra din private samling som bruker disse ingrediensene.",
      },
    ],
  },
  {
    id: "helse",
    title: "Næringsinnhold og helse",
    icon: IconHeart,
    color: "terracotta",
    items: [
      {
        id: "health-1",
        q: "Hvor henter Kjøkkenhylla næringsdata fra?",
        a: "Næringsberegningene baserer seg på offentlig tilgjengelige næringsdata fra kilder som Helsedirektoratet og Mattilsynet (Matvaretabellen).",
      },
      {
        id: "health-2",
        q: "Kan jeg stole på at næringstallene og allergenene stemmer 100 %?",
        a: "Nei, næringsberegningene er kun veiledende. Næringsinnhold varierer mellom ulike merkevarer og produsenter. Ved allergi eller matintoleranse må du alltid kontrollere ingredienslisten på produktets fysiske emballasje i butikken. Beregningene utgjør ikke medisinsk eller ernæringsfysiologisk rådgivning.",
      },
    ],
  },
  {
    id: "konto",
    title: "Brukerkonto og sikkerhet",
    icon: IconUser,
    color: "sage",
    items: [
      {
        id: "acc-1",
        q: "Hvordan endrer jeg passord eller profilinformasjon?",
        a: "Gå til Profil & Innstillinger fra brukermenyen. Der kan du oppdatere personopplysninger, endre passord og tilpasse preferansene dine.",
      },
      {
        id: "acc-2",
        q: "Hva skjer hvis jeg sletter brukerkontoen min?",
        a: "Hvis du velger å slette kontoen din under innstillinger, blir alle dine lagrede oppskrifter, ukeplaner, handlelister og personlige data permanent slettet fra systemene våre.",
      },
    ],
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState("");

  // Søkefiltrering på tvers av spørsmål og svar
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return FAQ_DATA;

    const query = search.toLowerCase();
    return FAQ_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(query) ||
          item.a.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <AsyncMainContainer size="md" py={40}>
      <Stack gap="xl">
        {/* --- HEADER --- */}
        <Stack gap="sm" ta="center" align="center">
          <Badge color="sage" variant="light" size="lg">
            Hjelpesenter & FAQ
          </Badge>

          <Title order={1} size="h1" style={{ fontSize: "2.3rem", fontWeight: 800 }}>
            Ofte stilte spørsmål
          </Title>

          <Text size="md" c="dimmed" style={{ maxWidth: 580 }}>
            Finner du ikke svaret du leter etter? Søk i spørsmålene under, sjekk våre juridiske dokumenter eller ta kontakt med oss.
          </Text>

          {/* Søkefelt */}
          <TextInput
            placeholder="Søk i spørsmål og svar (f.eks. oppskrift, allergi, sletting)..."
            leftSection={<IconSearch size={18} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="md"
            radius="md"
            mt="xs"
            style={{ width: "100%", maxWidth: 520 }}
          />
        </Stack>

        <Divider />

        {/* --- FAQ SEKSJONER --- */}
        {filteredCategories.length > 0 ? (
          <Stack gap="xl">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Paper key={cat.id} p="lg" radius="md" withBorder shadow="xs">
                  <Stack gap="md">
                    <Group gap="sm">
                      <ThemeIcon color={cat.color} size={36} radius="md" variant="light">
                        <Icon size={20} />
                      </ThemeIcon>
                      <div>
                        <Title order={2} size="h3">
                          {cat.title}
                        </Title>
                        <Text size="xs" c="dimmed">
                          {cat.items.length} {cat.items.length === 1 ? "spørsmål" : "spørsmål"}
                        </Text>
                      </div>
                    </Group>

                    <Accordion variant="separated" radius="md" chevronPosition="right">
                      {cat.items.map((item) => (
                        <Accordion.Item key={item.id} value={item.id}>
                          <Accordion.Control>
                            <Text fw={600} size="sm">
                              {item.q}
                            </Text>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Text size="sm" c="dimmed" lh={1.6}>
                              {item.a}
                            </Text>
                          </Accordion.Panel>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <Paper p="xl" radius="md" withBorder ta="center">
            <Stack align="center" gap="xs">
              <ThemeIcon size={48} radius="xl" color="gray" variant="light">
                <IconSearch size={24} />
              </ThemeIcon>
              <Text fw={600}>Ingen treff for &#34;{search}&#34;</Text>
              <Text size="sm" c="dimmed">
                Prøv å søke med andre ord eller ta kontakt med oss direkte.
              </Text>
              <Button
                variant="light"
                color="sage"
                size="xs"
                mt="xs"
                onClick={() => setSearch("")}
              >
                Nullstill søk
              </Button>
            </Stack>
          </Paper>
        )}

        {/* --- BOTTOM CALL TO ACTION --- */}
        <Paper p="xl" radius="md" withBorder>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <Stack gap="xs">
              <Group gap={6}>
                <IconSparkles size={18} color="var(--mantine-color-sage-filled)" />
                <Text fw={700} size="md">
                  Fant du ikke det du trengte?
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                Vi hjelper deg gjerne! Send oss en melding via kontaktskjemaet eller les våre juridiske brukervilkår.
              </Text>
            </Stack>

            <Group gap="sm">
              <Button
                component={Link}
                href="/contact"
                color="sage"
                leftSection={<IconMessage2 size={16} />}
              >
                Kontakt oss
              </Button>
              <Button
                component={Link}
                href="/legal/terms"
                variant="outline"
                color="sage"
                leftSection={<IconFileText size={16} />}
                rightSection={<IconArrowRight size={14} />}
              >
                Vilkår & Personvern
              </Button>
            </Group>
          </SimpleGrid>
        </Paper>
      </Stack>
    </AsyncMainContainer>
  );
}