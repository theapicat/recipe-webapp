# 10 – Backlog & utsatte avklaringer

Sist oppdatert 2026-09-21. Dette dokumentet samler ting som **bevisst er utsatt** — det er ikke feil i koden
(det er [07](./07-known-issues-and-tech-debt.md)), men arbeid, avklaringer og backend-avhengigheter vi har snakket
om og valgt å ta senere. Ta en ting av lista og flytt den til 07/02/09 når den bygges.

## 1. Besluttet rekkefølge og arbeidsprinsipper

- **Rekkefølge:** kataloger (admin) → ingredienser → oppskrifter → måltidsplan → handleliste. Oppskrifter avhenger
  av ingredienser, som igjen avhenger av katalogene (se [08, seksjon 6](./08-model-and-component-structure-proposal.md#6-konkret-migreringsrekkefølge-når-dere-er-klare)).
- **Kun de modellene backend faktisk har.** Frontend bygges mot modellene i `recipe-core-api`. Funksjoner mockene
  viser som backend ikke har (se seksjon 3) bygges ikke før backend har dem.
- **Kun to HTTP-agenter** (`agentInternal`, `agentExternal`), og alle nye endepunkter følger malen i
  [04, seksjon 7](./04-api-integration-and-data-models.md#7-mal-slik-legger-du-til-et-nytt-backend-endepunkt).
- **Ingen caching på frontend.** Backend cacher katalogene. Om vi trenger å lagre data i nettleseren tas det opp når
  vi begynner på komponentene (spesielt ingredienslisten på ~1 565 rader og katalogene som brukes til id → navn-oppslag).
- **Ingen frontend-tester foreløpig** — se seksjon 4. Backend har omfattende tester (enhetstester og
  endepunkt-tester).

## 2. Neste på lista

1. **Kataloger (admin):** én generisk CRUD-flate for de seks skrivbare katalogene (ingrediens-kategorier, allergener,
   søkeord, enhetstyper, enheter, oppskriftskategorier). Erstatter mock-siden `app/admin/categories`.
   Næringsstoffdefinisjoner er skrivebeskyttet i backend og får ingen admin-flate.
2. **Ingredienser:** admin-editor for ingredienser (her tagges allergener), «mine ingredienser» (ubekreftede
   ingredienser med review-livssyklus), admin-kø for godkjenning/sammenslåing/avvisning, og et oppslag
   (`/user/ingredients`, se [09](./09-recipe-domain-and-planned-pages.md)).
3. **Oppskrifter:** opprett/rediger-skjema (med ingrediensvelger og enhetsvalg) → liste → detalj → næringsfane →
   redigering → kokemodus.

## 3. Utsatt fordi backend ikke har det ennå

| Funksjon                                      | Status / merknad                                                                                                                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| «Laget X ganger» / «sist laget»               | Skal **ikke** være tellere på oppskriften. Løses trolig av en egen modell («kokelogg» — hva ble laget når) som hører sammen med måltidsplanen. Mock-fanen «Ofte laget» bygges ikke før den finnes. |
| Forberedelses- vs. koketid, «forfatter»       | Backend har kun `cookTimeMinutes` (utledet av stegtimere) og ingen forfatterfelt. Bygges ikke.                                                                                                     |
| Allergen-preferanser / brukerinnstillinger    | Skal bo i Core (brukerinnstillinger). Ikke startet. Mock-innstillingssiden har kun lokal state. Ekskluder-allergen-filteret er uansett ikke pålitelig før ingrediensene er allergen-tagget.        |
| Sletting av konto → opprydding                | Auth API sender en hendelse når en konto slettes, og Core skal slette brukerens oppskrifter og øvrige data. Ikke bygget i Core ennå — til da blir brukerdata liggende igjen.                       |
| Måltidsplan, handleliste                      | Ikke startet i backend. Avhenger av avklaringen «ingrediens vs. produkt» (egen produktmodell, flytte ingrediens → produkt).                                                                        |
| Import (skraping)                             | Skrapetjenesten leverer via RabbitMQ; Core-siden (consumer som oppretter `Scraped`-oppskrifter) er ikke bygget. `app/(user)/user/import` er en mock.                                               |
| Deling av oppskrifter                         | Planlagt som «kopier til annen bruker» (ny rad, ingen lineage). Mock-listen har en «del på e-post»-dialog som skjules/deaktiveres.                                                                 |
| Opplasting av bilder                          | Kun `imageUrl` (http/https) per i dag.                                                                                                                                                             |
| Varsler når en ubekreftet ingrediens avgjøres | Planlagt (hendelse → e-post). Inntil videre ser brukeren utfallet på listen sin.                                                                                                                   |
| Admin `whitelist` og `system`                 | Ingen backend for disse. Forblir mocks.                                                                                                                                                            |
| «Legg til på handleliste»-knappen             | Skjules/deaktiveres til handlelisten finnes.                                                                                                                                                       |

## 4. Utsatt frontend-arbeid og åpne avklaringer

- **Teststrategi for frontend** (rammeverk, hva som dekkes først — trolig ren logikk som næringsgruppering,
  enhetsvalg og porsjonsskalering, samt auth-flyten). Bevisst utelatt i denne runden.
- **Verifisering gjennom Gatewayen.** Core er så langt testet direkte mot sin egen port. Må sjekkes når tjenestene
  kjører: path-enkodede næringsstoff-id-er (`Vit%20C`, `Mono%2BDi`), `Location`-headeren ved 201 (inneholder Cores egen
  vert — bruk `id` fra body), og gjentatt query-parameter `excludeAllergenId`.
- **Server Components / Server Actions som alternativ til route handlers.** `agentExternal` er kun server-side
  (leser httpOnly-cookien), så klientkomponenter kan ikke kalle den direkte. Dagens løsning er route handlers +
  `agentInternal`. Server Components (lesing) og Server Actions (skriving) kunne kalt `agentExternal` uten egne
  ruter — ikke besluttet; se [04, seksjon 7](./04-api-integration-and-data-models.md) for gjeldende mal. Verifiser i
  så fall at `proxy.ts` fornyer tokenet også for Server Actions.
- **Sjekk auth-/admin-modellene** (`lib/models/auth`, `lib/models/admin/users`) mot Auth API sine DTO-er. Kun
  Core-modellene er verifisert mot backend.
- **`/api/auth/refresh` nullstiller sesjonen ved enhver feil**, også ved nettverksfeil mot Gatewayen (ikke bare når
  refresh-tokenet er utløpt). Bevisst uendret i refaktoreringen; kan skille 503/504 fra 401/400 senere.
- **`POST /connect/revoke` på Gatewayen** (ekte token-invalidering ved utlogging) — se
  [03, seksjon 4.3](./03-auth-and-session.md).
- **Passord-policy** er inkonsekvent på tvers av tre skjemaer — se [07](./07-known-issues-and-tech-debt.md).
- **`@mantine/dates`** mangler `DatesProvider`-oppsett — tas sammen med måltidsplanen.
- **`agentRules`-blokken** som `next dev` skriver inn i `CLAUDE.md` (se [01](./01-architecture-and-setup.md)) kan slås av
  i `next.config.ts` om den blir plagsom.

## 5. Forbehold i backend som påvirker UI (status per 2026-09-20)

Kilde: `recipe-core-api` sine egne notater og `Documentation/08-api-reference.md` i det repoet.

- Alle 1 565 seedede ingredienser har `isVerified: false` og **ingen allergener** — ikke vis advarsel på alle, og
  ikke selg allergenfilteret som en sikkerhetsfunksjon ennå.
- `defaultUnitId` er `dl` for mange ingredienser (f.eks. egg) fordi den utledes fra porsjonene. Vurder å foretrekke
  `stk` i enhetsvalget når ingrediensen har en stk-porsjon.
- Kalkulatoren for næring finner vekt/volum via **navnet** på enhetstypene (`vekt`, `volum`). Omdøpes de, gir alle
  linjer `NoConversion` (aldri feil tall). Be admin ikke omdøpe dem.
- Generisk katalog-`PUT` på en rad som ikke finnes gir `200` (ikke `404`), og `DELETE` gir `204` selv om ingenting ble
  slettet. Ingredienser, ubekreftede ingredienser og oppskrifter gir `404`.
- Oppskriftstittel-unikhet per bruker er ikke besluttet (ikke håndhevet). Grensen på 500 oppskrifter per bruker kan
  senere variere med kontotype — ikke hardkod tallet mange steder.
- Seeden inneholder mange produkt-/rett-lignende oppføringer (yoghurt med smak, ferdigretter, brød). Ikke bygg UI som
  antar at ingredienslisten er endelig — en egen produktmodell er planlagt.
