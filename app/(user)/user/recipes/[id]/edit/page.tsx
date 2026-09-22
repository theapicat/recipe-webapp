"use client";

import { useParams } from "next/navigation";
import { Alert, Button, Center, Group, Loader, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { recipeToFormValues } from "@/components/recipes/recipeForm";
import { useRecipe } from "@/components/recipes/useRecipe";
import { useRecipeLookups } from "@/components/recipes/useRecipeLookups";

export default function RecipeEditPage() {
  const params = useParams();
  const recipeId = params?.id as string;

  const { recipe, loading: loadingRecipe, errorMessage, retry } = useRecipe(recipeId);
  const { lookups, loading: loadingLookups, errorMessage: lookupsError } = useRecipeLookups();

  const loading = loadingRecipe || loadingLookups;

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
        <Stack gap="lg">
          {lookupsError && (
            <Alert
              color="red"
              variant="light"
              radius="md"
              title="Noen valg mangler"
              icon={<IconAlertCircle size={18} />}
            >
              {lookupsError}
            </Alert>
          )}
          <RecipeForm
            mode="edit"
            recipeId={recipe.id}
            initialValues={recipeToFormValues(recipe)}
            lookups={lookups}
            cancelHref={`/user/recipes/${recipe.id}`}
          />
        </Stack>
      )}
    </AsyncMainContainer>
  );
}
