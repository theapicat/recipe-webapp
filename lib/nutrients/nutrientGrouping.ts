import { NutrientDefinition } from "@/lib/models/ingredients/NutrientDefinition";
import { NutrientGroup } from "@/lib/models/ingredients/NutrientGroup";

// Næringsstoffkatalogen kommer flat og ferdig sortert (dybde-først), men hvert stoff bærer sin gruppe — og undergrupper
// (f.eks. «mettede fettsyrer» under «fett») har `parentGroup`. Her bygges hovedgrupper med undergrupper i rekkefølge.
// I lib/ (ikke components/admin/) fordi både ingrediens- og oppskriftsvisningene bruker den.
export interface NutrientSection {
  /** null = stoffene som hører direkte til hovedgruppen. */
  subgroup: NutrientGroup | null;
  definitions: NutrientDefinition[];
}

export interface NutrientGroupBlock {
  id: string;
  name: string;
  sections: NutrientSection[];
}

export const groupNutrients = (definitions: NutrientDefinition[]): NutrientGroupBlock[] => {
  const blocks: NutrientGroupBlock[] = [];

  for (const definition of definitions) {
    const main = definition.group.parentGroup ?? definition.group;
    const subgroup = definition.group.parentGroup ? definition.group : null;

    let block = blocks.find((b) => b.id === main.id);
    if (!block) {
      block = { id: main.id, name: main.name, sections: [] };
      blocks.push(block);
    }

    let section = block.sections.find((s) => (s.subgroup?.id ?? null) === (subgroup?.id ?? null));
    if (!section) {
      section = { subgroup, definitions: [] };
      block.sections.push(section);
    }

    section.definitions.push(definition);
  }

  return blocks;
};
