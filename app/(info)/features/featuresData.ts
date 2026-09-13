import {
  IconChefHat,
  IconSearch,
  IconCalendarEvent,
  IconShoppingCart,
  IconScale,
  IconDownload,
  IconDeviceMobile,
  IconHeart,
  IconShieldCheck,
  IconLink,
  IconShare,
  IconProps,
} from "@tabler/icons-react";
import React from "react";

export type FeatureStatus = "lansert" | "under_utvikling" | "kommer" | "planlagt";

export interface StatusConfig {
  label: string;
  color: string;
}

export const STATUS_CONFIG: Record<FeatureStatus, StatusConfig> = {
  lansert: { label: "Lansert", color: "green" },
  under_utvikling: { label: "Under utvikling", color: "orange" },
  kommer: { label: "Kommer snart", color: "violet" },
  planlagt: { label: "Planlagt", color: "gray" },
};

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<IconProps>;
  color: string;
  category: "kjerne" | "planlegging" | "profil";
  status: FeatureStatus;
}

export interface FeatureCategory {
  id: "kjerne" | "planlegging" | "profil";
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeColor: string;
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: "kjerne",
    title: "Oppskrifter & Smarte Verktøy",
    subtitle:
      "Full kontroll på dine egne oppskrifter – importer fra favorittsider eller del med venner.",
    badgeLabel: "Kjernefunksjonalitet",
    badgeColor: "teal",
  },
  {
    id: "planlegging",
    title: "Ukesmeny & Organisering",
    subtitle: "Spar tid og penger hver uke med strukturert måltidsplanlegging.",
    badgeLabel: "Planlegging",
    badgeColor: "blue",
  },
  {
    id: "profil",
    title: "Profil & Tilpasninger",
    subtitle: "Tilpass Kjøkkenhylla til dine kostholdsbehov og preferanser.",
    badgeLabel: "Personaliteter",
    badgeColor: "orange",
  },
];

export const FEATURES_DATA: FeatureItem[] = [
  // --- Kjerne ---
  {
    id: "rec_import",
    title: "Lynrask Importer",
    description:
      "Lim inn en URL fra Matprat, Trines Matblogg og andre populære matblogger for å hente ut oppskriften automatisk.",
    icon: IconLink,
    color: "teal",
    category: "kjerne",
    status: "planlagt",
  },
  {
    id: "rec_share",
    title: "Del med Venner",
    description:
      "Ingen felles register med oppskrifter. Du bygger din egen samling og kan dele dine favorittretter med venner og familie.",
    icon: IconShare,
    color: "teal",
    category: "kjerne",
    status: "planlagt",
  },
  {
    id: "rec_edit",
    title: "Full Redigerbarhet",
    description:
      "Skap dine egne kulinariske mesterverk fra bunnen eller tilpass importerte oppskrifter med egne notater og ingredienser.",
    icon: IconChefHat,
    color: "teal",
    category: "kjerne",
    status: "planlagt",
  },
  {
    id: "rec_fridge",
    title: "Tøm Kjøleskapet",
    description:
      "Søk i din egen oppskriftsdatabase basert på råvarene du allerede har i kjøleskapet for å redusere matsvinn.",
    icon: IconSearch,
    color: "teal",
    category: "kjerne",
    status: "planlagt",
  },
  {
    id: "rec_cookmode",
    title: "Kokkemodus & Timer",
    description:
      "Hold skjermen våken på kjøkkenbenken, skaler porsjoner sømløst og start innebygde nedtellingsur.",
    icon: IconDeviceMobile,
    color: "teal",
    category: "kjerne",
    status: "planlagt",
  },
  {
    id: "rec_fav",
    title: "Favoritter & Historikk",
    description:
      "Lagre dine favorittretter, følg med på antall ganger laget og få oversikt over når du sist spiste dem.",
    icon: IconHeart,
    color: "teal",
    category: "kjerne",
    status: "planlagt",
  },

  // --- Planlegging ---
  {
    id: "plan_calendar",
    title: "Visuell Måltidsplanlegger",
    description:
      "Sett opp middager fra mandag til søndag. Legg inn oppskrifter fra din samling rett inn i ukeplanen.",
    icon: IconCalendarEvent,
    color: "blue",
    category: "planlegging",
    status: "planlagt",
  },
  {
    id: "plan_shopping",
    title: "Dynamisk Handleliste",
    description:
      "Mottar ingredienser direkte fra ukesmenyen din, slår sammen like varer og organiserer etter kategorier.",
    icon: IconShoppingCart,
    color: "blue",
    category: "planlegging",
    status: "planlagt",
  },
  {
    id: "plan_nutrition",
    title: "Nærings- & Kaloriberegning",
    description:
      "Automatisk utregning av næringsinnhold per porsjon og total oppsummering for hver ukesdag.",
    icon: IconScale,
    color: "blue",
    category: "planlegging",
    status: "planlagt",
  },

  // --- Profil ---
  {
    id: "prof_allergies",
    title: "Allergier & Advarsler",
    description:
      "Registrer allergier på kontoen din og få tydelige varsler dersom importerte retter inneholder allergener.",
    icon: IconShieldCheck,
    color: "orange",
    category: "profil",
    status: "planlagt",
  },
  {
    id: "prof_pdf",
    title: "Eksport & PDF-Utskrift",
    description:
      "Skriv ut fine oppskriftskort fra samlingen din eller eksporter handlelisten som PDF før du drar på butikken.",
    icon: IconDownload,
    color: "orange",
    category: "profil",
    status: "planlagt",
  },
];
