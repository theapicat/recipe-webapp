"use client";

import { Fragment, useState } from "react";
import { Badge, Divider, Group, Paper, Stack, Tabs, Text, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { CATALOG_CONFIG, CATALOG_GROUPS } from "@/components/admin/catalog/catalogConfig";
import { CatalogPanel } from "@/components/admin/catalog/CatalogPanel";
import { useCatalogs } from "@/components/admin/catalog/useCatalogs";
import { WritableCatalogResource } from "@/lib/models/catalog/CatalogResource";

// Admin: de delte katalogene (kategorier, allergener, søkeord, enheter) som brukes i oppskrifter og ingredienser.
// Vertikal meny til venstre, gruppert med overskrifter (oppskrifter / ingredienser / enheter); på smale skjermer
// (ingen plass til en sidemeny) en horisontal rad som scroller sideveis. Enhetstypene er faste og vises ikke som egen
// katalog — de lastes kun som data til enhetstabellen og -filteret.
// Valget er lokal state (ikke i URL-en) — da trenger siden verken useSearchParams eller <Suspense>.
export const CatalogManager = () => {
  const { catalogs, reload } = useCatalogs();
  const [active, setActive] = useState<WritableCatalogResource>(CATALOG_GROUPS[0].resources[0]);
  const isNarrow = useMediaQuery("(max-width: 48em)");
  const vertical = !isNarrow;

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Katalog</Title>
        <Text c="dimmed" size="sm">
          Administrer de delte katalogene som brukes til å kategorisere og beskrive oppskrifter,
          ingredienser og måleenheter.
        </Text>
      </div>

      <Paper p="md" radius="md" withBorder>
        <Tabs
          value={active}
          onChange={(value) => value && setActive(value as WritableCatalogResource)}
          orientation={vertical ? "vertical" : "horizontal"}
          keepMounted={false}
        >
          <Tabs.List
            mb={vertical ? 0 : "md"}
            miw={vertical ? 230 : undefined}
            style={vertical ? undefined : { flexWrap: "nowrap", overflowX: "auto" }}
          >
            {CATALOG_GROUPS.map((group, index) => (
              <Fragment key={group.label}>
                {vertical ? (
                  <Text
                    role="presentation"
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    px="sm"
                    pt={index > 0 ? "md" : 0}
                    pb={4}
                  >
                    {group.label}
                  </Text>
                ) : (
                  index > 0 && <Divider orientation="vertical" mx="xs" style={{ flexShrink: 0 }} />
                )}

                {group.resources.map((resource) => {
                  const { icon: Icon, label } = CATALOG_CONFIG[resource];
                  const { items, loading } = catalogs[resource];

                  return (
                    <Tabs.Tab
                      key={resource}
                      value={resource}
                      leftSection={<Icon size={16} />}
                      // Ikke la fanene krympe (og klippe teksten) — raden scroller sideveis i stedet.
                      style={{ flexShrink: 0 }}
                    >
                      {/* Antallet ligger i selve fanen (ikke i rightSection, som klipper merkelappen). */}
                      <Group gap={8} wrap="nowrap" justify="space-between" w="100%">
                        <span>{label}</span>
                        {!loading && (
                          <Badge
                            size="sm"
                            variant="light"
                            color="sage"
                            aria-label={`${items.length} oppføringer`}
                          >
                            {items.length}
                          </Badge>
                        )}
                      </Group>
                    </Tabs.Tab>
                  );
                })}
              </Fragment>
            ))}
          </Tabs.List>

          {CATALOG_GROUPS.flatMap((group) => group.resources).map((resource) => (
            <Tabs.Panel key={resource} value={resource} pl={vertical ? "lg" : 0}>
              <CatalogPanel
                resource={resource}
                catalog={catalogs[resource]}
                unitTypes={catalogs["unit-types"].items}
                onChanged={() => reload(resource)}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      </Paper>
    </Stack>
  );
};
