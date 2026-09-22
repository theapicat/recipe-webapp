import { Ingredient } from "@/lib/models/ingredients/Ingredient";
import { IngredientListItem } from "@/lib/models/ingredients/IngredientListItem";
import { RecipeCategory } from "@/lib/models/recipes/RecipeCategory";
import { Unit } from "@/lib/models/units/Unit";
import { UnitType } from "@/lib/models/units/UnitType";
import {
  COUNT_UNIT_TYPE,
  SENSIBLE_WEIGHT_UNIT_NAMES,
  unitTypeId,
  VOLUME_UNIT_TYPE,
  WEIGHT_UNIT_TYPE,
} from "@/lib/units/unitTypeInfo";

// Alt oppskriftslisten, -skjemaet og -visningen trenger for å oversette id-er til navn og fylle nedtrekkslister.
// Bygges én gang i RecipeManager/RecipeForm-sidene fra de brukervendte katalog-rutene.
export interface RecipeLookups {
  categories: RecipeCategory[];
  units: Unit[];
  unitTypes: UnitType[];
  ingredients: IngredientListItem[];
}

export const nameOf = (
  items: { id: string; name: string }[],
  id: string | null,
): string | undefined => (id ? items.find((item) => item.id === id)?.name : undefined);

export const unitAbbreviationOf = (units: Unit[], id: string | null): string | undefined =>
  id ? units.find((unit) => unit.id === id)?.abbreviation : undefined;

// Enhetene som faktisk gir mening for en gitt ingrediens — og som næringsberegningen faktisk kan regne om til
// gram. Vekt og volum oppfører seg ulikt fra antall (stk, skive, glass, ...), fordi vekt/volum har en universell
// omregning (enhetens `baseUnitRatio`) mens antall-enheter har en unik, ingrediens-spesifikk gram-verdi per
// enhet (`IngredientPortion.gramsPerPortion`) uten noen fellesnevner mellom dem:
//
// - **Vekt og volum «låses opp» som hele typer.** Ingrediensens egen `primaryUnitTypeId` er alltid låst opp
//   (f.eks. all vekt for en ingrediens som primært måles i vekt). Har ingrediensen i tillegg en porsjon i den
//   ANDRE kontinuerlige typen (f.eks. en ingrediens som primært måles i vekt, men har én definert volum-porsjon —
//   det gir en tetthet, altså en bro mellom hele vekt- og hele volum-familien), låses HELE den typen opp også —
//   ikke bare den ene definerte enheten. Vekt begrenses uansett til SENSIBLE_WEIGHT_UNIT_NAMES (g/hg/kg — se
//   unitTypeInfo.ts); volum har ingen slik begrensning (eierens beslutning 2026-09-23).
// - **Antall gir KUN akkurat de enhetene som er definert som porsjon.** Det finnes ~35 antall-enheter i katalogen
//   (stk, skive, fedd, blad, plate, boks, pose, glass i tre størrelser, ...) uten noen fellesnevner — en «skive»
//   betyr noe helt annet per ingrediens. Å låse opp hele antall-typen fordi ÉN antall-enhet er definert ville vist
//   irrelevante enheter (f.eks. «blad» for en agurk som bare har «skive» definert).
// - Ingrediensens egen `defaultUnitId` er alltid med, uansett type — den er allerede vurdert riktig av den som
//   opprettet/verifiserte ingrediensen.
//
// Eksempler (fra eierens presisering 2026-09-23): melk med kun volum-porsjoner (dl, glass) → hele volum-typen +
// akkurat de glass-variantene som er definert. Agurk med vekt som primærtype og «skive» som eneste porsjon → hele
// (kuraterte) vekt-typen + «skive», men ikke «blad»/«plate» (ikke definert for agurk). En ingrediens med både
// vekt- og volum-porsjoner → hele begge typene.
//
// `detail` er valgfri med vilje: `portions` ligger kun på den fulle ingrediensen (GET /user/ingredients/{id}),
// ikke på den lette listen skjemaet søker i. Uten den vises bare den primære typens (kuraterte) range — aldri for
// smalt, bare uten de ingrediens-spesifikke porsjonsenhetene ennå; IngredientRow henter og legger dem til så
// snart de er lastet.
export const unitsForIngredient = (
  units: Unit[],
  unitTypes: UnitType[],
  ingredient: Pick<IngredientListItem, "primaryUnitTypeId" | "defaultUnitId">,
  detail?: Pick<Ingredient, "portions">,
): Unit[] => {
  const weightTypeId = unitTypeId(unitTypes, WEIGHT_UNIT_TYPE);
  const volumeTypeId = unitTypeId(unitTypes, VOLUME_UNIT_TYPE);
  const countTypeId = unitTypeId(unitTypes, COUNT_UNIT_TYPE);

  const portionUnitIds = new Set((detail?.portions ?? []).map((portion) => portion.unitId));
  const portionTypeIds = new Set(
    units.filter((unit) => portionUnitIds.has(unit.id)).map((unit) => unit.unitTypeId),
  );

  const unlockedContinuousTypeIds = new Set(
    [ingredient.primaryUnitTypeId, ...portionTypeIds].filter(
      (typeId) => typeId === weightTypeId || typeId === volumeTypeId,
    ),
  );

  return units.filter((unit) => {
    if (unit.id === ingredient.defaultUnitId) return true;
    if (unit.unitTypeId === countTypeId) return portionUnitIds.has(unit.id);
    if (!unlockedContinuousTypeIds.has(unit.unitTypeId)) return false;
    return unit.unitTypeId !== weightTypeId || SENSIBLE_WEIGHT_UNIT_NAMES.has(unit.name);
  });
};
