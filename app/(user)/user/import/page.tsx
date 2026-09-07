"use client";

import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Stack,
  Group,
  TextInput,
  Button,
  Alert,
  Badge,
  Card,
  Image,
  List,
  ThemeIcon,
  Divider,
  SimpleGrid,
  Loader,
  Notification,
} from "@mantine/core";
import {
  IconLink,
  IconDownload,
  IconCheck,
  IconWorldCheck,
  IconInfoCircle,
  IconChefHat,
  IconSparkles,
  IconClock,
  IconUsers,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import Link from "next/link";

interface ImportedRecipe {
  title: string;
  sourceUrl: string;
  sourceDomain: string;
  prepTime: string;
  servings: number;
  image: string;
  ingredients: string[];
  steps: string[];
}

export default function UserImportPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedRecipe, setScrapedRecipe] = useState<ImportedRecipe | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleImport = () => {
    setError(null);
    setSavedSuccess(false);

    if (!url.trim()) {
      setError("Vennligst oppgi en gyldig nettadresse (URL).");
      return;
    }

    // Mock validering mot whitelist
    if (
      !url.includes("matprat.no") &&
      !url.includes("godt.no") &&
      !url.includes("trinesmatblogg.no")
    ) {
      setError(
        "Denne siden er ikke tilgjengelig for oppskrifter. Kun godkjente nettsider (f.eks. matprat.no, godt.no) kan skrapes."
      );
      return;
    }

    setIsLoading(true);

    // Simulerer backend API-kall til Scraper Service via RabbitMQ/Core API
    setTimeout(() => {
      setIsLoading(false);
      setScrapedRecipe({
        title: "Kremet Kyllinggryte med Sopp og Paprika",
        sourceUrl: url,
        sourceDomain: url.includes("matprat.no")
          ? "matprat.no"
          : url.includes("godt.no")
            ? "godt.no"
            : "trinesmatblogg.no",
        prepTime: "25 min",
        servings: 4,
        image:
          "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
        ingredients: [
          "600 g kyllingfilet i strimler",
          "1 stk rød paprika, skåret i strimler",
          "150 g aromasopp, delt i fire",
          "1 stk gul løk, finhakket",
          "2 fedd hvitløk, finhakket",
          "3 dl matfløte",
          "2 dl kyllingkraft",
          "1 ss smør til steking",
          "Salt og nykvernet pepper",
        ],
        steps: [
          "Brun kyllingstrimlene i smør i en varm panne. Krydre med salt og pepper. Ta ut kyllingen og sett til side.",
          "Fres løk, hvitløk og sopp i samme panne til løken er myk og blank.",
          "Tilsett paprika, kyllingkraft og matfløte. La det småkoke i 5–7 minutter til sausen tykner noe.",
          "Legg kyllingen tilbake i gryta og la alt bli gjennomvarmt. Server med ris eller potetmos.",
        ],
      });
    }, 1200);
  };

  const handleSave = () => {
    setSavedSuccess(true);
  };

  return (
    <AsyncMainContainer size="lg" py={30}>
      <Stack gap="lg">
        {/* Prototyping Varsel */}
        <Alert
          color="terracotta"
          variant="light"
          title="🎨 Prototyping / Mockup-side"
          icon={<IconInfoCircle size={20} />}
          radius="md"
        >
          Dette er en visuell skisse for <b>Oppskriftsimporteren</b>. Her limer brukeren inn lenker fra godkjente matblogger/nettsider. Scraper-tjenesten henter ut tittel, bilde, ingredienser og steg automatisk.
        </Alert>

        {/* Overskrift */}
        <Group justify="space-between" align="flex-end">
          <div>
            <Title order={2}>🔗 Importer Oppskrift</Title>
            <Text c="dimmed" size="sm">
              Lim inn en nettadresse fra en godkjent oppskriftsside for å legge den til i din samling
            </Text>
          </div>
          <Badge size="lg" variant="light" color="sage" leftSection={<IconWorldCheck size={16} />}>
            Auto-skraper Aktiv
          </Badge>
        </Group>

        {/* Input & Sjekk */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <TextInput
              label="Oppskrifts-URL"
              placeholder="f.eks. https://www.matprat.no/oppskrifter/kos/kremet-kyllinggryte/"
              leftSection={<IconLink size={18} />}
              size="md"
              value={url}
              onChange={(e) => setUrl(e.currentTarget.value)}
              error={error}
            />

            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  Eksempler på trygge kilder:
                </Text>
                <Badge size="xs" variant="outline" color="gray">matprat.no</Badge>
                <Badge size="xs" variant="outline" color="gray">godt.no</Badge>
                <Badge size="xs" variant="outline" color="gray">trinesmatblogg.no</Badge>
              </Group>

              <Button
                color="sage"
                size="md"
                leftSection={isLoading ? <Loader size="xs" color="white" /> : <IconDownload size={18} />}
                onClick={handleImport}
                disabled={isLoading}
              >
                {isLoading ? "Henter oppskrift..." : "Hent Oppskrift"}
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Suksessmelding etter lagring */}
        {savedSuccess && (
          <Notification
            icon={<IconCheck size={18} />}
            color="sage"
            title="Oppskrift lagret!"
            onClose={() => setSavedSuccess(false)}
          >
            Oppskriften er lagret i din samling. Du finner den under{" "}
            <Link href="/user/recipes" style={{ color: "var(--mantine-color-sage-7)", fontWeight: 600 }}>
              Mine Oppskrifter
            </Link>.
          </Notification>
        )}

        {/* Forhåndsvisning av Importert Oppskrift */}
        {scrapedRecipe && (
          <Paper p="lg" radius="md" withBorder>
            <Stack gap="lg">
              <Group justify="space-between" align="flex-start">
                <Group gap="xs">
                  <ThemeIcon color="sage" size="lg" radius="xl" variant="light">
                    <IconSparkles size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Forhåndsvisning fra {scrapedRecipe.sourceDomain}
                    </Text>
                    <Title order={3}>{scrapedRecipe.title}</Title>
                  </div>
                </Group>

                <Button
                  color="sage"
                  leftSection={<IconDeviceFloppy size={18} />}
                  onClick={handleSave}
                  disabled={savedSuccess}
                >
                  {savedSuccess ? "Lagret" : "Lagre i Mine Oppskrifter"}
                </Button>
              </Group>

              <Divider />

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                {/* Bilde og Nøkkelinfo */}
                <Stack gap="md">
                  <Card p={0} radius="md" withBorder style={{ overflow: "hidden" }}>
                    <Image src={scrapedRecipe.image} height={220} alt={scrapedRecipe.title} />
                  </Card>

                  <Group gap="md">
                    <Badge size="lg" variant="light" color="sage" leftSection={<IconClock size={16} />}>
                      {scrapedRecipe.prepTime}
                    </Badge>
                    <Badge size="lg" variant="light" color="sage" leftSection={<IconUsers size={16} />}>
                      {scrapedRecipe.servings} porsjoner
                    </Badge>
                  </Group>
                </Stack>

                {/* Ingredienser */}
                <Card withBorder radius="md" p="md">
                  <Stack gap="xs">
                    <Group gap="xs" mb="xs">
                      <IconChefHat size={18} color="var(--mantine-color-sage-6)" />
                      <Text fw={600} size="sm">
                        Ingredienser
                      </Text>
                    </Group>
                    <List spacing="xs" size="sm" icon={<IconCheck size={14} color="var(--mantine-color-sage-6)" />}>
                      {scrapedRecipe.ingredients.map((ing, idx) => (
                        <List.Item key={idx}>{ing}</List.Item>
                      ))}
                    </List>
                  </Stack>
                </Card>

                {/* Fremgangsmåte */}
                <Card withBorder radius="md" p="md">
                  <Stack gap="xs">
                    <Group gap="xs" mb="xs">
                      <IconInfoCircle size={18} color="var(--mantine-color-sage-6)" />
                      <Text fw={600} size="sm">
                        Fremgangsmåte
                      </Text>
                    </Group>
                    <List type="ordered" spacing="xs" size="sm">
                      {scrapedRecipe.steps.map((step, idx) => (
                        <List.Item key={idx}>{step}</List.Item>
                      ))}
                    </List>
                  </Stack>
                </Card>
              </SimpleGrid>
            </Stack>
          </Paper>
        )}
      </Stack>
    </AsyncMainContainer>
  );
}