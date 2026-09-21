# Kjøkkenhylla

**Kjøkkenhylla** er en webapplikasjon utviklet for privat organisering av oppskrifter, ukentlig måltidsplanlegging, generering av handlelister og oversikt over næringsinnhold.

---

## Funksjonalitet

- **Oppskriftshåndtering:** Lagre egne oppskrifter manuelt eller importer direkte fra et utvalg godkjente nettsteder.
- **Måltidsplanlegging:** Planlegg måltider på dags- og ukesbasis.
- **Handleliste:** Generer strukturerte handlelister basert på lagrede måltidsplaner.
- **Næringsinnhold & Veiledning:** Få oversikt over energi, makronæringsstoffer (proteiner, fett, karbohydrater, fiber), sukker og vitaminer – både per ingrediens, per måltid og akkummulert på ukesbasis.

> **Merk:** Næringsberegningene er kun veiledende og utgjør ikke medisinsk eller helsefaglig rådgivning. Se brukervilkår for mer detaljer.

- **Brukeradministrasjon:** Opprettelse, oppdatering og sletting av brukerkonto samt personlige innstillinger.

---

## Arkitektur & Økosystem

Applikasjonen er den primære brukerflaten i et økosystem bestående av tre samarbeidende tjenester:

1. **`recipe-webapp` (Denne appen):** Frontend og server-side proxy bygget i Next.js.
2. **Eksternt API:** Sentralt API for autentisering, lagring og håndtering av bruker- og oppskriftsdata.
3. **Skrapetjeneste:** Egen mikrotjeneste som håndterer import og uthenting av oppskrifter fra godkjente eksterne nettsteder via API.

Internt benytter frontend-applikasjonen nøyaktig to HTTP-agenter: `agentInternal` (klientkomponenter → appens egne API-ruter) og `agentExternal` (server → Gatewayen, med token fra sesjonscookien). API-rutene er tynne og bygges alle med samme mal (`apiRoute` + `agentExternal`) — se [API-integrasjon](./documentation/04-api-integration-and-data-models.md).

---

## Teknologistakk

| Kategori              | Teknologi                                                                        |
| --------------------- | -------------------------------------------------------------------------------- |
| **Rammeverk & Språk** | Next.js 16 (App Router), React 19, TypeScript                                    |
| **UI & Styling**      | Mantine v9 (`@mantine/core`, `@mantine/form`, `@mantine/notifications`), PostCSS |
| **Datavisualisering** | Mantine Charts, Recharts                                                         |
| **Ikoner & Verktøy**  | Tabler Icons, Dayjs, React Markdown                                              |

---

## Miljøvariabler (`.env.local`)

Konfigurer følgende variabler i din `.env.local`-fil i rotmappen:

```env
# Base-URL for Recipe Gateway API. Auth-endepunkter nås som {GATEWAY_URL}/auth/*,
# kjerne-endepunkter (oppskrifter, måltidsplan m.m.) direkte som {GATEWAY_URL}/*
GATEWAY_URL=http://localhost:5000/api

# Google OAuth client-id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## Komme i gang

### Forutsetninger

- Node.js (versjon 20 eller nyere anbefales)
- `npm`

### Installasjon

1. **Klon repositoriet og installer avhengigheter:**

```bash
npm install

```

2. **Start utviklingsserveren:**

```bash
npm run dev

```

3. Åpne `http://localhost:3000` i nettleseren.

---

## Teknisk dokumentasjon

Utdypende, oppdatert teknisk dokumentasjon ligger i [`documentation/`](./documentation):

1. [Arkitektur & oppsett](./documentation/01-architecture-and-setup.md)
2. [Ruting & sider](./documentation/02-routing-and-pages.md)
3. [Auth & sesjon](./documentation/03-auth-and-session.md)
4. [API-integrasjon & datamodeller](./documentation/04-api-integration-and-data-models.md)
5. [Adminpanelet](./documentation/05-admin-panel.md)
6. [Skjemaer & designsystem](./documentation/06-forms-and-design-system.md)
7. [Kjente problemer & teknisk gjeld](./documentation/07-known-issues-and-tech-debt.md)
8. [Forslag: mappestruktur for modeller & komponenter](./documentation/08-model-and-component-structure-proposal.md)
9. [Oppskriftsdomenet: Modell & planlagte sider](./documentation/09-recipe-domain-and-planned-pages.md)
10. [Backlog & utsatte avklaringer](./documentation/10-backlog.md)

---

## Containerisering (Docker)

Prosjektet er klargjort for containerisering. Dockerfile og `docker-compose.yml` vil bli lagt til for å forenkle lokal kjøring sammen med de øvrige mikrotjenestene i økosystemet.

---

## Juridisk & Dokumentasjon

Offentlig informasjon og vilkår ligger tilgjengelig under `public/docs/legal/`:

- `accessibility.md` – Tilgjengelighetserklæring
- `cookies.md` – Informasjon om informasjonskapsler
- `privacy.md` – Personvernerklæring
- `terms.md` – Brukervilkår

Ytterligere informasjonsdokumenter blir tilgjengelig under `public/docs/info/`.
