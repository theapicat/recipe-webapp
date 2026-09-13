# 04 – API-integrasjon & Datamodeller

## 1. Lagene, i rekkefølge

```
Klientkomponent ("use client")
   │  agentInternal.get/post/put/delete("/api/...", body)
   ▼
Route handler  app/api/**/route.ts        (server, kjører i Next.js)
   │  agentAuth.* / agentAuthAdmin.*
   ▼
agentExternal.get/post/put/delete(...)    (legger på Authorization: Bearer <token>)
   ▼
Recipe Gateway API (YARP, port 5000)      → validerer JWT, injiserer X-User-Id
   ▼
recipe-authentication-api (5001)  /  recipe-core-api (5002)
```

Route handlers er en **tynn oversettelsesjobb**, ikke forretningslogikk: de tar imot JSON fra klienten,
kaller riktig `agentAuth`/`agentAuthAdmin`-metode, og pakker resultatet i en konsistent konvolutt (se punkt 3).

## 2. `lib/agent/` — de fire filene

| Fil | Ansvar |
| --- | --- |
| `agentInternal.ts` | `"use client"`. Same-origin `fetch` mot denne appens egne `/api/*`-ruter. Ingen auth-header — cookien følger automatisk. |
| `agentExternal.ts` | Server-only. `fetch` med `mode: "cors"` mot Gatewayen. Henter token via `sessionManager.getToken()` og setter `Authorization: Bearer`. Har også `postForm()` for `x-www-form-urlencoded` (OAuth2 token-endepunktet krever dette formatet). |
| `agentAuth.ts` | Typet wrapper for alle `/account/*`- og `/connect/token`-kall (login, refresh, register, profil, passord, e-postbekreftelse). Kaster `Error` med norsk melding fra `errorData.message`/`error_description` ved `!response.ok`. |
| `agentAuthAdmin.ts` | Samme mønster for `/admin/*`-kall (brukerliste, lås/lås opp, svarteliste, send e-post). |

**Regel:** ny funksjonalitet mot backend skal legges til som en ny metode i `agentAuth`/`agentAuthAdmin`, ikke
som et rått `fetch`-kall inne i en komponent eller route handler. `app/api/public/contact/route.ts` er unntaket
— den kaller `agentExternal` direkte siden den ikke er en del av auth/admin-domenet.

## 3. Responskonvolutt: `HttpResponse<T>`

De fleste (men ikke alle — se `/api/health`) route handlers returnerer:

```ts
interface HttpResponse<T> {
  statusCode: number;
  message: string;
  body?: T;
  timestamp: string; // ISO-streng
}
```

Klientkomponenter kaster om responsen til `HttpResponse<X>` og sjekker `res.ok && data.body` for
suksess. `statusCode`-feltet i body er informativt — det faktiske HTTP-statuskoden på responsen er
autoritativ.

## 4. `lib/models/` — konvensjon

Én fil per DTO/interface, gruppert etter domene:

```
lib/models/
├── auth/                     # login, registrering, passord, profil (bruker-domenet)
├── admin/users/              # admin-spesifikke request/response-typer
├── enums/                    # f.eks. BlacklistType
├── public/                   # kontaktskjema o.l.
├── user/                     # (se advarsel under)
├── httpResponse.ts
└── types.ts
```

**Advarsel — filnavn må matche interface-navnet.** `lib/models/admin/users/BlacklistedEntry.ts` og
`DeleteAndBlacklistUserAdminRequest.ts` hadde til nylig byttet om innhold (filen med det ene navnet inneholdt
det andre interfacet). Dette er nå rettet — men understreker regelen: når du lager en ny modellfil, dobbeltsjekk
at filnavn og `export interface`-navn er identiske, ellers blir det umulig å navigere kodebasen etter navn.

## 5. Datamodeller som *ikke* finnes ennå

Det finnes ingen `lib/models`-filer for oppskrifter, måltidsplaner eller handlelister. Dette er ikke en
forglemmelse i dokumentasjonen — de sidene har heller ingen ekte API-integrasjon ennå. Se
[07 – Kjente problemer](./07-known-issues-and-tech-debt.md#store-monolittiske-sider-uten-backend) for detaljer
og hva som må på plass før disse kan kobles til `recipe-core-api`.

## 6. Feilhåndteringsmønster (gjelder alle route handlers)

```ts
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const result = await agentAuth.someMethod(body);
    return NextResponse.json({ statusCode: 200, message: "...", body: result, timestamp: ... }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Fallback-melding på norsk.";
    return NextResponse.json({ statusCode: 400, message: errorMessage, timestamp: ... }, { status: 400 });
  }
};
```

Alle feil fra Gatewayen (400, 401, 403, 404, 500 ...) blir i praksis flatet til **400** av denne
try/catch-blokken, siden det er `agentAuth`/`agentAuthAdmin` som kaster en generisk `Error`, ikke noe som
bærer med seg den opprinnelige statuskoden. Dette er bevisst enkelt, men betyr at klienten ikke kan skille
"ugyldig input" fra "ikke autentisert" fra "server nede" uten å tolke feilteksten. Relevant for
[03 – Auth & sesjon](./03-auth-and-session.md#5-hva-proxyts-ikke-dekker--rotårsaken-til-de-fleste-sesjonsproblemer)
— en utløpt token gir samme 400-respons som en valideringsfeil.
