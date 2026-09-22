"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { Alert, Button, Center, Group, Loader, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { RecipeDetailView } from "@/components/recipes/RecipeDetailView";
import { useRecipe } from "@/components/recipes/useRecipe";
import { useRecipeLookups } from "@/components/recipes/useRecipeLookups";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import { agentInternal } from "@/lib/agent/agentInternal";
import { HttpResponse } from "@/lib/models/httpResponse";
import { Recipe } from "@/lib/models/recipes/Recipe";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params?.id as string;

  const { recipe, loading: loadingRecipe, errorMessage, retry, setRecipe } = useRecipe(recipeId);
  const { lookups, loading: loadingLookups } = useRecipeLookups();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loading = loadingRecipe || loadingLookups;

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    const next = !recipe.isFavorite;

    try {
      const res = await agentInternal.put<Recipe>(`/api/user/recipes/${recipe.id}/favorite`, {
        isFavorite: next,
      });
      const data: Partial<HttpResponse<Recipe>> = await res.json().catch(() => ({}));

      if (res.ok) {
        setRecipe(data.body ?? { ...recipe, isFavorite: next });
      } else {
        notifications.show({
          title: "Kunne ikke oppdatere favoritt",
          message: data.message || "Prøv igjen senere.",
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Kunne ikke koble til serveren",
        message: "Prøv igjen senere.",
        color: "red",
      });
    }
  };

  return (
    <AsyncMainContainer size="md" py={30}>
      {loading ? (
        <Center mih={200}>
          <Loader color="sage" size="md" type="dots" />
        </Center>
      ) : errorMessage || !recipe ? (
        <Alert
          color="red"
          variant="light"
          radius="md"
          title="Kunne ikke hente oppskriften"
          icon={<IconAlertCircle size={18} />}
        >
          <Group justify="space-between" align="center">
            <Text size="sm">{errorMessage}</Text>
            <Button size="xs" variant="light" color="red" onClick={retry}>
              Prøv igjen
            </Button>
          </Group>
        </Alert>
      ) : (
        <>
          <RecipeDetailView
            recipe={recipe}
            lookups={lookups}
            onToggleFavorite={handleToggleFavorite}
            onDelete={() => setDeleteOpen(true)}
          />
          <DeleteConfirmModal
            opened={deleteOpen}
            name={recipe.title}
            title="Slett oppskrift"
            url={`/api/user/recipes/${recipe.id}`}
            onClose={() => setDeleteOpen(false)}
            onDeleted={() => router.push("/user/recipes")}
          />
        </>
      )}
    </AsyncMainContainer>
  );
}
