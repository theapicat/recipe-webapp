# 09 – Oppskriftsdomenet: Modell & Planlagte Sider

**Status: modellene i seksjon 1 er skrevet og justert mot `recipe-core-api` (2026-09-21). Sidene i seksjon 2 er
ikke bygget ennå — dette er en plan, ikke en beskrivelse av eksisterende kode.**

## 1. Datamodellene

`lib/models/recipes/`, `lib/models/ingredients/` og `lib/models/units/` inneholder DTO-ene for
oppskrifts-domenet, og speiler ledningsformatet til `recipe-core-api` 1:1 (`| null` for ukjente felt, enums som
strenger med stor forbokstav, egne request-modeller uten id-er — se
[04, seksjon 5](./04-api-integration-and-data-models.md#5-modellene-mot-recipe-core-api)).

Kort oppsummert: `Recipe` er strengt bruker-eid (`ownerUserId`), skiller manuelle fra skrapede oppskrifter via
`RecipeSource`, og henter ingredienser fra en delt `Ingredient`-katalog (med en `UnconfirmedIngredient`-vei for
brukerinnsendte ingredienser som ikke finnes der, med en review-livssyklus: `NotRequested` → `Pending` →
`Approved`/`Merged`/`Rejected`). Næring er modellert som en egen `NutrientDefinition`-katalog (skrivebeskyttet,
nøstet i grupper) + sparsomme `IngredientNutrientValue`-rader (ikke et fast sett faste felt), fordi kildedataen fra
Matvaretabellen er hierarkisk og de fleste matvarer bare har verdi for et delsett av næringsstoffene. Næring for en
oppskrift beregnes på forespørsel (`RecipeNutrition`) og lagres aldri.

Følger mønsteret fra [08 – Forslag: mappestruktur](./08-model-and-component-structure-proposal.md): én fil per
DTO, gruppert på domene, `page.tsx` tynn + feature-komponenter når sidene faktisk bygges.

## 2. Planlagte sider (ikke bygget)

**Eksisterende oppskriftssider forblir som de er for nå** — `app/(user)/user/recipes/*` fortsetter å bruke
mock-data til de faktisk kobles mot ekte backend (se [07 – Kjente problemer](./07-known-issues-and-tech-debt.md)
for status). Ingen endring i dem som følge av modellarbeidet i seksjon 1.

Nye sider som er planlagt basert på modelldesign-samtalen:

- **`app/(user)/user/ingredients/` (ny)** — søkbar oppslagsside der brukeren kan finne en ingrediens og se
  næringsinnhold, porsjonsstørrelser og en lenke til den offisielle Matvaretabellen-siden (`Ingredient.sourceUrl`).
  Tenkt som frittstående oppslag, ikke bundet til en oppskrift — "hva får jeg av å ete to gulrøtter"-type bruk.
- **Katalog-admin — gjort (`/admin/catalog`, se [05](./05-admin-panel.md)).** Dekker `IngredientCategory`,
  `RecipeCategory`, `Allergen`, `UnitType` (skrivebeskyttet), `Unit` og `SearchKeyword`. `NutrientDefinition`-katalogen er
  skrivebeskyttet i backend og får ingen admin-flate.
- **Ingrediens-admin** — en egen side (`/admin/ingredients`). **Full CRUD er bygget** (liste, utvidet visning, redigering med
  allergener, verifisering, oppretting og sletting i en skuff, se [05](./05-admin-panel.md), seksjon 4). Gjenstår:
  admin-køen for `UnconfirmedIngredient` — godkjenn som ny ingrediens (evt. avledet fra en eksisterende) eller slå sammen med en
  eksisterende (erstatter den i brukernes oppskrifter) — og avvis. Køen gjenbruker editoren.

Den første av punktene over er bygget; resten er ikke startet — dette er en oversikt for å ikke miste kontekst mellom
sesjoner.
