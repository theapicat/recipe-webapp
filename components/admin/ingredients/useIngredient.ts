"use client";

import { useEffect, useState } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";

interface State {
  /** Hvilken id `ingredient`/`errorMessage` gjelder — så vi kan se at et svar er for en annen ingrediens enn den som er valgt. */
  id: string | null;
  ingredient?: Ingredient;
  errorMessage?: string;
}

// Henter hele ingrediensen (næringsverdier og porsjoner) for `id`; alltid ferskt fra databasen. `loading` er utledet:
// vi laster så lenge svaret i state ikke gjelder den valgte id-en. `setIngredient` tar imot en lagret ingrediens
// (PUT/POST svarer med hele ingrediensen), så vi slipper å hente den på nytt.
export const useIngredient = (id: string | null) => {
  const [state, setState] = useState<State>({ id: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    agentInternal
      .get<Ingredient>(`/api/admin/ingredients/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        setState(
          res.ok && data.body
            ? { id, ingredient: data.body }
            : { id, errorMessage: data.message || "Kunne ikke hente ingrediensen." },
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
    ingredient: current?.ingredient,
    errorMessage: current?.errorMessage,
    loading: id !== null && current === null,
    setIngredient: (ingredient: Ingredient) => setState({ id: ingredient.id, ingredient }),
    retry: () => {
      setState({ id: null });
      setAttempt((n) => n + 1);
    },
  };
};
