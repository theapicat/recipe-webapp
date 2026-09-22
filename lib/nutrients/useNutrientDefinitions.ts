"use client";

import { useEffect, useState } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { NutrientDefinition } from "@/lib/models/ingredients/NutrientDefinition";

interface State {
  definitions: NutrientDefinition[];
  loading: boolean;
  errorMessage?: string;
}

// Næringsstoffkatalogen (57 stoffer, skrivebeskyttet og uendret under kjøring) — trengs av ingrediens- og
// oppskriftsvisningene. I lib/ (ikke components/admin/) fordi begge domenene bruker den.
export const useNutrientDefinitions = (): State => {
  const [state, setState] = useState<State>({ definitions: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    agentInternal
      .get<NutrientDefinition[]>("/api/user/nutrient-definitions")
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        setState(
          res.ok
            ? { definitions: data.body ?? [], loading: false }
            : { definitions: [], loading: false, errorMessage: data.message },
        );
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            definitions: [],
            loading: false,
            errorMessage: "Kunne ikke koble til serveren.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
