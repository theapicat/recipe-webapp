"use client";

import { Group, Pagination, Select, Text } from "@mantine/core";
import { PAGE_SIZE_OPTIONS } from "@/components/common/usePagedItems";

interface TablePaginationProps {
  /** «top»: sammendrag + sidestørrelse + sidevelger. «bottom»: kun sidevelgeren (ingen duplikat av sammendraget). */
  position: "top" | "bottom";
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

// Sidevelger for lange tabeller, brukt både over og under tabellen. Vises ikke for lister som ikke fyller
// den minste sidestørrelsen; sidevelgeren skjules når alt ligger på én side.
export const TablePagination = ({
  position,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) => {
  if (total <= PAGE_SIZE_OPTIONS[0]) return null;

  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;

  const pagination =
    totalPages > 1 ? (
      <Pagination
        total={totalPages}
        value={page}
        onChange={onPageChange}
        color="sage"
        size="sm"
        aria-label={position === "top" ? "Sidevelger øverst" : "Sidevelger nederst"}
      />
    ) : null;

  if (position === "bottom") {
    return (
      pagination && (
        <Group justify="flex-end" mt="md">
          {pagination}
        </Group>
      )
    );
  }

  return (
    <Group justify="space-between" mb="sm" gap="sm">
      <Text size="sm" c="dimmed">
        Viser {start + 1}–{Math.min(start + pageSize, total)} av {total.toLocaleString("nb-NO")}
      </Text>
      <Group gap="sm">
        <Select
          size="xs"
          w={120}
          aria-label="Rader per side"
          data={PAGE_SIZE_OPTIONS.map((size) => ({
            value: String(size),
            label: `${size} per side`,
          }))}
          value={String(pageSize)}
          onChange={(value) => value && onPageSizeChange(Number(value))}
          allowDeselect={false}
        />
        {pagination}
      </Group>
    </Group>
  );
};
