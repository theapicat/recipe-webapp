"use client";

import { useCallback, useEffect, useState } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { RecipeListItem } from "@/lib/models/recipes/RecipeListItem";

interface RecipesState {
  items: RecipeListItem[];
  loading: boolean;
  errorMessage?: string;
}

const fetchRecipes = async (): Promise<Pick<RecipesState, "items" | "errorMessage">> => {
  try {
    const res = await agentInternal.get<RecipeListItem[]>("/api/user/recipes");
    const data = await res.json();

    return res.ok
      ? { items: data.body ?? [] }
      : { items: [], errorMessage: data.message || "Kunne ikke hente oppskrifter." };
  } catch {
    return { items: [], errorMessage: "Kunne ikke koble til serveren." };
  }
};

// Laster hele oppskriftslisten én gang. Filtrering og søk skjer i klienten (samme mønster som useIngredients).
export const useRecipes = () => {
  const [state, setState] = useState<RecipesState>({ items: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    fetchRecipes().then((result) => {
      if (!cancelled) setState({ ...result, loading: false });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
    fetchRecipes().then((result) => setState({ ...result, loading: false }));
  }, []);

  return { ...state, reload };
};
