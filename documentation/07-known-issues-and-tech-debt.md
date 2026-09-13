# 07 – Kjente Problemer & Teknisk Gjeld

Dette dokumentet samler konkrete, verifiserte funn i kodebasen — ikke antagelser. Alt her er sjekket direkte
mot koden (grep/lesing/`tsc --noEmit`), ikke gjettet. Oppdater denne listen når noe fikses eller nytt oppdages.

**Rettet 2026-09-13** (se git-historikk for detaljer):
- ✅ `app/(auth)/login/DevQuickLogin.tsx` var en foreldreløs komponent — aldri importert noe sted. Login-siden
  hadde i stedet duplisert samme dev-innloggingslogikk inline. Filen er slettet.
- ✅ `app/confirm-email/page.tsx` redirectet til `/welcome` ved feil (finnes ikke — riktig rute er
  `/user/welcome`). Rettet.
- ✅ `lib/models/admin/users/BlacklistedEntry.ts` og `DeleteAndBlacklistUserAdminRequest.ts` hadde byttet om
  innhold (filnavn matchet ikke interface-navnet). Innhold byttet tilbake, og de tre importstedene
  (`agentAuthAdmin.ts`, `app/api/admin/users/blacklist/route.ts`, `AdminBlacklistTable.tsx`) oppdatert.

---

## Auth & sesjon (høyest prioritet — påvirker brukeropplevelsen direkte)

### Ingen token-fornyelse for API-kall, kun for sidenavigasjon

`proxy.ts` sin matcher (`/dashboard/:path*`, `/user/:path*`, `/admin/:path*`) dekker ikke `/api/:path*`.
Token-fornyelse skjer derfor kun når brukeren *navigerer* til en beskyttet side — ikke når en klientkomponent
gjør et `agentInternal`-kall mens brukeren blir stående på samme side. Ingen 401-interceptor finnes for å
fange dette opp. `agentAuth.refresh()` er implementert, men kalles aldri fra noe sted i kodebasen.
**Dette er den mest sannsynlige rotårsaken til at brukere mister sesjonen uventet.**
→ Full gjennomgang og forslag til fix: [03 – Auth & sesjon, seksjon 5](./03-auth-and-session.md#5-hva-proxyts-ikke-dekker--rotårsaken-til-de-fleste-sesjonsproblemer).

### Miljøvariabel-mismatch i `proxy.ts`

`proxy.ts` leser `NEXT_PUBLIC_AUTH_API` for token-refresh-kallet; resten av appen bruker `AUTH_API`.
`NEXT_PUBLIC_AUTH_API` er ikke satt i `.env.local`, så proxyen kjører alltid på en hardkodet fallback-URL.
Fungerer i dag ved tilfeldighet. → [03 – Auth & sesjon, "Kjent svakhet"](./03-auth-and-session.md#kjent-svakhet-miljøvariabel-mismatch).

### Inkonsistent rollesjekk i `Header.tsx`

`components/layout/Header.tsx` sammenligner `session.role === "Admin"` (case-sensitiv), mens `proxy.ts` og
alle innloggingssider bruker `.toLowerCase() === "admin"`. Fungerer i dag fordi backend alltid sender
`"Admin"`/`"User"` med stor forbokstav, men er skjørt hvis det noen gang endres.

### Ingen server-side invalidering ved utlogging

`app/api/auth/logout/route.ts` sletter kun lokale cookies (`sessionManager.removeSession()`) — det sendes
ikke noe kall til Gatewayen for å invalidere access-/refresh-tokenet server-side. Et allerede utstedt token
forblir gyldig til det utløper naturlig, selv etter "utlogging". Vurder om dette er tilsiktet eller bør
adresseres på backend-siden (revocation endpoint).

### Halvferdig paginering av brukerlisten — brutt i alle tre lag

Dette er verre enn først antatt — full dypdykk viser at **alle tre lag** er ute av synk:

1. `app/api/admin/users/route.ts` (route handler) bygger `AdminUserQueryParams` (søk/filter/side) og forventer
   `PaginatedResponse<AdminUserListItem>` tilbake.
2. `agentAuthAdmin.getUsers()` tar per nå **ingen argumenter** og returnerer en flat `AdminUserListItem[]` —
   ignorerer altså query-params fullstendig og gir feil returtype. Gir reelle TypeScript-feil:
   ```
   app/api/admin/users/route.ts(27,48): error TS2554: Expected 0 arguments, but got 1.
   app/api/admin/users/route.ts(32,7): error TS2739: Type 'AdminUserListItem[]' is missing ... totalItems, page, pageSize, totalPages, items
   ```
3. **`app/admin/users/page.tsx` (selve siden) har heller ikke fulgt med:** den kaller fortsatt et rent
   `GET /api/admin/users` uten query-params, henter *hele* brukerlisten i ett kall, og gjør så all filtrering,
   sortering og paginering client-side i en stor `useMemo` (`filteredUsers`). Modellene
   (`AdminUserQueryParams`, `PaginatedResponse`) er altså lagt til, men ingenting av de tre lagene bruker dem
   slik de var tiltenkt.

**Anbefaling:** ta en beslutning én vei — enten (a) fullfør migreringen til ekte server-side paginering i alle
tre lag, eller (b) dropp `AdminUserQueryParams`/`PaginatedResponse` for nå og behold client-side filtrering
(fungerer fint så lenge brukerlisten er liten), og fjern de ubrukte modellene til dere faktisk trenger dem.
→ [05 – Adminpanelet](./05-admin-panel.md#kjent-halvferdig-migrering-paginering).

---

## `npm run lint` feiler i dag (25 feil, 16 advarsler)

Kjørt `npx eslint .` mot hele repoet — dette er ikke advarsler, det er **feil** som får lint-kommandoen til å
returnere non-zero i dag. Om dere har (eller planlegger) en CI-sjekk på lint, blokkerer dette den allerede nå.

**Reelt gjentakende mønster (5 filer) — `react-hooks/set-state-in-effect`:** samme form for
data-henting-i-effekt gir feil samme sted i `app/admin/users/[Id]/page.tsx`, `app/admin/users/email/page.tsx`,
`app/admin/users/page.tsx`, `components/admin/users/AdminBlacklistTable.tsx` og `app/confirm-email/page.tsx`
— alle kaller en `fetchX()`/`setStatus()` synkront inni `useEffect(() => { fetchX(); }, [fetchX])`, der
`fetchX` selv kaller `setLoading(true)` synkront som første linje. Siden mønsteret er identisk 5 steder, er
dette en god kandidat for en delt `useFetch`/`useAsyncData`-hook fremover i stedet for å gjenta det per side.

**Reelt gjentakende mønster (7 filer) — `@typescript-eslint/no-explicit-any`:** de fleste route handlers
bruker `catch (error: unknown) { ... error instanceof Error ... }`, men disse syv bruker i stedet
`catch (error: any) { ... error.message ... }`, som er en reell lint-feil under dagens config:
`app/api/auth/complete-welcome/route.ts`, `confirm-email/route.ts`, `me/route.ts`, `recover/route.ts`,
`resend-confirmation/route.ts`, `reset-password/route.ts`, `set-password/route.ts`.

**Reell feil (React 19 / ny lint-regel) — `react-hooks/refs`:** `app/(user)/user/welcome/page.tsx:117` leser
`isRedirectingRef.current` direkte i render-kroppen (`const isLoading = !user || isRedirectingRef.current || ...`).
Ref-mutasjonen (`isRedirectingRef.current = true` i effekten) trigger ingen re-render, så denne verdien er i
praksis "gjettet" ut fra timing — den fungerer i dag bare fordi `router.replace()` skjer rett etterpå. Sammenlign
med `hasExecutedRef`-mønsteret i `confirm-email/page.tsx`, som er korrekt brukt (kun lest inni effekten, aldri
under render).

**Trivielt, men reelt:** `let result = allUsers.filter(...)` i `app/admin/users/page.tsx:121` bør være `const`
(`prefer-const`-feil). Ubrukte imports: `Text` i `DeleteAccountForm.tsx`, `IconSettings` i
`components/layout/header/navlinks.ts`. Ubrukt catch-binding i `sessionManager.getUserRole` (`catch (error)`
→ bør være `catch {`).

---

## Store, monolittiske sider uten backend

Kjernefunksjonaliteten appen faktisk er bygget for (oppskrifter, måltidsplan, handleliste) — og tre av
admin-sidene — er per nå UI-skisser med hardkodet mock-data, ikke koblet til `recipe-core-api`:

| Side | Linjer | Mock-data-variabel |
| --- | --- | --- |
| `app/(user)/user/recipes/page.tsx` | 541 | `mockRecipes` |
| `app/(user)/user/recipes/[id]/page.tsx` | 547 | (lokal state, ingen fetch) |
| `app/(user)/user/recipes/create/page.tsx` | 518 | `handleSubmit` gjør ingen `fetch`/`agentInternal`-kall |
| `app/(user)/user/mealplan/page.tsx` | 1041 | `MOCK_USER_RECIPES` |
| `app/(user)/user/shoppinglist/page.tsx` | 313 | lokal state |
| `app/(user)/user/import/page.tsx` | 282 | lokal state |
| `app/admin/whitelist/page.tsx` | 311 | `mockDomainsData` |
| `app/admin/categories/page.tsx` | 373 | `mockCategories`, `mockIngredients`, `mockUnits` |
| `app/admin/system/page.tsx` | 360 | `mockServices`, `mockRecentLogs` |

Ingen av disse følger skjemaarkitekturen i [06](./06-forms-and-design-system.md) (ingen `*Form.tsx`,
`AppFormProvider`, `FormField`, `CreateFormContainer`/`EditFormContainer`) — all logikk og markup ligger
inline i `page.tsx`. Det finnes heller ingen `lib/models`-filer for oppskrifter/måltidsplan/handleliste.

**Konsekvens for videre arbeid:** før disse kan kobles til ekte data må det (1) defineres modeller i
`lib/models/recipes/` (eller tilsvarende), (2) legges til `agentAuth`-lignende wrappere mot
`recipe-core-api`, (3) opprettes route handlers under `app/api/recipes/` (eller domenenavnet backend bruker),
og (4) brytes de eksisterende sidene opp i page → form/feature-komponent → container, slik auth/admin gjør
det. Dette er trolig den største enkeltstående jobben i prosjektet videre.

`app/admin/dashboard/page.tsx` er et særtilfelle — den er ikke "mock data som skal bli ekte", men en bevisst
intern roadmap/sjekkliste (`initialRoadmap`) for utviklerne selv. Bør ikke forveksles med et driftsdashboard.

---

## Modell-laget (`lib/models/`) — foreldreløse og selvmotsigende typer

Systematisk orphan-scan (grep etter faktisk bruk av hver eksporterte type) avdekket:

- **`lib/models/auth/openIddictResponse.ts`** definerer `interface OpenIddictTokenResponse` — **uten
  `export`**, og brukes ingen steder. Den *faktiske* `OpenIddictTokenResponse` som brukes overalt
  (`proxy.ts`, `agentAuth.ts`, `google-callback/route.ts`) er definert direkte inni
  `lib/session/sessionManager.ts`. Modellfilen i `lib/models/` er altså en glemt, ubrukelig duplikat av noe
  som faktisk lever et annet sted. Bør enten slettes, eller sessionManager bør importere derfra i stedet for
  å definere sin egen.
- **`lib/models/auth/deleteProfileRequest.ts`** definerer `interface DeleteProfileRequest` — også uten
  `export`, og brukes ingen steder. `agentAuth.deleteProfile()` tar i praksis ingen body. Kandidat for
  sletting.
- **`lib/models/user/user.ts`** eksporterer `type User = UserProfileResponse` — et alias som aldri
  importeres noe sted i kodebasen. Kandidat for sletting (eller ta i bruk konsekvent i stedet for
  `UserProfileResponse` direkte, om det er poenget med det).
- **`lib/models/admin/users/CreateAdminRequest.ts`** er korrekt eksportert, men brukes ingen steder — det
  finnes ingen "opprett ny admin"-side/flyt i adminpanelet i dag. Ikke nødvendigvis en feil, men en planlagt
  funksjon som aldri ble bygget ferdig.
- **`lib/models/types.ts`**: `export type UserRoleType = "Admin" | "User" | string;` — `| string` gjør at
  TypeScript kollapser hele unionen til bare `string`. Dette er trolig **rotårsaken** til at rollesjekker er
  inkonsekvente i kodebasen (se `Header.tsx`-funnet over) — typen gir null kompileringstids-beskyttelse mot å
  skrive `"admin"` der `"Admin"` forventes eller omvendt. Bør strammes inn til `"Admin" | "User"` (evt. som et
  enum, i tråd med `BlacklistType` i `lib/models/enums/`), og alle sammenligninger bør konsekvent normaliseres
  med `.toLowerCase()` (slik de fleste steder allerede gjør).
- **`lib/models/admin/users/PaginatedResponse.ts`** er en generisk wrapper (`PaginatedResponse<T>`), men
  ligger fysisk plassert som om den var admin/users-spesifikk. Med flere lister på vei (oppskrifter,
  måltidsplaner, handlelister) bør denne løftes til et delt sted — se forslag i
  [08 – Forslag til mappestruktur](./08-model-and-component-structure-proposal.md).

## Inkonsekvent passord-policy på tvers av tre skjemaer

Samme underliggende felt (`newPassword`/`password`), tre forskjellige regelsett:

| Skjema | Krav |
| --- | --- |
| `RegisterForm.tsx` | Min. 8 tegn + stor bokstav + liten bokstav + tall + spesialtegn |
| `ChangePasswordForm.tsx` | Min. 8 tegn — ingen kompleksitetskrav |
| `ResetPasswordForm.tsx` | Min. **6** tegn — ingen kompleksitetskrav |

Hvis backend faktisk håndhever registrerings-policyen serverside for alle tre endepunktene, vil brukere som
bytter/tilbakestiller passord kunne bli avvist av backend selv om frontend-valideringen sa OK — forvirrende
UX. Hvis backend *ikke* håndhever det, kan brukere sette et svakere passord via reset/change enn de kunne satt
ved registrering. Bør samles i én delt valideringsfunksjon.

## `app/(user)/user/welcome/page.tsx` — designsystem-avvik

Hele siden bruker Mantines innebygde `color="teal"` konsekvent (badges, knapper, ikoner, bakgrunner) i stedet
for appens `sage`/`terracotta`-palett fra [06 – Designsystem](./06-forms-and-design-system.md). Eneste side i
appen som gjør dette — sannsynligvis bygget før designsystemet ble formalisert, eller bygget isolert. Bør
migreres til `sage`/`terracotta` for konsistens.

## Ubrukte npm-avhengigheter

`dayjs`, `react-markdown` og `recharts` er installert i `package.json`, men importeres **ingen steder** i
kodebasen (bekreftet med grep). `@mantine/charts` har kun CSS-en importert i `app/layout.tsx`
(`@mantine/charts/styles.css`) — selve chart-komponentene brukes aldri. `@mantine/dates` brukes ett sted
(`DatePickerInput` i `mealplan/page.tsx`), men det er satt opp **uten** en `DatesProvider`/dayjs-adapter i
`app/layout.tsx`, som Mantine v9 sine datokomponenter normalt forventer.

Dette er trolig bevisst forhåndsinstallert for kommende funksjonalitet (næringsinnhold-grafer, oppskrift-
beskrivelser i Markdown, ukesplan-datovelgere) — ikke nødvendigvis "død vekt" som bør fjernes, men verdt å
vite om før dere begynner å bygge disse funksjonene, spesielt datovelger-oppsettet som trolig må konfigureres
riktig (`DatesProvider` + adapter) før `@mantine/dates` fungerer pålitelig på tvers av flere sider.

## Mindre funn

- `FormField.tsx` sin `type="email"`-variant er både (a) aldri brukt noe sted i kodebasen, og (b) ville uansett
  ikke satt `type="email"` som HTML-attributt på input-elementet selv om den ble brukt — `type`-proppen brukes
  kun til å velge `TextInput`/`PasswordInput`/`Textarea`, aldri videreført til selve inputen. Ufarlig i dag
  (faller tilbake til vanlig tekstfelt), men et no-op dersom noen forventer at den gjør noe.

---

## Andre observasjoner

- **Ingen tester.** Ingen `test`-script i `package.json`, ingen Jest/Vitest-konfigurasjon. Verken
  auth-flyten, adminpanelet eller (når den kommer) recipe-integrasjonen har automatisert testdekning.
- **README sine miljøvariabler var utdaterte.** Rettet i README + [01](./01-architecture-and-setup.md) til å
  matche faktisk `.env.local` (`AUTH_API`/`CORE_API`/`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, ikke `RECIPE_API` på
  port `xxxx`).
- **`app/admin/users/email/page.tsx`** og **`app/confirm-email/page.tsx`** har hver et sted der
  `AsyncMainContainer`s fallback (`loading`-state uten `children`) ikke tilfredsstiller TypeScript sitt krav
  om at `children` er påkrevd — gir `tsc`-feil i dag. Ikke rettet i denne runden (utenfor avtalt scope), men
  bør ryddes samtidig med paginerings-fiksen over siden begge er rene typefeil.
- **`app/(user)/user/mealplan/page.tsx`** har en type-feil på en `DatePickerInput`/state-kobling
  (`Dispatch<SetStateAction<Date>>` vs. forventet `(value: string | null) => void`) — trolig fra en
  Mantine-versjonsoppgradering. Ikke rettet i denne runden.

## Foreslått rekkefølge for videre arbeid

1. Fiks auth/sesjon-svakhetene over (miljøvariabel-mismatch er triviell; 401-håndtering krever litt design —
   se de tre alternativene i [03](./03-auth-and-session.md#5-hva-proxyts-ikke-dekker--rotårsaken-til-de-fleste-sesjonsproblemer)).
2. Få `npm run lint` grønt igjen (25 feil i dag) — trivielt for de fleste, men `react-hooks/set-state-in-effect`
   gjentar seg 5 steder og bør trolig løses med én delt hook, ikke fem enkeltrettinger.
3. Rydd modell-laget: slett/ta i bruk de foreldreløse modellene, stram inn `UserRoleType`, og bestem retning på
   den halvferdige pagineringen (fullfør eller rull tilbake — ikke la den stå i alle tre lag samtidig).
4. Rydd opp de gjenstående TypeScript-feilene (`AsyncMainContainer`-children, mealplan-datepicker).
5. Før mer av kjernedomenet bygges: legg om mappestrukturen for `lib/models/` og `components/` slik at det er
   plass til oppskrifter/måltidsplan/handleliste uten å gjenta dagens mønster med alt inline i `page.tsx` — se
   [08 – Forslag til mappestruktur](./08-model-and-component-structure-proposal.md).
6. Design datamodell + API-lag for oppskrifter/måltidsplan/handleliste, og migrer én side om gangen til ekte
   backend + riktig komponentstruktur.
7. Vurder om `app/admin/whitelist`, `categories`, `system` skal prioriteres før eller etter kjernefunksjonene.
