import { Ingredient } from "@/lib/models/ingredients/Ingredient";
import { IngredientListItem } from "@/lib/models/ingredients/IngredientListItem";
import { IngredientRequest } from "@/lib/models/ingredients/IngredientRequest";
import { NutrientDefinition } from "@/lib/models/ingredients/NutrientDefinition";
import { Unit } from "@/lib/models/units/Unit";
import { capitalize, normalizeName } from "@/lib/text/names";

// NumberInput gir tall, eller "" mens feltet er tomt.
type Num = number | string;

// Ett rad per næringsstoff i katalogen (57): tom `quantity` = ikke målt (utelates fra requesten), 0 = målt til null.
// `sourceId` er kildens egen referanse for akkurat denne verdien og MÅ sendes tilbake ved lagring — PUT erstatter alle
// barn, så en verdi som ikke sendes med mister sporbarheten sin.
export interface NutrientFormValue {
  nutrientDefinitionId: string;
  quantity: Num;
  sourceId: string | null;
}

export interface PortionFormValue {
  key: string;
  unitId: string | null;
  gramsPerPortion: Num;
}

export interface IngredientFormValues {
  name: string;
  categoryId: string | null;
  primaryUnitTypeId: string | null;
  defaultUnitId: string | null;
  energyKcal: Num;
  energyKj: Num;
  ediblePartPercent: Num;
  sourceId: string;
  sourceUrl: string;
  variantOfIngredientId: string | null;
  isVerified: boolean;
  allergenIds: string[];
  searchKeywordIds: string[];
  nutrients: NutrientFormValue[];
  portions: PortionFormValue[];
}

const newKey = () => globalThis.crypto.randomUUID();

const emptyNutrients = (definitions: NutrientDefinition[]): NutrientFormValue[] =>
  definitions.map((definition) => ({
    nutrientDefinitionId: definition.id,
    quantity: "",
    sourceId: null,
  }));

export const emptyIngredientFormValues = (
  definitions: NutrientDefinition[],
): IngredientFormValues => ({
  name: "",
  categoryId: null,
  primaryUnitTypeId: null,
  defaultUnitId: null,
  energyKcal: "",
  energyKj: "",
  ediblePartPercent: "",
  sourceId: "",
  sourceUrl: "",
  variantOfIngredientId: null,
  isVerified: false,
  allergenIds: [],
  searchKeywordIds: [],
  nutrients: emptyNutrients(definitions),
  portions: [],
});

// Fyller skjemaet fra en eksisterende ingrediens (redigering). Med `asVariantOf` brukes den som mal for en NY
// ingrediens: navn og kilde tømmes, `variantOfIngredientId` settes, og den nye starter uverifisert. Backend kopierer ikke
// selv (næringsdata fylles ut av klienten), og verdiene er nå kopier — ikke målt av kilden — så kilde-id-ene droppes.
export const ingredientToFormValues = (
  ingredient: Ingredient,
  definitions: NutrientDefinition[],
  options: { asVariantOf?: boolean } = {},
): IngredientFormValues => {
  const measured = new Map(ingredient.nutrientValues.map((v) => [v.nutrientDefinitionId, v]));
  const variant = options.asVariantOf === true;

  return {
    name: variant ? "" : capitalize(ingredient.name),
    categoryId: ingredient.categoryId,
    primaryUnitTypeId: ingredient.primaryUnitTypeId,
    defaultUnitId: ingredient.defaultUnitId,
    energyKcal: ingredient.energyKcal,
    energyKj: ingredient.energyKj ?? "",
    ediblePartPercent: ingredient.ediblePartPercent ?? "",
    sourceId: variant ? "" : (ingredient.sourceId ?? ""),
    sourceUrl: variant ? "" : (ingredient.sourceUrl ?? ""),
    variantOfIngredientId: variant ? ingredient.id : ingredient.variantOfIngredientId,
    isVerified: variant ? false : ingredient.isVerified,
    allergenIds: [...ingredient.allergenIds],
    searchKeywordIds: [...ingredient.searchKeywordIds],
    nutrients: definitions.map((definition) => {
      const value = measured.get(definition.id);
      return {
        nutrientDefinitionId: definition.id,
        quantity: value ? value.quantity : "",
        sourceId: variant ? null : (value?.sourceId ?? null),
      };
    }),
    portions: ingredient.portions.map((portion) => ({
      key: newKey(),
      unitId: portion.unitId,
      gramsPerPortion: portion.gramsPerPortion,
    })),
  };
};

const optionalNumber = (value: Num): number | null => (typeof value === "number" ? value : null);

export const countMeasuredNutrients = (nutrients: NutrientFormValue[]): number =>
  nutrients.filter((n) => n.quantity !== "").length;

// Skjema -> request. Navn sendes som skrevet (backend trimmer og lowercaser selv). Tomme næringsverdier utelates.
export const formValuesToRequest = (values: IngredientFormValues): IngredientRequest => ({
  name: values.name.trim(),
  categoryId: values.categoryId ?? "",
  primaryUnitTypeId: values.primaryUnitTypeId ?? "",
  defaultUnitId: values.defaultUnitId ?? "",
  energyKcal: Number(values.energyKcal),
  energyKj: optionalNumber(values.energyKj),
  ediblePartPercent: optionalNumber(values.ediblePartPercent),
  sourceId: values.sourceId.trim() || null,
  sourceUrl: values.sourceUrl.trim() || null,
  variantOfIngredientId: values.variantOfIngredientId,
  isVerified: values.isVerified,
  allergenIds: values.allergenIds,
  searchKeywordIds: values.searchKeywordIds,
  nutrientValues: values.nutrients
    .filter((n) => n.quantity !== "")
    .map((n) => ({
      nutrientDefinitionId: n.nutrientDefinitionId,
      quantity: Number(n.quantity),
      sourceId: n.sourceId,
    })),
  portions: values.portions.map((p) => ({
    unitId: p.unitId ?? "",
    gramsPerPortion: Number(p.gramsPerPortion),
  })),
});

// En eksisterende ingrediens -> request uten å gå via skjemaet (brukes til å verifisere/fjerne verifisering: PUT må
// sende HELE ingrediensen, inkludert alle næringsverdier og porsjoner, ellers slettes de).
export const ingredientToRequest = (
  ingredient: Ingredient,
  overrides: Partial<IngredientRequest> = {},
): IngredientRequest => ({
  name: ingredient.name,
  categoryId: ingredient.categoryId,
  primaryUnitTypeId: ingredient.primaryUnitTypeId,
  defaultUnitId: ingredient.defaultUnitId,
  energyKcal: ingredient.energyKcal,
  energyKj: ingredient.energyKj,
  ediblePartPercent: ingredient.ediblePartPercent,
  sourceId: ingredient.sourceId,
  sourceUrl: ingredient.sourceUrl,
  variantOfIngredientId: ingredient.variantOfIngredientId,
  isVerified: ingredient.isVerified,
  allergenIds: ingredient.allergenIds,
  searchKeywordIds: ingredient.searchKeywordIds,
  nutrientValues: ingredient.nutrientValues.map((v) => ({
    nutrientDefinitionId: v.nutrientDefinitionId,
    quantity: v.quantity,
    sourceId: v.sourceId,
  })),
  portions: ingredient.portions.map((p) => ({
    unitId: p.unitId,
    gramsPerPortion: p.gramsPerPortion,
  })),
  ...overrides,
});

// ---------------- Offisielle ingredienser ----------------
// En offisiell ingrediens er kildedata fra det offentlige (Matvaretabellen) og skal være identisk med kilden. Derfor er disse
// feltene LÅST i editoren: navn, energi (kcal/kJ), spiselig del, alle næringsverdier, kilde-id og kilde-URL. Det vi selv kuraterer
// kan fortsatt endres: allergener, søkeord, kategori, enhetstype/standardenhet, porsjoner og verifisering. Vil man endre en låst verdi,
// oppretter man en variant (den er egen, og fullt redigerbar). Backend bør håndheve det samme (documentation/10, seksjon 7, B1).
//
// Til backend leverer `isOfficial` utleder vi det fra `sourceId`: kun importerte ingredienser har kilde-id (og den er unik).
export const isOfficialIngredient = (
  ingredient: Pick<Ingredient, "sourceId" | "isOfficial">,
): boolean => ingredient.isOfficial ?? ingredient.sourceId !== null;

// ---------------- Verifisering ----------------
// Regel: en ingrediens kan bare verifiseres når den har næringsverdier (minst ett næringsstoff utover energi).
// Frontend håndhever dette; backend bør gjøre det samme (documentation/10, seksjon 7, B5). Å fjerne verifisering er alltid lov.
export const MIN_NUTRIENTS_TO_VERIFY = 1;

export const verifyBlockedReason = (nutrientCount: number): string | null =>
  nutrientCount >= MIN_NUTRIENTS_TO_VERIFY
    ? null
    : "Legg inn næringsverdier før ingrediensen kan verifiseres.";

// ---------------- Validering ----------------
interface ValidationContext {
  /** Alle ingredienser (for duplikatsjekk på navn). */
  ingredients: IngredientListItem[];
  units: Unit[];
  /** Ingrediensen som redigeres (utelates fra duplikat- og variantsjekk). */
  ownId?: string;
}

const isNumber = (value: Num): value is number => typeof value === "number";

// Speiler backend (Application/MediatR/Admin/Ingredients/IngredientMapper.Validate + databasekolonnene) og legger på det
// backend ikke sjekker ennå (documentation/10, seksjon 7, B4): prosentgrenser, enhet må tilhøre enhetstypen, unike porsjoner.
export const createIngredientValidators = ({ ingredients, units, ownId }: ValidationContext) => ({
  name: (value: string) => {
    const normalized = normalizeName(value);
    if (!normalized) return "Navn må fylles ut";
    if (ingredients.some((i) => i.id !== ownId && normalizeName(i.name) === normalized)) {
      return "Det finnes allerede en ingrediens med dette navnet";
    }
    return null;
  },
  categoryId: (value: string | null) => (value ? null : "Velg kategori"),
  primaryUnitTypeId: (value: string | null) => (value ? null : "Velg enhetstype"),
  defaultUnitId: (value: string | null, values: IngredientFormValues) => {
    if (!value) return "Velg standardenhet";
    const unit = units.find((u) => u.id === value);
    return unit && unit.unitTypeId !== values.primaryUnitTypeId
      ? "Standardenheten må høre til den valgte enhetstypen"
      : null;
  },
  energyKcal: (value: Num) =>
    isNumber(value) && value >= 0 ? null : "Energi (kcal) må være et tall som ikke er negativt",
  energyKj: (value: Num) =>
    value === "" || (isNumber(value) && value >= 0) ? null : "Energi (kJ) kan ikke være negativ",
  ediblePartPercent: (value: Num) =>
    value === "" || (isNumber(value) && value > 0 && value <= 100)
      ? null
      : "Spiselig del må være mellom 0 og 100 %",
  sourceUrl: (value: string) =>
    !value.trim() || /^https?:\/\/\S+$/i.test(value.trim())
      ? null
      : "Kilde-URL må starte med http:// eller https://",
  variantOfIngredientId: (value: string | null) =>
    value && value === ownId ? "En ingrediens kan ikke være en variant av seg selv" : null,
  isVerified: (value: boolean, values: IngredientFormValues) =>
    value ? verifyBlockedReason(countMeasuredNutrients(values.nutrients)) : null,
  nutrients: {
    quantity: (value: Num) =>
      value === "" || (isNumber(value) && value >= 0) ? null : "Verdien kan ikke være negativ",
  },
  portions: {
    unitId: (value: string | null, values: IngredientFormValues) => {
      if (!value) return "Velg enhet";
      return values.portions.filter((p) => p.unitId === value).length > 1
        ? "Enheten er brukt i flere porsjoner"
        : null;
    },
    gramsPerPortion: (value: Num) =>
      isNumber(value) && value > 0 ? null : "Gram må være større enn 0",
  },
});
