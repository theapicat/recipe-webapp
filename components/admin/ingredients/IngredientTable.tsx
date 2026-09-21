"use client";

import { Badge, Group, Table, Text, UnstyledButton } from "@mantine/core";
import { IconCircleCheck, IconCircleDashed, IconDatabase, IconUser } from "@tabler/icons-react";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagedItems } from "@/components/common/usePagedItems";
import { IngredientListItem } from "@/lib/models/ingredients/IngredientListItem";
import { capitalize } from "@/lib/text/names";

interface IngredientTableProps {
  items: IngredientListItem[];
  pageSize?: number;
  emptyText: string;
  // id -> visningsnavn (listen bærer bare id-er)
  categoryName: (id: string) => string | undefined;
  allergenName: (id: string) => string | undefined;
  unitAbbreviation: (id: string) => string | undefined;
  /** Vis «Opprinnelse»-kolonnen (offisiell/egen). Kun når backend leverer `isOfficial` på listen. */
  showOrigin?: boolean;
  /** Åpner ingrediensen i skuffen (klikk på raden, eller Enter på navnet). */
  onOpen: (id: string) => void;
}

// Ingredienstabell (klikk på en rad åpner den i skuffen). «Verifisert» vises med ikon og tekst (ikke bare farge) og bevisst dempet: alle
// seedede ingredienser er foreløpig uverifisert, så en advarsel på hver rad ville bare vært støy.
export const IngredientTable = ({
  items,
  pageSize = 50,
  emptyText,
  categoryName,
  allergenName,
  unitAbbreviation,
  showOrigin = false,
  onOpen,
}: IngredientTableProps) => {
  const {
    visibleItems,
    currentPage,
    pageSize: size,
    goToPage,
    changePageSize,
    containerProps,
  } = usePagedItems(items, pageSize);

  if (items.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {emptyText}
      </Text>
    );
  }

  const pagination = (position: "top" | "bottom") => (
    <TablePagination
      position={position}
      total={items.length}
      page={currentPage}
      pageSize={size}
      onPageChange={goToPage}
      onPageSizeChange={changePageSize}
    />
  );

  return (
    <div {...containerProps}>
      {pagination("top")}
      <Table.ScrollContainer minWidth={showOrigin ? 860 : 760}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Navn</Table.Th>
              <Table.Th>Kategori</Table.Th>
              <Table.Th>Standardenhet</Table.Th>
              <Table.Th>Energi (per 100 g)</Table.Th>
              <Table.Th>Allergener</Table.Th>
              <Table.Th>Verifisert</Table.Th>
              {showOrigin && <Table.Th>Opprinnelse</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visibleItems.map((ingredient) => {
              const unit = unitAbbreviation(ingredient.defaultUnitId);
              const category = categoryName(ingredient.categoryId);

              return (
                <Table.Tr
                  key={ingredient.id}
                  onClick={() => onOpen(ingredient.id)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td>
                    {/* Knappen gir tastaturtilgang; klikket bobler opp til raden som åpner skuffen. */}
                    <UnstyledButton type="button" fw={500} fz="sm">
                      {capitalize(ingredient.name)}
                    </UnstyledButton>
                    {ingredient.variantOfIngredientId && (
                      <Text size="xs" c="dimmed">
                        Variant
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{category ? capitalize(category) : "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    {unit ? (
                      <Badge variant="outline" color="gray" tt="none">
                        {unit}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{ingredient.energyKcal.toLocaleString("nb-NO")} kcal</Text>
                  </Table.Td>
                  <Table.Td>
                    {ingredient.allergenIds.length === 0 ? (
                      <Text size="sm" c="dimmed">
                        —
                      </Text>
                    ) : (
                      <Group gap={4}>
                        {ingredient.allergenIds.map((id) => (
                          <Badge key={id} color="terracotta" variant="light" tt="none">
                            {capitalize(allergenName(id) ?? "Ukjent")}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap" c={ingredient.isVerified ? undefined : "dimmed"}>
                      {ingredient.isVerified ? (
                        <IconCircleCheck size={16} color="var(--mantine-color-sage-6)" />
                      ) : (
                        <IconCircleDashed size={16} />
                      )}
                      <Text size="sm">{ingredient.isVerified ? "Ja" : "Nei"}</Text>
                    </Group>
                  </Table.Td>
                  {showOrigin && (
                    <Table.Td>
                      <Badge
                        variant="outline"
                        color="gray"
                        tt="none"
                        leftSection={
                          ingredient.isOfficial ? (
                            <IconDatabase size={12} />
                          ) : (
                            <IconUser size={12} />
                          )
                        }
                      >
                        {ingredient.isOfficial ? "Offisiell" : "Egen"}
                      </Badge>
                    </Table.Td>
                  )}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {pagination("bottom")}
    </div>
  );
};
