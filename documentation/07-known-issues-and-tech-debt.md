# 07 – Kjente Problemer & Teknisk Gjeld

Dette dokumentet samler konkrete, verifiserte funn i kodebasen — ikke antagelser. Alt her er sjekket direkte
mot koden (grep/lesing/`tsc --noEmit`/`eslint`), ikke gjettet. Oppdater denne listen når noe fikses eller nytt
oppdages.

## Rettet

**2026-09-13, runde 1:**

- ✅ `app/(auth)/login/DevQuickLogin.tsx` var en foreldreløs komponent — aldri importert noe sted. Login-siden
  hadde i stedet duplisert samme dev-innloggingslogikk inline. Filen er slettet.
- ✅ `app/confirm-email/page.tsx` redirectet til `/welcome` ved feil (finnes ikke — riktig rute er
  `/user/welcome`). Rettet.
- ✅ `lib/models/admin/users/BlacklistedEntry.ts` og `DeleteAndBlacklistUserAdminRequest.ts` hadde byttet om
  innhold (filnavn matchet ikke interface-navnet). Innhold byttet tilbake, importer oppdatert.

**2026-09-13, runde 2 (mappeoppsett + pakker + ESLint/Prettier + full opprydning av lint/tsc):**

- ✅ **`npm run lint` er nå 100 % rent** (var 25 feil, 16 advarsler). Alle reelle funn under er fikset, ikke
  bare undertrykt — se enkeltpunktene under.
- ✅ **`npx tsc --noEmit` er nå 100 % rent** (var 5 feil).
- ✅ **`npm run build` verifisert grønn** end-to-end etter alle endringene.
- ✅ Prosjektet er formatert med Prettier (`npm run format`), og `eslint-config-prettier` er koblet inn i
  `eslint.config.mjs` slik at ESLint og Prettier ikke lenger krangler om stilregler.
- ✅ `react-markdown` fjernet fra `package.json` (ubrukt). `dayjs` beholdt — bekreftet påkrevd
  peer-dependency av `@mantine/dates`. `recharts`/`@mantine/charts` beholdt (planlagt brukt).
- ✅ Mappeoppsett fra [08](./08-model-and-component-structure-proposal.md) delvis innført:
  `components/forms/ContactForm.tsx` → `components/forms/public/ContactForm.tsx`.
- ✅ **Ref-bug i `app/(user)/user/welcome/page.tsx` rettet.** `isRedirectingRef.current` ble lest direkte i
  render-kroppen (reell `react-hooks/refs`-feil — fungerte kun tilfeldig pga. timing). Løsningen fjernet hele
  `isRedirectingRef`/`isRedirecting`-mekanismen: `isInitializing` var allerede strukturelt garantert å forbli
  `true` i redirect-grenen (den returnerer før `.finally()` nås), så ingen egen ref/state trengtes i det hele
  tatt.
- ✅ **`react-hooks/set-state-in-effect` løst i alle 5 filer** (`app/admin/users/[Id]/page.tsx`,
  `app/admin/users/email/page.tsx`, `app/admin/users/page.tsx`, `components/admin/users/AdminBlacklistTable.tsx`,
  `app/confirm-email/page.tsx`). Rotårsaken var **ikke** `setLoading(true)` alene, men at
  `async/await`-funksjoner med `setState` i `try`-blokken (utenfor `finally`) blir flagget av denne regelen når
  de kalles fra en effekt — selv etter en `await`. `.then()/.catch()/.finally()`-kjeder med nøyaktig samme
  logikk blir **ikke** flagget. Alle fem er konvertert til `.then()`-stil. `app/admin/users/[Id]/page.tsx` fikk
  i tillegg en `key={id}`-basert remount-wrapper for å håndtere at `loading` skal bli `true` igjen ved
  id-endring uten en synkron `setState` inni effekten.
- ✅ `app/confirm-email/page.tsx`: den synkrone `setStatus("error")`-en for manglende `userId`/`token` er nå en
  avledet initial-verdi (`useState(hasValidLink ? "loading" : "error")`) i stedet for satt via effekt — samme
  "du trenger kanskje ikke denne effekten"-prinsipp.
- ✅ 7× `catch (error: any)` rettet til `catch (error: unknown)` + `error instanceof Error` (samme mønster som
  resten av kodebasen) i `app/api/auth/{complete-welcome,confirm-email,me,recover,resend-confirmation,
reset-password,set-password}/route.ts`.
- ✅ `react/no-unescaped-entities` i `legal/privacy/page.tsx` — rå `"`-tegn byttet til `«»`.
- ✅ `prefer-const` i `app/admin/users/page.tsx`. Ubrukte imports fjernet: `Text`
  (`DeleteAccountForm.tsx`), `IconSettings` (`navlinks.ts` og `(account)/settings/page.tsx`), `Link`
  (`mealplan/page.tsx`), `IconCheck`/`IconRefresh` (`shoppinglist/page.tsx`). Ubrukt catch-binding i
  `sessionManager.getUserRole` (`catch (error)` → `catch {`).
- ✅ **`GoogleLogin.tsx`/`GoogleRegister.tsx`:** `@next/next/no-location-assign-relative-destination`-varselet
  er dempet med `eslint-disable-next-line` + forklarende kommentar — `window.location.href` er tilsiktet her
  (må være ekte nettleser-navigasjon for OAuth-redirect-kjeden).
- ✅ **Dødt/selvmotsigende i modell-laget slettet:** `lib/models/auth/openIddictResponse.ts` (uexportert,
  ubrukt duplikat — den ekte typen bor i `sessionManager.ts`), `lib/models/auth/deleteProfileRequest.ts`
  (uexportert, ubrukt), `lib/models/user/user.ts` (ubrukt alias).
- ✅ **Halvferdig paginering av brukerlisten — rullet tilbake til client-side (bevisst valg, ikke fullført
  migrering).** `app/api/admin/users/route.ts` henter nå igjen en flat liste uten query-params, i tråd med hva
  `agentAuthAdmin.getUsers()` og `app/admin/users/page.tsx` faktisk gjør. `AdminUserQueryParams.ts` og
  `paginatedResponse.ts` (nylig flyttet ut av `admin/users/`, se [08](./08-model-and-component-structure-proposal.md))
  er slettet siden de ikke lenger brukes noe sted. Server-side paginering kan bygges skikkelig senere når
  brukerlisten faktisk blir stor nok til å trenge det.
- ✅ **`AsyncMainContainerProps.children` gjort valgfri** i `components/containers/MainContainer.tsx` (var
  påkrevd via `MainContainerProps`, som ga `tsc`-feil når komponenten brukes som ren `Suspense`-fallback uten
  eget innhold, f.eks. i `confirm-email/page.tsx` og `admin/users/email/page.tsx`).
- ✅ **Mealplan-datovelgeren** (`app/(user)/user/mealplan/page.tsx`): Mantine v9 sin `DatePickerInput` returnerer
  en ISO-dato-streng i `onChange`, ikke et `Date`-objekt. Lagt til en lokal konvertering
  (`value ? new Date(value) : new Date()`) siden resten av siden bruker `Date`.
- ✅ **Dødt `!session`-mønster fjernet** i `login/page.tsx`, `register/page.tsx`, `recover/page.tsx`,
  `reset-password/page.tsx` — `useSession()` kaster hvis den brukes utenfor providertreet, så
  `if (!session || ...)` var alltid `false` og maskerte en reell `exhaustive-deps`-advarsel.
- ✅ `ProfileEditForm.tsx`: `form` bevisst utelatt fra `useEffect`-deps (Mantines `useForm()` returnerer et nytt
  objekt hver render), nå dokumentert med `eslint-disable-next-line` + begrunnelse i stedet for en stille
  advarsel.

---

## Fortsatt åpent

### Auth & sesjon (høyest prioritet — påvirker brukeropplevelsen direkte)

**Ingen token-fornyelse for API-kall, kun for sidenavigasjon.** `proxy.ts` sin matcher
(`/dashboard/:path*`, `/user/:path*`, `/admin/:path*`) dekker ikke `/api/:path*`. Token-fornyelse skjer derfor
kun når brukeren _navigerer_ til en beskyttet side — ikke når en klientkomponent gjør et `agentInternal`-kall
mens brukeren blir stående på samme side. Ingen 401-interceptor finnes for å fange dette opp.
`agentAuth.refresh()` er implementert, men kalles aldri fra noe sted i kodebasen. **Dette er den mest
sannsynlige rotårsaken til at brukere mister sesjonen uventet.** → Full gjennomgang og forslag til fix:
[03 – Auth & sesjon, seksjon 5](./03-auth-and-session.md#5-hva-proxyts-ikke-dekker--rotårsaken-til-de-fleste-sesjonsproblemer).

**Miljøvariabel-mismatch i `proxy.ts`.** Leser `NEXT_PUBLIC_AUTH_API` for token-refresh-kallet; resten av
appen bruker `AUTH_API`. `NEXT_PUBLIC_AUTH_API` er ikke satt i `.env.local`, så proxyen kjører alltid på en
hardkodet fallback-URL. Fungerer i dag ved tilfeldighet. →
[03 – Auth & sesjon, "Kjent svakhet"](./03-auth-and-session.md#kjent-svakhet-miljøvariabel-mismatch).

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

### Sikkerhet

**`npm audit`: kritisk sårbarhet i Next.js.** Installert versjon (16.3.2) har en kjent kritisk sårbarhet
(uautentisert RCE på Windows-hostede servere, og i bilde-optimalisering ved AVIF-filer), fikset i 16.3.5. Samt
en høy-alvorlighetsgrad-sårbarhet i `sharp` og `js-yaml` (transitive avhengigheter). `npm audit fix --force`
vil installere Next 16.3.5 (utenfor det angitte range i `package.json` i dag). **Ikke oppgradert ennå** — dette
er en versjonsendring som bør gjøres bevisst (denne Next-versjonen har egne konvensjonsendringer, se
`AGENTS.md`), ikke som en stille del av en opprydningsrunde. Bør prioriteres høyt.

### Store, monolittiske sider uten backend

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

### Modell-laget

- **`lib/models/admin/users/CreateAdminRequest.ts`** er korrekt eksportert, men brukes ingen steder — det
  finnes ingen "opprett ny admin"-flyt i adminpanelet i dag. Ikke en feil, men en planlagt funksjon som aldri
  ble bygget ferdig.
- **`UserRoleType`** trenger fortsatt innstramming — se Auth & sesjon-punktet over.

### Inkonsekvent passord-policy på tvers av tre skjemaer

Samme underliggende felt (`newPassword`/`password`), tre forskjellige regelsett:

| Skjema                   | Krav                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `RegisterForm.tsx`       | Min. 8 tegn + stor bokstav + liten bokstav + tall + spesialtegn |
| `ChangePasswordForm.tsx` | Min. 8 tegn — ingen kompleksitetskrav                           |
| `ResetPasswordForm.tsx`  | Min. **6** tegn — ingen kompleksitetskrav                       |

Hvis backend faktisk håndhever registrerings-policyen serverside for alle tre endepunktene, vil brukere som
bytter/tilbakestiller passord kunne bli avvist av backend selv om frontend-valideringen sa OK. Bør samles i én
delt valideringsfunksjon.

### `app/(user)/user/welcome/page.tsx` — designsystem-avvik

Hele siden bruker Mantines innebygde `color="teal"` konsekvent i stedet for appens `sage`/`terracotta`-palett
fra [06 – Designsystem](./06-forms-and-design-system.md). Eneste side i appen som gjør dette.

### Ubrukte/uferdig konfigurerte npm-avhengigheter

`@mantine/charts`/`recharts` er installert for kommende funksjonalitet (bekreftet — se punktet over). Ingen
handling nødvendig nå. `@mantine/dates` brukes ett sted (`DatePickerInput` i `mealplan/page.tsx`) uten en
`DatesProvider`/dayjs-adapter satt opp i `app/layout.tsx`, som Mantine v9 sine datokomponenter normalt
forventer — verdt å konfigurere riktig når flere datovelgere legges til.

### Mindre funn

- `FormField.tsx` sin `type="email"`-variant brukes ingen steder, og ville uansett ikke satt `type="email"`
  som HTML-attributt selv om den ble brukt (`type`-proppen styrer kun hvilken Mantine-komponent som velges).
  Ufarlig i dag, men et no-op dersom noen forventer at den gjør noe.
- **Ingen tester.** Ingen `test`-script i `package.json`, ingen Jest/Vitest-konfigurasjon.

## Foreslått rekkefølge for videre arbeid

1. Vurder Next.js-sikkerhetsoppdateringen (kritisk RCE) som egen, bevisst oppgave.
2. Fiks auth/sesjon-svakhetene (miljøvariabel-mismatch er triviell; 401-håndtering krever litt design — se de
   tre alternativene i [03](./03-auth-and-session.md#5-hva-proxyts-ikke-dekker--rotårsaken-til-de-fleste-sesjonsproblemer)).
   Ta `UserRoleType`-innstrammingen og `Header.tsx`-fiksen samtidig, siden de henger sammen.
3. Før mer av kjernedomenet bygges: fullfør mappestrukturen for `lib/models/` og `components/` fra
   [08](./08-model-and-component-structure-proposal.md) etter hvert som hvert domene faktisk bygges.
4. Design datamodell + API-lag for oppskrifter/måltidsplan/handleliste, og migrer én side om gangen til ekte
   backend + riktig komponentstruktur.
5. Vurder om `app/admin/whitelist`, `categories`, `system` skal prioriteres før eller etter kjernefunksjonene.
