"use client";

import { useCallback, useRef, useState } from "react";
import { agentInternal } from "@/lib/agent/agentInternal";
import { Ingredient } from "@/lib/models/ingredients/Ingredient";

// Henter og cacher hele ingrediensen (inkl. `portions`) per id, på forespørsel — ikke for hele lista (den er lett
// med vilje). Delt mellom radene i IngredientListEditor slik at samme ingrediens ikke hentes på nytt om den
// brukes i flere linjer. `ensure(id)` er trygg å kalle på hver rendring: den gjør ingenting om id-en allerede er
// hentet eller er under henting.
export const useIngredientDetailCache = () => {
  const [details, setDetails] = useState<Record<string, Ingredient>>({});
  const pending = useRef<Set<string>>(new Set());

  const ensure = useCallback(
    (id: string) => {
      if (details[id] || pending.current.has(id)) return;
      pending.current.add(id);

      agentInternal
        .get<Ingredient>(`/api/user/ingredients/${encodeURIComponent(id)}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.body) {
            setDetails((prev) => ({ ...prev, [id]: data.body! }));
          }
        })
        .finally(() => {
          pending.current.delete(id);
        });
    },
    [details],
  );

  return { details, ensure };
};
