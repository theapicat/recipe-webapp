import { ComponentType } from "react";
import {
  IconAlertTriangle,
  IconCategory,
  IconMeat,
  IconProps,
  IconRuler2,
  IconTags,
} from "@tabler/icons-react";
import { WritableCatalogResource } from "@/lib/models/catalog/CatalogResource";

// UI-konfigurasjon per katalog som kan endres (= får en fane). `Record<WritableCatalogResource, …>` gjør at TypeScript
// feiler hvis en ny katalog legges til i hvitlisten (lib/models/catalog/CatalogResource.ts) uten å bli konfigurert her.
export interface CatalogConfig {
  /** Flertall, med stor forbokstav — fanenavn og tittel. */
  label: string;
  /** Entall, lowercase — «Rediger {singular}». */
  singular: string;
  /** Knapp- og dialogtittel for opprettelse (kjønnsbøyd, derfor eksplisitt). */
  newLabel: string;
  description: string;
  icon: ComponentType<IconProps>;
}

export const CATALOG_CONFIG: Record<WritableCatalogResource, CatalogConfig> = {
  "recipe-categories": {
    label: "Oppskriftskategorier",
    singular: "oppskriftskategori",
    newLabel: "Ny oppskriftskategori",
    description: "Kategoriene brukerne velger mellom når de lagrer en oppskrift.",
    icon: IconCategory,
  },
  "ingredient-categories": {
    label: "Ingredienskategorier",
    singular: "ingredienskategori",
    newLabel: "Ny ingredienskategori",
    description: "Grupperer ingrediensene i ingrediensregisteret.",
    icon: IconMeat,
  },
  allergens: {
    label: "Allergener",
    singular: "allergen",
    newLabel: "Ny allergen",
    description: "Allergener og intoleranser som kan knyttes til ingredienser.",
    icon: IconAlertTriangle,
  },
  "search-keywords": {
    label: "Søkeord",
    singular: "søkeord",
    newLabel: "Nytt søkeord",
    description: "Ekstra søkeord som gjør ingredienser lettere å finne.",
    icon: IconTags,
  },
  units: {
    label: "Enheter",
    singular: "enhet",
    newLabel: "Ny enhet",
    description:
      "Måleenheter som brukes i oppskrifter. Enhetstypen (vekt, volum eller antall) er fast. Forholdstallet sier hvor mange grunnenheter (gram eller milliliter) én enhet tilsvarer.",
    icon: IconRuler2,
  },
};

// Rekkefølgen og grupperingen i menyen (overskrift per gruppe).
export interface CatalogGroup {
  label: string;
  resources: WritableCatalogResource[];
}

export const CATALOG_GROUPS: CatalogGroup[] = [
  { label: "Oppskrifter", resources: ["recipe-categories"] },
  { label: "Ingredienser", resources: ["ingredient-categories", "allergens", "search-keywords"] },
  { label: "Enheter", resources: ["units"] },
];
