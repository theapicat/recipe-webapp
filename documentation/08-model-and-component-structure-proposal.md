# 08 – Forslag: Mappestruktur for Modeller & Komponenter

**Status: forslag til diskusjon, ikke gjennomført.** Dette dokumentet beskriver hvordan `lib/models/` og
`components/` bør utvides *før* oppskrifter, måltidsplan, handleliste og de resterende admin-sidene
(kategorier, whitelist, system) migreres fra mock-data til ekte backend-integrasjon. Målet er å unngå å
gjenta mønsteret som allerede finnes for disse sidene i dag: ~4300 linjer fordelt på 8 sider, alt inline i
`page.tsx`, ingen delte modeller, ingen delte komponenter (se
[07 – Kjente problemer](./07-known-issues-and-tech-debt.md#store-monolittiske-sider-uten-backend)).

Auth- og admin/users-delen av kodebasen viser at mønsteret (page → container → form/feature-komponent →
felt, én modellfil per DTO gruppert på domene) fungerer godt i praksis. Forslaget under er å bruke nøyaktig
det samme mønsteret for de nye domenene, ikke noe nytt.

## 1. `lib/models/` — dagens struktur

```
lib/models/
├── auth/                       # 12 filer — login, registrering, passord, profil
├── admin/users/                # 14 filer — inkl. PaginatedResponse.ts (se pkt. 2)
├── enums/                      # BlacklistType
├── public/                     # ContactRequest
├── user/                       # user.ts — ubrukt alias, se 07
├── httpResponse.ts             # delt, ligger i rot
└── types.ts                    # UserRoleType, ligger i rot
```

## 2. To små, presise opprydninger før noe nytt legges til

Disse er billige (få importsteder) og bør gjøres *før* nye domener legger seg oppå samme mønster, ellers
arves skjevheten videre:

1. **Flytt `lib/models/admin/users/PaginatedResponse.ts` → `lib/models/paginatedResponse.ts`.** Den er en
   generisk wrapper (`PaginatedResponse<T>`), ikke admin/users-spesifikk — akkurat som `HttpResponse<T>`
   allerede ligger i rot av `lib/models/`, ikke i en domenemappe. Med oppskrift-/måltidsplan-lister på vei
   trenger flere domener denne samtidig. 3 importsteder å oppdatere i dag
   (`app/api/admin/users/route.ts`, og der `agentAuthAdmin.getUsers` til slutt kobles riktig — se
   [07](./07-known-issues-and-tech-debt.md#halvferdig-paginering-av-brukerlisten--brutt-i-alle-tre-lag)).
2. **Stram inn `UserRoleType`** fra `"Admin" | "User" | string` til `"Admin" | "User"` i `lib/models/types.ts`.
   `| string` nuller ut hele poenget med unionen og er trolig rotårsaken til at `Header.tsx` sammenligner rollen
   annerledes enn resten av appen. Når typen er strammet inn vil TypeScript selv fange fremtidige
   feilskrivinger.

Og to trivielle sletting-kandidater (ingen bruk noe sted, bekreftet med grep):
`lib/models/auth/openIddictResponse.ts`, `lib/models/auth/deleteProfileRequest.ts`, `lib/models/user/user.ts`.

## 3. Ny struktur — legg til domenemapper etter behov, ikke på forskudd

**Anbefaling: ikke opprett tomme mapper nå.** Opprett `lib/models/<domene>/` idet dere faktisk begynner å
bygge backend-integrasjonen for det domenet — akkurat som `admin/users/` ble til da adminpanelet for brukere
ble bygget. Konvensjonen å følge når det skjer:

```
lib/models/
├── recipes/
│   ├── Recipe.ts                    # kjerne-DTO (matcher GET /recipes/{id})
│   ├── RecipeListItem.ts            # slankere variant til listevisning (jf. AdminUserListItem vs. AdminUserDetails)
│   ├── RecipeIngredient.ts
│   ├── RecipeStep.ts
│   ├── CreateRecipeRequest.ts
│   └── UpdateRecipeRequest.ts
├── mealplan/
│   ├── MealPlanEntry.ts
│   ├── MealPlanWeek.ts
│   └── AddMealPlanEntryRequest.ts
├── shoppinglist/
│   ├── ShoppingListItem.ts
│   └── GenerateShoppingListRequest.ts
└── admin/
    ├── categories/                  # når /admin/categories går fra mock til ekte
    └── whitelist/                   # når /admin/whitelist går fra mock til ekte
```

Én fil per DTO, filnavn == interface-navn (se den ombyttede `BlacklistedEntry`/`DeleteAndBlacklistUserAdminRequest`-
saken i [07](./07-known-issues-and-tech-debt.md) for hvorfor dette håndheves strengt).

## 4. `components/` — dagens struktur

```
components/
├── admin/
│   └── users/
│       ├── detail/
│       └── email/
├── containers/                       # MainContainer/AsyncMainContainer
├── forms/
│   ├── auth/
│   ├── common/                       # FormContext, FormField, CreateFormContainer, EditFormContainer
│   └── ContactForm.tsx               # ← løs fil direkte i forms/, ikke i en undermappe
└── layout/
    └── header/
```

**Liten inkonsistens å rydde nå:** `ContactForm.tsx` ligger direkte i `components/forms/`, mens alt annet er
gruppert i en domeneundermappe (`auth/`). Flytt til `components/forms/public/ContactForm.tsx` for å speile
`lib/models/public/` — étt importsted å oppdatere (`app/(info)/contact/page.tsx`).

## 5. Ny struktur for kommende domener

Samme prinsipp som modellene: opprett når domenet faktisk bygges, ikke før.

```
components/
├── recipes/
│   ├── RecipeCard.tsx                # gjenbrukes i liste, dashboard-widgets, søk
│   ├── RecipeFilterBar.tsx
│   ├── RecipeForm.tsx                # erstatter inline-skjemaet i recipes/create og recipes/[id]/edit
│   ├── IngredientListEditor.tsx
│   └── StepListEditor.tsx
├── mealplan/
│   ├── WeekGrid.tsx
│   ├── MealSlotCard.tsx
│   └── MealPlanForm.tsx
├── shoppinglist/
│   ├── ShoppingListItemRow.tsx
│   └── ShoppingListGenerator.tsx
└── admin/
    ├── categories/
    └── whitelist/
```

Når disse bygges, gjelder samme lagdeling som i [06 – Skjemaer & designsystem](./06-forms-and-design-system.md):
`page.tsx` blir tynn, feature-komponenten eier state og kaller `agentInternal`, og
`CreateFormContainer`/`EditFormContainer`/`FormField` gjenbrukes i stedet for at hver side bygger sin egen
`<Paper><form>`-oppsett fra bunnen (slik `recipes/create/page.tsx`, `recipes/[id]/edit/page.tsx` osv. gjør i
dag).

## 6. Konkret migreringsrekkefølge når dere er klare

Anbefalt rekkefølge — start med oppskrifter siden måltidsplan og handleliste begge refererer til dem:

1. `lib/models/recipes/*` + `agentRecipes.ts` (samme mønster som `agentAuth.ts`) + `app/api/recipes/**`
   route handlers.
2. Bryt `app/(user)/user/recipes/page.tsx` (541 linjer) opp i `page.tsx` (tynn) +
   `components/recipes/RecipeCard.tsx` + `RecipeFilterBar.tsx`, koblet til ekte data.
3. Gjenta for `recipes/create` og `recipes/[id]/edit` med en delt `RecipeForm.tsx` (de to sidene gjør i dag
   nesten identisk skjemaarbeid inline, hver for seg).
4. `recipes/[id]/page.tsx` og `recipes/[id]/cook/page.tsx` — detaljvisning og "kokemodus", begge leser samme
   `Recipe`-modell.
5. Deretter måltidsplan (`lib/models/mealplan/*`, `agentMealplan.ts`) — den refererer allerede til
   oppskrifter (`MOCK_USER_RECIPES` peker på recipe-data), så den bør komme etter punkt 1–4.
6. Til slutt handleliste, som typisk genereres *fra* måltidsplanen.

Adminsidene (`whitelist`, `categories`, `system`) kan tas uavhengig av dette løpet — de har ingen avhengighet
til oppskrifts-domenet.
