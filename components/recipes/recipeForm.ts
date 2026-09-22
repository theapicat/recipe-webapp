import { Recipe } from "@/lib/models/recipes/Recipe";
import { RecipeIngredientRequest } from "@/lib/models/recipes/RecipeIngredientRequest";
import { RecipeRequest } from "@/lib/models/recipes/RecipeRequest";
import { RecipeStepRequest } from "@/lib/models/recipes/RecipeStepRequest";
import { normalizeName } from "@/lib/text/names";

// NumberInput gir tall, eller "" mens feltet er tomt.
type Num = number | string;

const UNCONFIRMED_PREFIX = "unconfirmed:";

// `refId` er enten en ekte ingrediens-id fra katalogen, eller "unconfirmed:<id>" for en linje som allerede peker på
// brukerens egen ubekreftede ingrediens (se lib/models/ingredients/UnconfirmedIngredient.ts). Editoren kan ikke
// opprette nye ubekreftede linjer ennå (se documentation/10-backlog.md, seksjon 2, «Mine ingredienser») — den lar
// bare eksisterende stå urørt, vist med `unconfirmedName` siden den ikke finnes i ingredienskatalogen.
export interface RecipeIngredientFormValue {
  key: string;
  refId: string | null;
  unconfirmedName: string | null;
  amount: Num;
  unitId: string | null;
  note: string;
}

export interface RecipeStepFormValue {
  key: string;
  description: string;
  timerMinutes: Num;
}

export interface RecipeFormValues {
  title: string;
  description: string;
  categoryId: string | null;
  servings: Num;
  imageUrl: string;
  imageAttribution: string;
  sourceReference: string;
  ingredients: RecipeIngredientFormValue[];
  steps: RecipeStepFormValue[];
}

const newKey = () => globalThis.crypto.randomUUID();

export const unconfirmedRefId = (id: string) => `${UNCONFIRMED_PREFIX}${id}`;

export const isUnconfirmedRef = (refId: string | null) =>
  (refId ?? "").startsWith(UNCONFIRMED_PREFIX);

export const emptyIngredientRow = (): RecipeIngredientFormValue => ({
  key: newKey(),
  refId: null,
  unconfirmedName: null,
  amount: "",
  unitId: null,
  note: "",
});

export const emptyStepRow = (): RecipeStepFormValue => ({
  key: newKey(),
  description: "",
  timerMinutes: "",
});

export const emptyRecipeFormValues = (): RecipeFormValues => ({
  title: "",
  description: "",
  categoryId: null,
  servings: 4,
  imageUrl: "",
  imageAttribution: "",
  sourceReference: "",
  ingredients: [emptyIngredientRow()],
  steps: [emptyStepRow()],
});

// Fyller skjemaet fra en eksisterende oppskrift (redigering). Rekkefølgen bevares (backend sorterer allerede på
// sortOrder/stepNumber).
export const recipeToFormValues = (recipe: Recipe): RecipeFormValues => ({
  title: recipe.title,
  description: recipe.description,
  categoryId: recipe.categoryId,
  servings: recipe.servings,
  imageUrl: recipe.imageUrl ?? "",
  imageAttribution: recipe.imageAttribution ?? "",
  sourceReference: recipe.source.reference ?? "",
  ingredients: recipe.ingredients.map((ingredient) => ({
    key: newKey(),
    refId:
      ingredient.ingredientId ??
      (ingredient.unconfirmedIngredientId
        ? unconfirmedRefId(ingredient.unconfirmedIngredientId)
        : null),
    unconfirmedName: ingredient.unconfirmedIngredientId ? ingredient.name : null,
    amount: ingredient.amount,
    unitId: ingredient.unitId,
    note: ingredient.note ?? "",
  })),
  steps: recipe.steps.map((step) => ({
    key: newKey(),
    description: step.description,
    timerMinutes: step.timerMinutes ?? "",
  })),
});

const optionalNumber = (value: Num): number | undefined =>
  typeof value === "number" ? value : undefined;

// Skjema -> request. Tomme valgfrie felt sendes som null/utelates, slik backend forventer (se RecipeRequest).
export const formValuesToRequest = (values: RecipeFormValues): RecipeRequest => ({
  title: values.title.trim(),
  description: values.description.trim(),
  categoryId: values.categoryId ?? "",
  servings: Number(values.servings),
  imageUrl: values.imageUrl.trim() || null,
  imageAttribution: values.imageAttribution.trim() || null,
  source: values.sourceReference.trim() ? { reference: values.sourceReference.trim() } : undefined,
  steps: values.steps.map((step): RecipeStepRequest => ({
    description: step.description.trim(),
    timerMinutes: optionalNumber(step.timerMinutes) ?? null,
  })),
  ingredients: values.ingredients.map((ingredient): RecipeIngredientRequest => {
    const ref = ingredient.refId ?? "";
    const base = ref.startsWith(UNCONFIRMED_PREFIX)
      ? { unconfirmedIngredientId: ref.slice(UNCONFIRMED_PREFIX.length) }
      : { ingredientId: ref };

    return {
      ...base,
      amount: optionalNumber(ingredient.amount) ?? 0,
      unitId: ingredient.unitId ?? "",
      note: ingredient.note.trim() || null,
    };
  }),
});

// ---------------- Validering ----------------
// Speiler backend-grensene fra RecipeRequest (se modellkommentarene) og legger på det backend ikke sjekker ennå
// (tomme rader, referert enhet/ingrediens må faktisk finnes).
export const createRecipeValidators = () => ({
  title: (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Tittel må fylles ut";
    if (trimmed.length > 200) return "Tittel kan være maks 200 tegn";
    return null;
  },
  description: (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Beskrivelse må fylles ut";
    if (trimmed.length > 5000) return "Beskrivelse kan være maks 5000 tegn";
    return null;
  },
  categoryId: (value: string | null) => (value ? null : "Velg kategori"),
  servings: (value: Num) =>
    typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 1000
      ? null
      : "Porsjoner må være et heltall mellom 1 og 1000",
  imageUrl: (value: string) =>
    !value.trim() || /^https?:\/\/\S+$/i.test(value.trim())
      ? null
      : "Bilde-URL må starte med http:// eller https://",
  ingredients: {
    refId: (value: string | null) => (value ? null : "Velg en ingrediens"),
    unitId: (value: string | null) => (value ? null : "Velg enhet"),
    amount: (value: Num) =>
      value === "" || (typeof value === "number" && value >= 0)
        ? null
        : "Mengde kan ikke være negativ",
  },
  steps: {
    description: (value: string) => (value.trim() ? null : "Beskriv steget"),
    timerMinutes: (value: Num) =>
      value === "" || (typeof value === "number" && value >= 0 && value <= 10080)
        ? null
        : "Timer må være mellom 0 og 10 080 minutter",
  },
});

export const MIN_INGREDIENTS = 1;
export const MAX_INGREDIENTS = 100;
export const MIN_STEPS = 1;
export const MAX_STEPS = 100;

// «Etter smak»: mengde 0 vises som tekst i stedet for et tall (se RecipeIngredient.amount).
export const isToTaste = (amount: number) => amount === 0;

export const matchesRecipeSearch = (title: string, query: string) =>
  !query || normalizeName(title).includes(query);
