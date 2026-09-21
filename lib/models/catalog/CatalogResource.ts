// De adminstyrte katalogene i recipe-core-api. Navnene er sti-segmentene i Gatewayen (/admin/<resource>) og er samtidig
// hvitlisten for den dynamiske ruten app/api/admin/[resource]: alt som ikke står her gir 404. Legger backend til en
// ny katalog med samme kontrakt (GET/POST/PUT/DELETE på /admin/<resource>), er dette eneste stedet den må registreres
// på serversiden — resten av UI-konfigurasjonen ligger i components/admin/catalog/catalogConfig.ts.
export const CATALOG_RESOURCES = [
  "recipe-categories",
  "ingredient-categories",
  "allergens",
  "search-keywords",
  "unit-types",
  "units",
] as const;

export type CatalogResource = (typeof CATALOG_RESOURCES)[number];

// Kataloger som kun leses (aldri endres via frontend): enhetstypene er uforanderlige — næringsberegningen i backend finner
// vekt og volum via navnet på enhetstypen («vekt», «volum»), så å endre dem gir feil omregning. De vises ikke som egen
// fane i katalogsiden, men brukes som data (enhetskolonnen og enhetsfilteret). Skriving mot dem avvises med 405 i
// ruten. Fjern «unit-types» herfra for å åpne for redigering.
export const READ_ONLY_CATALOG_RESOURCES = ["unit-types"] as const;

export type ReadOnlyCatalogResource = (typeof READ_ONLY_CATALOG_RESOURCES)[number];

// Katalogene admin kan endre — akkurat de som får en fane i katalogsiden (se components/admin/catalog/catalogConfig.ts).
export type WritableCatalogResource = Exclude<CatalogResource, ReadOnlyCatalogResource>;

export const isCatalogResource = (value: string): value is CatalogResource =>
  (CATALOG_RESOURCES as readonly string[]).includes(value);

export const isReadOnlyCatalogResource = (
  resource: CatalogResource,
): resource is ReadOnlyCatalogResource =>
  (READ_ONLY_CATALOG_RESOURCES as readonly CatalogResource[]).includes(resource);
