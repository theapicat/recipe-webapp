"use client";

import { useCallback, useEffect, useState } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { CatalogItem, CatalogModelMap } from "@/lib/models/catalog/CatalogModelMap";
import { CATALOG_RESOURCES, CatalogResource } from "@/lib/models/catalog/CatalogResource";

export interface CatalogState<T = CatalogItem> {
  items: T[];
  loading: boolean;
  errorMessage?: string;
}

export type CatalogStates = { [R in CatalogResource]: CatalogState<CatalogModelMap[R]> };

interface FetchResult {
  items?: CatalogItem[];
  errorMessage?: string;
}

const fetchCatalog = async (resource: CatalogResource): Promise<FetchResult> => {
  try {
    const res = await agentInternal.get<CatalogItem[]>(`/api/admin/${resource}`);
    const data = await res.json();

    return res.ok
      ? { items: data.body ?? [] }
      : { errorMessage: data.message || "Kunne ikke hente katalogen." };
  } catch {
    return { errorMessage: "Kunne ikke koble til serveren." };
  }
};

// Ved feil beholdes forrige liste (om noen), slik at en mislykket henting etter en lagring ikke tømmer skjermen.
const applyResult = (
  states: CatalogStates,
  resource: CatalogResource,
  result: FetchResult,
): CatalogStates =>
  ({
    ...states,
    [resource]: {
      items: result.items ?? states[resource].items,
      loading: false,
      errorMessage: result.errorMessage,
    },
  }) as CatalogStates;

// Eksplisitt (ikke bygget av CATALOG_RESOURCES) slik at TypeScript feiler om en ny katalog legges til uten å bli tatt med her.
const initialStates: CatalogStates = {
  "recipe-categories": { items: [], loading: true },
  "ingredient-categories": { items: [], loading: true },
  allergens: { items: [], loading: true },
  "search-keywords": { items: [], loading: true },
  "unit-types": { items: [], loading: true },
  units: { items: [], loading: true },
};

// Laster alle seks katalogene parallelt ved oppstart (små lister, cachet i backend) — det gir antall i fanene og
// enhetstypene enhetsskjemaet trenger uten ekstra kall. Ingen klient-cache: etter hver endring leses den aktuelle
// katalogen på nytt via `reload`, siden backend svarer 200/204 uten body på PUT/DELETE.
export const useCatalogs = () => {
  const [states, setStates] = useState<CatalogStates>(initialStates);

  useEffect(() => {
    let cancelled = false;

    CATALOG_RESOURCES.forEach((resource) => {
      fetchCatalog(resource).then((result) => {
        if (!cancelled) setStates((prev) => applyResult(prev, resource, result));
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback((resource: CatalogResource) => {
    setStates((prev) => ({ ...prev, [resource]: { ...prev[resource], loading: true } }));
    fetchCatalog(resource).then((result) =>
      setStates((prev) => applyResult(prev, resource, result)),
    );
  }, []);

  return { catalogs: states, reload };
};
