"use client";

import {
  Title,
  Text,
  Paper,
  Stack,
  Badge,
  Alert,
  List,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import {
  IconCheck,
  IconAlertTriangle,
  IconMailCheck,
  IconMailX,
  IconDownload,
} from "@tabler/icons-react";

export default function TermsPage() {
  return (
    <Paper p="xl" radius="md" withBorder shadow="xs">
      <Stack gap="lg">
        <div>
          <Badge color="sage" variant="light" mb="xs">
            Sist oppdatert: 9. september 2026
          </Badge>
          <Title order={2} size="h2">
            Brukervilkår for Kjøkkenhylla
          </Title>
          <Text size="sm" c="dimmed" mt={4}>
            Velkommen til Kjøkkenhylla. Ved å opprette en konto eller bruke våre
            tjenester aksepterer du følgende brukervilkår. Vennligst les dem nøye.
          </Text>
        </div>

        <Stack gap="xl">
          {/* Seksjon 1 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              1. Aksept av vilkår og aldersgrense
            </Title>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="sage" size={18} radius="xl">
                  <IconCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <b>Aksept:</b> Ved å ta i bruk Kjøkkenhylla inngår du en bindende
                avtale om å følge disse brukervilkårene.
              </List.Item>
              <List.Item>
                <b>Aldersgrense:</b> Du må være minst 13 år gammel (eller ha
                foreldrenes/foresattes samtykke) for å opprette en konto og benytte
                tjenesten.
              </List.Item>
            </List>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 2 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              2. Tjenestebeskrivelse og tilgangsrettigheter
            </Title>
            <List spacing="xs" size="sm">
              <List.Item>
                <b>Om tjenesten:</b> Kjøkkenhylla er et personlig digitalt verktøy
                for organisering av oppskrifter, måltidsplanlegging, næringsberegning
                og generering av handlelister.
              </List.Item>
              <List.Item>
                <b>Privat plattform:</b> Kjøkkenhylla er en privat tjeneste, og
                tilgang til å bruke plattformen er ingen ubetinget rettighet.
              </List.Item>
              <List.Item>
                <b>&#34;Som den er&#34; (As is):</b> Tjenesten leveres &#34;som den er&#34; uten
                garantier for uavbrutt drift eller 100 % opptid. Vi forbeholder
                oss retten til å oppdatere, endre, begrense eller stenge funksjoner ved
                behov.
              </List.Item>
              <List.Item>
                <b>Kontoens funksjoner:</b> Kjernefunksjonalitet er reservert for
                innloggede brukere med en aktiv konto.
              </List.Item>
            </List>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 3 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              3. Brukerkonto, e-postbekreftelse, leverbarhet, inaktivitet og datainnsyn
            </Title>
            <Text size="sm" lh={1.6} mb="xs">
              For å oppretteholde sikkerhet, forhindre ubrukte eller fiktive kontoer,
              ivareta personvern og god datahygiene, gjelder følgende regler:
            </Text>

            <Stack gap="sm" mt="xs">
              <Alert
                color="sage"
                variant="light"
                title="Krav om e-postbekreftelse"
                icon={<IconMailCheck size={20} />}
              >
                <Text size="xs">
                  Alle nye kontoer må bekrefte sin e-postadresse via aktiveringslenken
                  som sendes ved registrering.
                </Text>
              </Alert>

              <Alert
                color="terracotta"
                variant="light"
                title="Krav om gyldig og leverbar e-postadresse (Hard Bounce)"
                icon={<IconMailX size={20} />}
              >
                <Text size="xs">
                  Kjøkkenhylla krever at alle registrerte brukere til enhver tid har en aktiv,
                  fungerende og leverbar e-postadresse. Dersom e-postutsendelser til din adresse
                  avvises permanent av mottakers e-posttjener (hard bounce / 550-feil), eller
                  dersom det benyttes en fiktiv/engangs e-postadresse, forbeholder Kjøkkenhylla
                  seg retten til å <b>umiddelbart slette brukerkontoen permanent og svarteliste
                  e-postadressen uten forvarsel</b>.
                </Text>
              </Alert>

              <List spacing="xs" size="sm">
                <List.Item>
                  <b>Ubekreftede kontoer (opprydding):</b>
                  <List withPadding spacing={4} size="xs" mt={4}>
                    <List.Item>
                      <b>7 dager:</b> Sendes e-postpåminnelse dersom e-postadressen
                      ikke er bekreftet.
                    </List.Item>
                    <List.Item>
                      <b>14 dager (2 uker):</b> Kontoer som forblir ubekreftet
                      sperres automatisk for innlogging.
                    </List.Item>
                    <List.Item>
                      <b>30 dager (1 måned):</b> Sperrede, ubekreftede kontoer
                      og all tilhørende data slettes permanent fra systemet.
                    </List.Item>
                  </List>
                </List.Item>

                <List.Item mt="xs">
                  <b>Inaktive kontoer:</b>
                  <List withPadding spacing={4} size="xs" mt={4}>
                    <List.Item>
                      <b>6 måneder:</b> Dersom en brukerkonto har vært inaktiv uten
                      innlogging i 6 måneder, vil brukeren motta et e-postvarsel.
                    </List.Item>
                    <List.Item>
                      <b>1 år:</b> Kontoer som er inaktive i 1 år sperres i 30 dager
                      før de slettes permanent, med mindre brukeren logger inn og
                      bekrefter at kontoen fortsatt er i bruk.
                    </List.Item>
                  </List>
                </List.Item>
              </List>

              <Alert
                color="sage"
                variant="light"
                title="Datainnsyn og dataeksport (GDPR)"
                icon={<IconDownload size={20} />}
              >
                <Text size="xs">
                  Du har fullt innsyn i personopplysningene og brukerdataene som er registrert om deg.
                  Du kan når som helst hente ut og laste ned en kopi av dine brukerdata direkte til din
                  enhet fra profilinnstillingene på din konto.
                </Text>
              </Alert>
            </Stack>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 4 - Utestengelse og Svartelisting */}
          <div>
            <Title order={3} size="h4" mb={6}>
              4. Utestengelse, folkeskikk og svartelisting (Blacklisting)
            </Title>
            <Text size="sm" lh={1.6} mb="xs">
              Vi ønsker at Kjøkkenhylla skal være en trygg og ryddig plattform. Derfor gjelder følgende regler:
            </Text>
            <List spacing="xs" size="sm">
              <List.Item>
                <b>Krav til alminnelig folkeskikk:</b> Brukere plikter å opptre ordentlig og utvise
                alminnelig folkeskikk i all interaksjon med plattformen og i henvendelser til support og administrasjon.
              </List.Item>
              <List.Item>
                <b>Rett til utestengelse:</b> Siden Kjøkkenhylla er en privat plattform, forbeholder vi oss
                retten til når som helst, uten forvarsel eller begrunnelse, å utestenge, sperre eller slette brukere
                som bryter disse vilkårene, utviser uakseptabel oppførsel, benytter ugyldige e-postadresser, eller dersom
                vi av andre administrative/tekniske grunner finner det nødvendig.
              </List.Item>
              <List.Item>
                <b>Svartelisting av e-postadresser og domener:</b> Ved utestengelse, uleverbare e-postadresser (hard bounce),
                regelbrudd eller misbruk forbeholder vi oss retten til å svarteliste spesifikke e-postadresser eller hele e-postdomener.
                En svartelistet e-postadresse eller et svartelistet domene vil nektes framtidig registrering og tilgang til Kjøkkenhylla.
              </List.Item>
            </List>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 5 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              5. Oppskriftsskraping og opphavsrett
            </Title>
            <Text size="sm" lh={1.6} mb="xs">
              Oppskriftsskraperen i Kjøkkenhylla er utformet som et personlig arkiv-
              og organiseringsverktøy for privat bruk.
            </Text>
            <List spacing="xs" size="sm">
              <List.Item>
                <b>Personlig verktøy:</b> Kun ment for privat organisering og
                lagring.
              </List.Item>
              <List.Item>
                <b>Brukerens ansvar:</b> Når du skraper eller henter innhold fra
                eksterne nettsider, er du selv ansvarlig for at din bruk skjer i
                samsvar med de aktuelle nettsidenes egne brukervilkår, rettigheter
                og opphavsrett.
              </List.Item>
              <List.Item>
                <b>Ingen videreformidling:</b> Opphavsrettslig beskyttet materiale
                som skrapes til ditt private arkiv skal ikke videreformidles,
                redistribueres eller publiseres offentlig i strid med
                rettighetshavers tillatelse.
              </List.Item>
            </List>
          </div>

          {/* Seksjon 6 - Ansvarsfraskrivelse */}
          <Alert
            color="terracotta"
            title="6. Ansvarsfraskrivelse for helse, allergener og næringsinnhold"
            icon={<IconAlertTriangle size={20} />}
          >
            <Stack gap={6}>
              <Text size="xs">
                • <b>Veiledende data:</b> Beregninger av næringsinnhold, anbefalt
                dagsinntak og allergenmerking i Kjøkkenhylla er <b>kun veiledende</b>.
              </Text>
              <Text size="xs">
                • <b>Offentlige datakilder:</b> Informasjonen støtter seg blant annet
                på åpne data fra offentlige instanser som <i>Matvaretabellen</i>{" "}
                (Mattilsynet) og <i>Referanseverdier for energi og næringsstoffer</i>{" "}
                (Helsedirektoratet). Kjøkkenhylla garanterer ikke 100 % nøyaktighet
                for enkeltråvarer eller sammensatte retter.
              </Text>
              <Text size="xs">
                • <b>Ikke medisinsk rådgivning:</b> Innholdet i applikasjonen
                erstatter ikke profesjonell medisinsk rådgivning eller
                ernæringsfysiologisk veiledning.
              </Text>
              <Text size="xs">
                • <b>Allergier:</b> Ved alvorlige allergier, cøliaki, intoleranser
                eller spesifikke medisinske behov må du alltid sjekke produsentens
                originalemballasje og rådføre deg med autorisert helsepersonell eller
                klinisk ernæringsfysiolog. Kjøkkenhylla fraskriver seg ethvert
                ansvar for helseskader eller allergiske reaksjoner.
              </Text>
            </Stack>
          </Alert>

          {/* Seksjon 7 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              7. Eksterne lenker
            </Title>
            <Text size="sm" lh={1.6}>
              Kjøkkenhylla kan inneholde lenker til eksterne oppskriftssider eller
              samarbeidende nettsteder. Vi har ingen kontroll over og tar intet
              ansvar for innholdet, personvernreglene eller praksisen til eksterne
              nettsteder.
            </Text>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 8 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              8. Endringer i vilkårene
            </Title>
            <Text size="sm" lh={1.6}>
              Vi kan fra tid til annen oppdatere disse brukervilkårene. Ved
              vesentlige endringer vil vi informere om dette på nettstedet eller via
              e-post. Ved å fortsette å bruke Kjøkkenhylla etter at endringene trer
              i kraft, godtar du de oppdaterte vilkårene.
            </Text>
          </div>

          <Divider variant="dashed" />

          {/* Seksjon 9 */}
          <div>
            <Title order={3} size="h4" mb={6}>
              9. Kontakt oss
            </Title>
            <Text size="sm" lh={1.6}>
              Har du spørsmål vedrørende brukervilkårene? Ta kontakt med oss via
              kontaktskjemaet på nettstedet.
            </Text>
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
}