import {
  IconBook,
  IconCalendarEvent,
  IconInfoCircle,
  IconLayoutDashboard,
  IconProps,
  IconShieldCheck,
  IconShoppingCart,
  IconSparkles,
  IconUsers,
  IconWorldCheck,
  IconTags,
  IconActivity,
  IconLink,
  IconCarrot,
} from "@tabler/icons-react";
import React from "react";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<IconProps>;
}

// Gjestelenker (Før innlogging)
export const GUEST_LINKS: NavItem[] = [
  { label: "Hva får du?", href: "/features", icon: IconSparkles },
  { label: "Om appen", href: "/about", icon: IconInfoCircle },
];

// Brukerlenker (Vanlig innlogget bruker)
export const USER_LINKS: NavItem[] = [
  { label: "Oversikt", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "Mine Oppskrifter", href: "/user/recipes", icon: IconBook },
  { label: "Importer Oppskrift", href: "/user/import", icon: IconLink },
  { label: "Måltidsplanlegger", href: "/user/mealplan", icon: IconCalendarEvent },
  { label: "Handleliste", href: "/user/shoppinglist", icon: IconShoppingCart },
];

// Adminlenker (Kun tilgjengelig for Admin)
export const ADMIN_LINKS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: IconShieldCheck },
  { label: "Brukere", href: "/admin/users", icon: IconUsers },
  { label: "Whitelist", href: "/admin/whitelist", icon: IconWorldCheck },
  { label: "Katalog", href: "/admin/catalog", icon: IconTags },
  { label: "Ingredienser", href: "/admin/ingredients", icon: IconCarrot },
  { label: "System", href: "/admin/system", icon: IconActivity },
];
