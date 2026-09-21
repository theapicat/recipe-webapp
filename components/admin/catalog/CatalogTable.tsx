"use client";

import { ReactNode } from "react";
import { ActionIcon, Menu, Table, Text, VisuallyHidden } from "@mantine/core";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { deleteBlockedReason } from "@/components/admin/catalog/deleteBlockedReason";
import { TablePagination } from "@/components/common/TablePagination";
import { usePagedItems } from "@/components/common/usePagedItems";
import { CatalogItem } from "@/lib/models/catalog/CatalogModelMap";
import { capitalize } from "@/lib/text/names";

// Ekstra kolonner utover «Navn» (f.eks. forkortelse og forholdstall for enheter).
export interface CatalogColumn {
  header: string;
  render: (item: CatalogItem) => ReactNode;
}

interface CatalogTableProps {
  items: CatalogItem[];
  columns?: CatalogColumn[];
  pageSize?: number;
  emptyText: string;
  onEdit: (item: CatalogItem) => void;
  onDelete: (item: CatalogItem) => void;
}

// Generisk katalogtabell: navn (med stor forbokstav — backend lagrer lowercase), valgfrie ekstra kolonner,
// handlingsmeny og klientside-paginering (søkeord-katalogen har ~300 rader).
export const CatalogTable = ({
  items,
  columns = [],
  pageSize = 25,
  emptyText,
  onEdit,
  onDelete,
}: CatalogTableProps) => {
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

  // Slett er deaktivert (med begrunnelse) for standardoppføringer og oppføringer i bruk — hvis backend oppgir det.
  const blockedReason = (item: CatalogItem) =>
    deleteBlockedReason({
      isSystem: (item as { isSystem?: boolean }).isSystem,
      usageCount: (item as { usageCount?: number }).usageCount,
    });

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
      <Table.ScrollContainer minWidth={480}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Navn</Table.Th>
              {columns.map((column) => (
                <Table.Th key={column.header}>{column.header}</Table.Th>
              ))}
              <Table.Th style={{ width: 60 }}>
                <VisuallyHidden>Handlinger</VisuallyHidden>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visibleItems.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text fw={500} size="sm">
                    {capitalize(item.name)}
                  </Text>
                </Table.Td>
                {columns.map((column) => (
                  <Table.Td key={column.header}>{column.render(item)}</Table.Td>
                ))}
                <Table.Td>
                  <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label={`Handlinger for ${capitalize(item.name)}`}
                      >
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(item)}>
                        Rediger
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        disabled={blockedReason(item) !== null}
                        onClick={() => onDelete(item)}
                      >
                        Slett
                      </Menu.Item>
                      {blockedReason(item) && (
                        <Menu.Label style={{ maxWidth: 220, whiteSpace: "normal" }}>
                          {blockedReason(item)}
                        </Menu.Label>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {pagination("bottom")}
    </div>
  );
};
