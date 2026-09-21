"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconAlertCircle, IconPlus, IconSearch } from "@tabler/icons-react";
import { CatalogItemForm } from "@/components/admin/catalog/CatalogItemForm";
import { CATALOG_CONFIG } from "@/components/admin/catalog/catalogConfig";
import { CatalogColumn, CatalogTable } from "@/components/admin/catalog/CatalogTable";
import { DeleteConfirmModal } from "@/components/common/DeleteConfirmModal";
import {
  applyUnitFilter,
  EMPTY_UNIT_FILTER,
  isUnitFilterActive,
  UnitFilters,
} from "@/components/admin/catalog/UnitFilters";
import { UnitForm } from "@/components/admin/catalog/UnitForm";
import { BASE_UNIT_BY_TYPE, formatRatio } from "@/components/admin/catalog/unitTypeInfo";
import { CatalogState } from "@/components/admin/catalog/useCatalogs";
import { CatalogItem } from "@/lib/models/catalog/CatalogModelMap";
import { WritableCatalogResource } from "@/lib/models/catalog/CatalogResource";
import { Unit } from "@/lib/models/units/Unit";
import { UnitType } from "@/lib/models/units/UnitType";
import { capitalize, normalizeName } from "@/lib/text/names";

interface CatalogPanelProps {
  resource: WritableCatalogResource;
  catalog: CatalogState;
  /** Enhetstypene (fast, kun data): trengs av enhetsskjemaet, -filteret og -tabellen (id -> navn). */
  unitTypes: UnitType[];
  /** Leser katalogen på nytt — kalles etter hver vellykket endring, og av «Prøv igjen». */
  onChanged: () => void;
}

const isUnit = (item: CatalogItem): item is Unit => "abbreviation" in item;

// Innholdet for én katalog: søk, tabell, opprett/rediger (modal) og slett (bekreftelse). Fungerer likt for alle
// katalogene; kun enheter har egne kolonner, filtre (type og forholdstall) og et eget skjema.
export const CatalogPanel = ({ resource, catalog, unitTypes, onChanged }: CatalogPanelProps) => {
  const config = CATALOG_CONFIG[resource];
  const isUnits = resource === "units";

  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState(EMPTY_UNIT_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [formItem, setFormItem] = useState<CatalogItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<CatalogItem | null>(null);

  const query = normalizeName(search);
  const matchesSearch = (item: CatalogItem) =>
    !query ||
    normalizeName(item.name).includes(query) ||
    (isUnit(item) && item.abbreviation.toLowerCase().includes(query));

  // Enhetsfilteret (type og forholdstall) gjelder kun enheter og kombineres med søkefeltet.
  const filterActive = isUnits && isUnitFilterActive(unitFilter);
  const filterable: CatalogItem[] = isUnits
    ? applyUnitFilter(catalog.items as Unit[], unitFilter)
    : catalog.items;
  const items = filterable.filter(matchesSearch);
  const narrowed = Boolean(query) || filterActive;

  const typeName = (unitTypeId: string) => unitTypes.find((type) => type.id === unitTypeId)?.name;

  const unitColumns: CatalogColumn[] = [
    {
      header: "Forkortelse",
      // tt="none": forkortelsen er et symbol der store/små bokstaver har betydning (ml/mL, µg) — Badge gjør ellers alt om til CAPS.
      render: (item) =>
        isUnit(item) && (
          <Badge color="sage" tt="none">
            {item.abbreviation}
          </Badge>
        ),
    },
    {
      header: "Enhetstype",
      render: (item) =>
        isUnit(item) && <Text size="sm">{capitalize(typeName(item.unitTypeId) ?? "Ukjent")}</Text>,
    },
    {
      header: "Forholdstall",
      render: (item) => {
        if (!isUnit(item)) return null;
        // «antall» omregnes ikke; ukjent type vises uten grunnenhet.
        const baseUnit = BASE_UNIT_BY_TYPE[typeName(item.unitTypeId) ?? ""];
        return (
          <Text size="sm">{baseUnit ? `${formatRatio(item.baseUnitRatio)} ${baseUnit}` : "—"}</Text>
        );
      },
    },
  ];

  const openCreate = () => {
    setFormItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setFormItem(item);
    setFormOpen(true);
  };

  const openDelete = (item: CatalogItem) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    onChanged();
  };

  const handleDeleted = () => {
    setDeleteOpen(false);
    onChanged();
  };

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {config.description}
      </Text>

      {catalog.errorMessage && (
        <Alert
          color="red"
          variant="light"
          radius="md"
          title="Kunne ikke hente katalogen"
          icon={<IconAlertCircle size={18} />}
        >
          <Group justify="space-between" align="center">
            <Text size="sm">{catalog.errorMessage}</Text>
            <Button size="xs" variant="light" color="red" onClick={onChanged}>
              Prøv igjen
            </Button>
          </Group>
        </Alert>
      )}

      <Group justify="space-between">
        <TextInput
          placeholder={`Søk i ${config.label.toLowerCase()}...`}
          aria-label={`Søk i ${config.label.toLowerCase()}`}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ width: 300, maxWidth: "100%" }}
        />

        <Button leftSection={<IconPlus size={16} />} color="sage" onClick={openCreate}>
          {config.newLabel}
        </Button>
      </Group>

      {isUnits && <UnitFilters unitTypes={unitTypes} value={unitFilter} onChange={setUnitFilter} />}

      {narrowed && !catalog.loading && (
        <Text size="xs" c="dimmed">
          Viser {items.length} av {catalog.items.length}
        </Text>
      )}

      {catalog.loading && catalog.items.length === 0 ? (
        <Center mih={200}>
          <Loader color="sage" size="md" type="dots" />
        </Center>
      ) : (
        <CatalogTable
          items={items}
          columns={isUnits ? unitColumns : []}
          emptyText={narrowed ? "Ingen treff." : "Katalogen er tom."}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      )}

      <Modal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        title={formItem ? `Rediger ${config.singular}` : config.newLabel}
        closeOnClickOutside={false}
        centered
        radius="md"
      >
        {isUnits ? (
          <UnitForm
            item={formItem as Unit | null}
            existing={catalog.items as Unit[]}
            unitTypes={unitTypes}
            onSaved={handleSaved}
          />
        ) : (
          <CatalogItemForm
            resource={resource}
            item={formItem}
            existing={catalog.items}
            onSaved={handleSaved}
          />
        )}
      </Modal>

      <DeleteConfirmModal
        opened={deleteOpen}
        name={deleteItem ? capitalize(deleteItem.name) : null}
        url={`/api/admin/${resource}/${deleteItem?.id ?? ""}`}
        onClose={() => setDeleteOpen(false)}
        onDeleted={handleDeleted}
      />
    </Stack>
  );
};
