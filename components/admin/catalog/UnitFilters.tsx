"use client";

import { Button, Group, NumberInput, Select } from "@mantine/core";
import { IconFilterOff } from "@tabler/icons-react";
import { norwegianNumberProps } from "@/components/forms/common/numberInputProps";
import { Unit } from "@/lib/models/units/Unit";
import { UnitType } from "@/lib/models/units/UnitType";
import { capitalize } from "@/lib/text/names";

// NumberInput gir tall, eller "" mens feltet er tomt.
export interface UnitFilterValue {
  unitTypeId: string | null;
  ratioMin: number | string;
  ratioMax: number | string;
}

export const EMPTY_UNIT_FILTER: UnitFilterValue = { unitTypeId: null, ratioMin: "", ratioMax: "" };

export const isUnitFilterActive = (filter: UnitFilterValue): boolean =>
  filter.unitTypeId !== null || filter.ratioMin !== "" || filter.ratioMax !== "";

// Enhetstype og forholdstallets område (fra/til, begge grenser inkludert) — kombineres med søkefeltet.
export const applyUnitFilter = (units: Unit[], filter: UnitFilterValue): Unit[] =>
  units.filter(
    (unit) =>
      (!filter.unitTypeId || unit.unitTypeId === filter.unitTypeId) &&
      (typeof filter.ratioMin !== "number" || unit.baseUnitRatio >= filter.ratioMin) &&
      (typeof filter.ratioMax !== "number" || unit.baseUnitRatio <= filter.ratioMax),
  );

interface UnitFiltersProps {
  unitTypes: UnitType[];
  value: UnitFilterValue;
  onChange: (value: UnitFilterValue) => void;
}

export const UnitFilters = ({ unitTypes, value, onChange }: UnitFiltersProps) => (
  <Group align="flex-end" gap="sm">
    <Select
      label="Enhetstype"
      placeholder="Alle typer"
      data={unitTypes.map((type) => ({ value: type.id, label: capitalize(type.name) }))}
      value={value.unitTypeId}
      onChange={(unitTypeId) => onChange({ ...value, unitTypeId })}
      clearable
      w={160}
    />
    <NumberInput
      label="Forholdstall fra"
      value={value.ratioMin}
      onChange={(ratioMin) => onChange({ ...value, ratioMin })}
      decimalScale={10}
      w={140}
      {...norwegianNumberProps}
    />
    <NumberInput
      label="Forholdstall til"
      value={value.ratioMax}
      onChange={(ratioMax) => onChange({ ...value, ratioMax })}
      decimalScale={10}
      w={140}
      {...norwegianNumberProps}
    />
    {isUnitFilterActive(value) && (
      <Button
        variant="subtle"
        color="gray"
        leftSection={<IconFilterOff size={16} />}
        onClick={() => onChange(EMPTY_UNIT_FILTER)}
      >
        Nullstill filtre
      </Button>
    )}
  </Group>
);
