"use client";

import { useEffect, useState } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { RecipeNutrition } from "@/lib/models/recipes/RecipeNutrition";

interface State {
  id: string | null;
  nutrition?: RecipeNutrition;
  errorMessage?: string;
}

// Henter næringsberegningen for `id` — kun når `enabled` er sann, slik at den ikke beregnes (potensielt tungt på
// serveren) før brukeren faktisk åpner næringsfanen. Samme "id følger med i state"-mønster som useRecipe.
export const useRecipeNutrition = (id: string | null, enabled: boolean) => {
  const [state, setState] = useState<State>({ id: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id || !enabled) return;
    let cancelled = false;

    agentInternal
      .get<RecipeNutrition>(`/api/user/recipes/${encodeURIComponent(id)}/nutrition`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        setState(
          res.ok && data.body
            ? { id, nutrition: data.body }
            : { id, errorMessage: data.message || "Kunne ikke beregne næringsinnhold." },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ id, errorMessage: "Kunne ikke koble til serveren." });
      });

    return () => {
      cancelled = true;
    };
  }, [id, enabled, attempt]);

  const current = id !== null && state.id === id ? state : null;

  return {
    nutrition: current?.nutrition,
    errorMessage: current?.errorMessage,
    loading: enabled && id !== null && current === null,
    retry: () => {
      setState({ id: null });
      setAttempt((n) => n + 1);
    },
  };
};
