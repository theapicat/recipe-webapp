"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Menu, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";

export const ColorSchemeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  // Løser "auto" til det faktiske, gjeldende utseendet — brukes kun for selve ikonet på knappen.
  const computedColorScheme = useComputedColorScheme("light");

  // Både `colorScheme` og `computedColorScheme` reflekterer brukerens faktiske lagrede valg i
  // localStorage, som serveren ikke kan kjenne til på forhånd (den rendrer alltid ut fra
  // MantineProvider sin `defaultColorScheme="auto"`). Uten denne mount-guarden viser server- og
  // første klient-render potensielt forskjellig ikon, som gir en reell React hydration-feil —
  // ikonet vises derfor nøytralt til komponenten er montert, så byttes det rett etterpå.
  const [mounted, setMounted] = useState(false);
  // Det tiltenkte, kjente "mount-guard"-mønsteret for å unngå hydration-mismatch (se over) — ikke
  // en effekt som kan skrives om til avledet tilstand, siden poenget nettopp er å skille
  // server-/første-render fra alle rendere etterpå.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const icon = !mounted ? (
    <IconSun size={18} />
  ) : colorScheme === "auto" ? (
    <IconDeviceDesktop size={18} />
  ) : computedColorScheme === "dark" ? (
    <IconMoon size={18} />
  ) : (
    <IconSun size={18} />
  );

  return (
    <Menu position="bottom-end" shadow="md" width={170} radius="md">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size="lg" aria-label="Velg fargetema">
          {icon}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Fargetema</Menu.Label>
        <Menu.Item
          leftSection={<IconSun size={16} />}
          rightSection={colorScheme === "light" ? <IconCheck size={14} /> : null}
          onClick={() => setColorScheme("light")}
        >
          Lyst
        </Menu.Item>
        <Menu.Item
          leftSection={<IconMoon size={16} />}
          rightSection={colorScheme === "dark" ? <IconCheck size={14} /> : null}
          onClick={() => setColorScheme("dark")}
        >
          Mørkt
        </Menu.Item>
        <Menu.Item
          leftSection={<IconDeviceDesktop size={16} />}
          rightSection={colorScheme === "auto" ? <IconCheck size={14} /> : null}
          onClick={() => setColorScheme("auto")}
        >
          System
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
