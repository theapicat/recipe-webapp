"use client";

import { Alert, Center, Loader, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { AsyncMainContainer } from "@/components/containers/MainContainer";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { emptyRecipeFormValues } from "@/components/recipes/recipeForm";
import { useRecipeLookups } from "@/components/recipes/useRecipeLookups";

export default function RecipeCreatePage() {
  const { lookups, loading, errorMessage } = useRecipeLookups();

  return (
    <AsyncMainContainer size="md" py={30}>
      {loading ? (
        <Center mih={200}>
          <Loader color="sage" size="md" type="dots" />
        </Center>
      ) : (
        <Stack gap="lg">
          {errorMessage && (
            <Alert
              color="red"
              variant="light"
              radius="md"
              title="Noen valg mangler"
              icon={<IconAlertCircle size={18} />}
            >
              {errorMessage}
            </Alert>
          )}
          <RecipeForm
            mode="create"
            initialValues={emptyRecipeFormValues()}
            lookups={lookups}
            cancelHref="/user/recipes"
          />
        </Stack>
      )}
    </AsyncMainContainer>
  );
}
