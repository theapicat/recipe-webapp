import { Unit } from "@/lib/models/units/Unit";
import { UnitType } from "@/lib/models/units/UnitType";

// Backend (Domain/Units/UnitTypeNames + næringsberegningen) forholder seg til enhetstypene via navnet:
//   vekt   -> grunnenhet gram
//   volum  -> grunnenhet milliliter
//   antall -> ingen omregning, forholdstall alltid 1
// Se documentation/10-backlog.md, seksjon 7 (B13), for ønsket om en fast `dimension`-kolonne i stedet for navnematching.
// Delt mellom katalogadministrasjonen (components/admin/catalog) og oppskriftsskjemaet (components/recipes) —
// derfor i lib/ og ikke i én av de to domenemappene.
export const BASE_UNIT_BY_TYPE: Record<string, string> = {
  vekt: "g",
  volum: "ml",
};

export const WEIGHT_UNIT_TYPE = "vekt";
export const VOLUME_UNIT_TYPE = "volum";
export const COUNT_UNIT_TYPE = "antall";

// Vekt-enhetene som faktisk er aktuelle for en oppskrift/porsjon. Katalogen har også mg/µg/µg RAE/µg RE/mg-ATE,
// men de finnes kun fordi næringsstoffene (nutrient_definition.unit_id) bruker dem — helt uaktuelle mengder i en
// oppskrift (ingen oppskrift bruker mikrogram). Eier-bestemt kutt (2026-09-23), rent frontend — enhetene finnes
// fortsatt i katalogen og i enhetskatalog-adminfanen, de er bare ikke tilbudt her. Navnematching, samme
// begrunnelse som over.
export const SENSIBLE_WEIGHT_UNIT_NAMES = new Set(["gram", "hektogram", "kilogram"]);

// Enhetene av én enhetstype, med vekt-utvalget begrenset til SENSIBLE_WEIGHT_UNIT_NAMES. `weightTypeId` er
// enhetstype-id-en for "vekt" (finn den med `unitTypes.find(t => t.name === WEIGHT_UNIT_TYPE)?.id` — sendes inn
// ferdig utledet for å unngå å gjøre det søket om igjen for hver enhet).
export const unitsOfType = (
  units: Unit[],
  typeId: string | null,
  weightTypeId?: string,
): Unit[] => {
  if (!typeId) return [];
  const ofType = units.filter((unit) => unit.unitTypeId === typeId);
  return typeId === weightTypeId
    ? ofType.filter((unit) => SENSIBLE_WEIGHT_UNIT_NAMES.has(unit.name))
    : ofType;
};

export const unitTypeId = (unitTypes: UnitType[], name: string): string | undefined =>
  unitTypes.find((type) => type.name === name)?.id;

export const formatRatio = (ratio: number): string =>
  ratio.toLocaleString("nb-NO", { maximumFractionDigits: 10 });
