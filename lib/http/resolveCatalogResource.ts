import { ApiError } from "@/lib/agent/ApiError";
import {
  CatalogResource,
  isCatalogResource,
  isReadOnlyCatalogResource,
} from "@/lib/models/catalog/CatalogResource";

// Validerer `[resource]`-segmentet i app/api/admin/[resource]/** mot hvitlisten (lib/models/catalog/CatalogResource.ts).
// Ukjent katalog -> 404. Skrivende kall (`write: true`) mot en skrivebeskyttet katalog -> 405.
// Ligger her og ikke i route-filene, siden route-filer kun kan eksportere HTTP-metoder.
export const resolveCatalogResource = async (
  params: Promise<{ resource: string }>,
  { write = false }: { write?: boolean } = {},
): Promise<CatalogResource> => {
  const { resource } = await params;

  if (!isCatalogResource(resource)) {
    throw new ApiError("Ukjent katalog.", 404);
  }

  if (write && isReadOnlyCatalogResource(resource)) {
    throw new ApiError("Denne katalogen kan ikke endres.", 405);
  }

  return resource;
};
