# 07 – Kjente Problemer & Teknisk Gjeld

Dette dokumentet samler konkrete, verifiserte funn i kodebasen — ikke antagelser. Alt her er sjekket direkte
mot koden (grep/lesing/`tsc --noEmit`/`eslint`), ikke gjettet. Oppdater denne listen når noe fikses eller nytt
oppdages; se git-historikken for hva som allerede er rettet (bl.a. `npm run lint`/`tsc --noEmit` er begge
100 % rene per commit `79e8305`).

## Auth & sesjon

**Inkonsistent rollesjekk i `Header.tsx`.** Sammenligner `session.role === "Admin"` (case-sensitiv), mens
`proxy.ts` og alle andre steder bruker `.toLowerCase() === "admin"`. Rotårsaken er trolig
`lib/models/types.ts`: `export type UserRoleType = "Admin" | "User" | string;` — `| string` gjør at TypeScript
kollapser hele unionen til bare `string`, og gir null kompileringstids-beskyttelse. **Ikke rettet ennå** fordi
en innstramming av `UserRoleType` utløser en reell type-feil i `google-callback/route.ts`
(`role: role || "user"` — rollen kommer uvalidert fra en query-param og er ofte små bokstaver) som krever en
bevisst beslutning om hvordan den verdien skal normaliseres, ikke en mekanisk fiks.

**Ingen server-side invalidering ved utlogging.** `app/api/auth/logout/route.ts` sletter kun lokale cookies —
det sendes ikke noe kall til Gatewayen for å invalidere access-/refresh-tokenet server-side. Et allerede
utstedt token forblir gyldig til det utløper naturlig, selv etter "utlogging".

## Store, monolittiske sider uten backend

Kjernefunksjonaliteten appen faktisk er bygget for (oppskrifter, måltidsplan, handleliste) — og tre av
admin-sidene — er per nå UI-skisser med hardkodet mock-data, ikke koblet til `recipe-core-api`:

| Side                                      | Linjer | Mock-data-variabel                                     |
| ----------------------------------------- | ------ | ------------------------------------------------------ |
| `app/(user)/user/recipes/page.tsx`        | 541    | `mockRecipes`                                          |
| `app/(user)/user/recipes/[id]/page.tsx`   | 547    | (lokal state, ingen fetch)                             |
| `app/(user)/user/recipes/create/page.tsx` | 518    | `handleSubmit` gjør ingen `fetch`/`agentInternal`-kall |
| `app/(user)/user/mealplan/page.tsx`       | ~1040  | `MOCK_USER_RECIPES`                                    |
| `app/(user)/user/shoppinglist/page.tsx`   | 313    | lokal state                                            |
| `app/(user)/user/import/page.tsx`         | 282    | lokal state                                            |
| `app/admin/whitelist/page.tsx`            | 311    | `mockDomainsData`                                      |
| `app/admin/categories/page.tsx`           | 373    | `mockCategories`, `mockIngredients`, `mockUnits`       |
| `app/admin/system/page.tsx`               | 360    | `mockServices`, `mockRecentLogs`                       |

Ingen av disse følger skjemaarkitekturen i [06](./06-forms-and-design-system.md), og det finnes ingen
`lib/models`-filer for oppskrifter/måltidsplan/handleliste ennå. Se
[08 – Forslag til mappestruktur, seksjon 6](./08-model-and-component-structure-proposal.md) for anbefalt
migreringsrekkefølge. `app/admin/dashboard/page.tsx` er et særtilfelle — en bevisst intern
roadmap/sjekkliste for utviklerne selv, ikke et driftsdashboard.

## Modell-laget

- **`lib/models/admin/users/CreateAdminRequest.ts`** er korrekt eksportert, men brukes ingen steder — det
  finnes ingen "opprett ny admin"-flyt i adminpanelet i dag. Ikke en feil, men en planlagt funksjon som aldri
  ble bygget ferdig.
- **`UserRoleType`** trenger fortsatt innstramming — se Auth & sesjon-punktet over.

## Inkonsekvent passord-policy på tvers av tre skjemaer

Samme underliggende felt (`newPassword`/`password`), tre forskjellige regelsett:

| Skjema                   | Krav                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `RegisterForm.tsx`       | Min. 8 tegn + stor bokstav + liten bokstav + tall + spesialtegn |
| `ChangePasswordForm.tsx` | Min. 8 tegn — ingen kompleksitetskrav                           |
| `ResetPasswordForm.tsx`  | Min. **6** tegn — ingen kompleksitetskrav                       |

Hvis backend faktisk håndhever registrerings-policyen serverside for alle tre endepunktene, vil brukere som
bytter/tilbakestiller passord kunne bli avvist av backend selv om frontend-valideringen sa OK. Bør samles i én
delt valideringsfunksjon.

## Ubrukte/uferdig konfigurerte npm-avhengigheter

`@mantine/charts`/`recharts` er installert for kommende funksjonalitet (bekreftet). Ingen handling nødvendig
nå. `@mantine/dates` brukes ett sted (`DatePickerInput` i `mealplan/page.tsx`) uten en
`DatesProvider`/dayjs-adapter satt opp i `app/layout.tsx`, som Mantine v9 sine datokomponenter normalt
forventer — verdt å konfigurere riktig når flere datovelgere legges til (naturlig å ta sammen med resten av
mock-side-migreringen, se over).

## Mindre funn

- `FormField.tsx` sin `type="email"`-variant brukes ingen steder, og ville uansett ikke satt `type="email"`
  som HTML-attributt selv om den ble brukt (`type`-proppen styrer kun hvilken Mantine-komponent som velges).
  Ufarlig i dag, men et no-op dersom noen forventer at den gjør noe.

## Ingen teststrategi

Ingen `test`-script i `package.json`, ingen Jest/Vitest-konfigurasjon, ingen tester noe sted i kodebasen.
**Egen oppgave** — trenger en bevisst teststrategi (rammeverk, hva som skal prioriteres først — trolig
auth-flyten gitt hvor mye som skjer der) før selve testarbeidet starter. Ikke noe å løse i forbifarten sammen
med andre fikser.

## Foreslått rekkefølge for videre arbeid

1. Stram inn `UserRoleType` og fiks `Header.tsx`-rollesjekken (henger sammen, se punktet over).
2. Lag en teststrategi (rammeverk, hva som skal dekkes først — trolig auth-flyten, siden den nå har fått en
   god del ny logikk med `agentInternal`s fornyelses-/retry-mekanisme) før noe annet av kjernedomene-arbeidet
   starter.
3. Design datamodell + API-lag for oppskrifter/måltidsplan/handleliste (inkl. `DatesProvider`-oppsett for
   `@mantine/dates`), og migrer én side om gangen til ekte backend + riktig komponentstruktur — følg
   mappestrukturen i [08](./08-model-and-component-structure-proposal.md).
4. Vurder om `app/admin/whitelist`, `categories`, `system` skal prioriteres før eller etter kjernefunksjonene.
