# 07 – Kjente Problemer & Teknisk Gjeld

Dette dokumentet samler konkrete, verifiserte funn i kodebasen — ikke antagelser. Alt her er sjekket direkte
mot koden (grep/lesing/`tsc --noEmit`/`eslint`), ikke gjettet. Oppdater denne listen når noe fikses eller nytt
oppdages; se git-historikken for hva som allerede er rettet (`npm run lint`/`tsc --noEmit` er begge rene).
Utsatte oppgaver og åpne avklaringer som ikke er tekniske feil ligger i [10 – Backlog](./10-backlog.md).

## Avhengig av backend

Backend sender nå alltid rollen med små bokstaver (`admin`/`user`), så det punktet er løst — normaliseringen på
frontend beholdes som forsvar (se [03, seksjon 6](./03-auth-and-session.md)). Det som gjenstår er et
`POST /connect/revoke`-endepunkt på Gatewayen for ekte token-invalidering ved utlogging (se
[03, seksjon 4.3](./03-auth-and-session.md)). Det blokkerer ikke noe på frontend-siden — utloggingen har et
fungerende, best-effort kompenserende tiltak på plass.

## Store, monolittiske sider uten backend

Kjernefunksjonaliteten appen faktisk er bygget for (oppskrifter, måltidsplan, handleliste) — og tre av
admin-sidene — er per nå UI-skisser med hardkodet mock-data, ikke koblet til `recipe-core-api`:

| Side                                      | Linjer | Mock-data-variabel                                     |
| ----------------------------------------- | ------ | ------------------------------------------------------ |
| `app/(user)/user/recipes/page.tsx`        | 555    | `mockRecipes`                                          |
| `app/(user)/user/recipes/[id]/page.tsx`   | 581    | (lokal state, ingen fetch)                             |
| `app/(user)/user/recipes/create/page.tsx` | 518    | `handleSubmit` gjør ingen `fetch`/`agentInternal`-kall |
| `app/(user)/user/mealplan/page.tsx`       | 1063   | `MOCK_USER_RECIPES`                                    |
| `app/(user)/user/shoppinglist/page.tsx`   | 329    | lokal state                                            |
| `app/(user)/user/import/page.tsx`         | 312    | lokal state                                            |
| `app/admin/whitelist/page.tsx`            | 297    | `mockDomainsData`                                      |
| `app/admin/categories/page.tsx`           | 394    | `mockCategories`, `mockIngredients`, `mockUnits`       |
| `app/admin/system/page.tsx`               | 361    | `mockServices`, `mockRecentLogs`                       |

Linjetallene er målt 2026-09-21. Ingen av disse følger skjemaarkitekturen i [06](./06-forms-and-design-system.md). Modellene for
oppskrifter/ingredienser finnes nå i `lib/models` (justert mot `recipe-core-api`), men sidene bruker dem ikke ennå,
og det finnes fortsatt ingen modeller for måltidsplan/handleliste. Se
[08 – Forslag til mappestruktur, seksjon 6](./08-model-and-component-structure-proposal.md) for anbefalt
migreringsrekkefølge. `app/admin/dashboard/page.tsx` er et særtilfelle — en bevisst intern
roadmap/sjekkliste for utviklerne selv, ikke et driftsdashboard.

## Modell-laget

- **`lib/models/admin/users/CreateAdminRequest.ts`** er korrekt eksportert, men brukes ingen steder — det
  finnes ingen "opprett ny admin"-flyt i adminpanelet i dag. Ikke en feil, men en planlagt funksjon som aldri
  ble bygget ferdig.

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

1. Lag en teststrategi (rammeverk, hva som skal dekkes først — trolig auth-flyten, siden den nå har fått en
   god del ny logikk med `agentInternal`s fornyelses-/retry-mekanisme) før noe annet av kjernedomene-arbeidet
   starter.
2. Koble sidene til ekte backend én om gangen, med riktig komponentstruktur (inkl. `DatesProvider`-oppsett for
   `@mantine/dates` når måltidsplanen kommer) — følg mappestrukturen og den besluttede rekkefølgen i
   [08](./08-model-and-component-structure-proposal.md#6-konkret-migreringsrekkefølge-når-dere-er-klare):
   kataloger (admin) → ingredienser → oppskrifter → måltidsplan → handleliste.
3. Vurder om `app/admin/whitelist`, `categories`, `system` skal prioriteres før eller etter kjernefunksjonene.
4. `POST /connect/revoke` på Gatewayen når det passer — ikke hastverk, utloggingen har et fungerende
   kompenserende tiltak på frontend-siden allerede.
