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

### Halvferdig paginering av brukerlisten

`app/api/admin/users/route.ts` bygger `AdminUserQueryParams` og forventer `PaginatedResponse<AdminUserListItem>`
tilbake, men `agentAuthAdmin.getUsers()` tar per nå ingen argumenter og returnerer en flat
`AdminUserListItem[]`. Dette gir reelle TypeScript-feil (`npx tsc --noEmit`):

```
app/api/admin/users/route.ts(27,48): error TS2554: Expected 0 arguments, but got 1.
app/api/admin/users/route.ts(32,7): error TS2739: Type 'AdminUserListItem[]' is missing ... totalItems, page, pageSize, totalPages, items
```

→ [05 – Adminpanelet](./05-admin-panel.md#kjent-halvferdig-migrering-paginering).

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
2. Rydd opp de gjenstående TypeScript-feilene (paginering, `AsyncMainContainer`-children, mealplan-datepicker).
3. Design datamodell + API-lag for oppskrifter/måltidsplan/handleliste, og migrer én side om gangen til ekte
   backend + riktig komponentstruktur.
4. Vurder om `app/admin/whitelist`, `categories`, `system` skal prioriteres før eller etter kjernefunksjonene.
