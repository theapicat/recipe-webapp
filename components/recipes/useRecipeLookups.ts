"use client";

import { useEffect, useState } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { IngredientListItem } from "@/lib/models/ingredients/IngredientListItem";
import { RecipeCategory } from "@/lib/models/recipes/RecipeCategory";
import { Unit } from "@/lib/models/units/Unit";
import { UnitType } from "@/lib/models/units/UnitType";
import { RecipeLookups } from "@/components/recipes/recipeLookups";

interface State {
  lookups: RecipeLookups;
  loading: boolean;
  /** Slått sammen av de(t) kallet/kallene som feilet — de andre lastes inn uansett (se kommentaren nederst). */
  errorMessage?: string;
}

const EMPTY: RecipeLookups = { categories: [], units: [], unitTypes: [], ingredients: [] };

const fetchOne = async <T>(url: string, label: string): Promise<{ items: T[]; error?: string }> => {
  try {
    const res = await agentInternal.get<T[]>(url);
    const data = await res.json();
    return res.ok
      ? { items: data.body ?? [] }
      : { items: [], error: data.message || `Kunne ikke hente ${label}.` };
  } catch {
    return { items: [], error: `Kunne ikke koble til serveren (${label}).` };
  }
};

// Laster de fire katalogene oppskriftssidene trenger, én gang, i parallell (ingen klient-cache; backend cacher
// katalogene). Delt mellom listen, skjemaet og detaljvisningen. Enhetstyper trengs til enhetsinnsnevringen per
// ingredienslinje (se recipeLookups.ts, unitsForIngredient()) — for å skille vekt/volum (kontinuerlige, hele
// typen låses opp) fra antall (diskret, kun de definerte porsjonene).
//
// Kallene er UAVHENGIGE: om ett feiler, blir bare den ene tom — de andre fylles fortsatt ut. Tidligere versjon
// krevde at alle lyktes, så én feilende sti gjorde ALLE nedtrekkslistene tomme uten noen synlig feilmelding, som
// så ut som «ingenting virker» selv om bare én sti var gal.
export const useRecipeLookups = () => {
  const [state, setState] = useState<State>({ lookups: EMPTY, loading: true });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [categories, units, unitTypes, ingredients] = await Promise.all([
        fetchOne<RecipeCategory>("/api/user/recipe-categories", "oppskriftskategorier"),
        fetchOne<Unit>("/api/user/units", "enheter"),
        fetchOne<UnitType>("/api/user/unit-types", "enhetstyper"),
        fetchOne<IngredientListItem>("/api/user/ingredients", "ingredienser"),
      ]);

      if (cancelled) return;

      const errors = [categories.error, units.error, unitTypes.error, ingredients.error].filter(
        Boolean,
      );

      setState({
        lookups: {
          categories: categories.items,
          units: units.items,
          unitTypes: unitTypes.items,
          ingredients: ingredients.items,
        },
        loading: false,
        errorMessage: errors.length > 0 ? errors.join(" ") : undefined,
      });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
