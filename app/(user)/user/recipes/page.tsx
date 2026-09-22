import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { RecipeManager } from "@/components/recipes/RecipeManager";

export default function UserRecipesPage() {
  return (
    <AsyncMainContainer size="lg" py={30}>
      <RecipeManager />
    </AsyncMainContainer>
  );
}
