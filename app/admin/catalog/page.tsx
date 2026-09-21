import type { Metadata } from "next";
import { CatalogManager } from "@/components/admin/catalog/CatalogManager";
import { MainContainer } from "@/components/containers/MainContainer";

export const metadata: Metadata = { title: "Katalog" };

export default function AdminCatalogPage() {
  return (
    <MainContainer size="lg" py={30}>
      <CatalogManager />
    </MainContainer>
  );
}
