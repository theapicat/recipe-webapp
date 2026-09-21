import type { Metadata } from "next";
import { IngredientManager } from "@/components/admin/ingredients/IngredientManager";
import { MainContainer } from "@/components/containers/MainContainer";

export const metadata: Metadata = { title: "Ingredienser" };

export default function AdminIngredientsPage() {
  return (
    <MainContainer size="xl" py={30}>
      <IngredientManager />
    </MainContainer>
  );
}
