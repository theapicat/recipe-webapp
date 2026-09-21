import { normalizeName } from "@/lib/text/names";

// Backend sjekker kun tomt navn (400) og duplikat/fremmednøkkel (409) — se documentation/04. Alt annet må
// frontend selv fange, så brukeren får en presis feilmelding før noe sendes.

interface Named {
  id: string;
  name: string;
}

interface Abbreviated extends Named {
  abbreviation: string;
}

export const validateName = (value: string, existing: Named[], ownId?: string): string | null => {
  const normalized = normalizeName(value);

  if (!normalized) return "Navn må fylles ut";

  if (existing.some((e) => e.id !== ownId && normalizeName(e.name) === normalized)) {
    return "Det finnes allerede en oppføring med dette navnet";
  }

  return null;
};

// Forkortelsen er et symbol som beholder store/små bokstaver, men er unik uavhengig av dem (l og L er samme symbol).
export const validateAbbreviation = (
  value: string,
  existing: Abbreviated[],
  ownId?: string,
): string | null => {
  const abbreviation = value.trim();

  if (!abbreviation) return "Forkortelse må fylles ut";

  if (
    existing.some(
      (e) => e.id !== ownId && e.abbreviation.toLowerCase() === abbreviation.toLowerCase(),
    )
  ) {
    return "Det finnes allerede en enhet med denne forkortelsen";
  }

  return null;
};
