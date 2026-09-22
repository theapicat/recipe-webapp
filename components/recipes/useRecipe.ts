"use client";

import { useState } from "react";
import { useEffect } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { Recipe } from "@/lib/models/recipes/Recipe";

interface State {
  id: string | null;
  recipe?: Recipe;
  errorMessage?: string;
}

// Henter én oppskrift for `id`, alltid ferskt. Samme mønster som useIngredient: `loading` er utledet av at
// state i minnet ikke gjelder den valgte id-en ennå. `setRecipe` tar imot et lagret svar (PUT/POST/favoritt)
// slik at vi slipper å hente på nytt.
export const useRecipe = (id: string | null) => {
  const [state, setState] = useState<State>({ id: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    agentInternal
      .get<Recipe>(`/api/user/recipes/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        setState(
          res.ok && data.body
            ? { id, recipe: data.body }
            : { id, errorMessage: data.message || "Kunne ikke hente oppskriften." },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ id, errorMessage: "Kunne ikke koble til serveren." });
      });

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const current = id !== null && state.id === id ? state : null;

  return {
    recipe: current?.recipe,
    errorMessage: current?.errorMessage,
    loading: id !== null && current === null,
    setRecipe: (recipe: Recipe) => setState({ id: recipe.id, recipe }),
    retry: () => {
      setState({ id: null });
      setAttempt((n) => n + 1);
    },
  };
};
