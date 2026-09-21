"use client";

import { useCallback, useEffect, useState } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { IngredientListItem } from "@/lib/models/ingredients/IngredientListItem";

interface IngredientsState {
  items: IngredientListItem[];
  loading: boolean;
  errorMessage?: string;
}

const fetchIngredients = async (): Promise<Pick<IngredientsState, "items" | "errorMessage">> => {
  try {
    const res = await agentInternal.get<IngredientListItem[]>("/api/admin/ingredients");
    const data = await res.json();

    return res.ok
      ? { items: data.body ?? [] }
      : { items: [], errorMessage: data.message || "Kunne ikke hente ingredienser." };
  } catch {
    return { items: [], errorMessage: "Kunne ikke koble til serveren." };
  }
};

// Laster hele ingredienslisten én gang (ingen klient-cache; backend cacher listen). Filtrering og søk skjer i klienten.
export const useIngredients = () => {
  const [state, setState] = useState<IngredientsState>({ items: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    fetchIngredients().then((result) => {
      if (!cancelled) setState({ ...result, loading: false });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
    fetchIngredients().then((result) => setState({ ...result, loading: false }));
  }, []);

  return { ...state, reload };
};
