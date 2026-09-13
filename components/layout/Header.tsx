"use client";

import { useSession } from "@/lib/session/SessionProvider";
import { useDisclosure } from "@mantine/hooks";
import { Burger, Button, Container, Group } from "@mantine/core";
import Link from "next/link";
import { ADMIN_LINKS, GUEST_LINKS, USER_LINKS } from "@/components/layout/header/navlinks";
import { Logo } from "@/components/layout/header/Logo";
import { NavLinksContainer } from "@/components/layout/header/NavLinkContainer";
import { UserMenu } from "@/components/layout/header/UserMenu";
import { MobileNavDrawer } from "@/components/layout/header/MobileNavDrawer";

export const Header = () => {
  const session = useSession();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const isGuest = !session.role;
  const logoHref =
    session.role === "Admin" ? "/admin/dashboard" : session.role === "User" ? "/dashboard" : "/";

  const currentLinks =
    session.role === "Admin" ? ADMIN_LINKS : session.role === "User" ? USER_LINKS : GUEST_LINKS;

  return (
    <>
      <Container size="xl" h="100%">
        <Group justify="space-between" align="center" h="100%" wrap="nowrap">
          {/* Burger og Desktop-logo */}
          <Group gap="xs" wrap="nowrap">
            <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="md" size="sm" />
            <Group visibleFrom="md">
              <Logo href={logoHref} />
            </Group>
          </Group>

          {/* Mobil-logo (vises kun når burgeren er synlig) */}
          <Group hiddenFrom="md">
            <Logo href={logoHref} />
          </Group>

          {/* Desktop Navigasjon */}
          <NavLinksContainer links={currentLinks} />

          {/* Høyre del (Bruker-meny eller Innlogging) */}
          <Group gap="xs" wrap="nowrap">
            {isGuest ? (
              <Group gap="xs" wrap="nowrap">
                <Button size="xs" variant="subtle" component={Link} href="/login" visibleFrom="xs">
                  Logg inn
                </Button>
                <Button size="xs" variant="filled" component={Link} href="/register">
                  Opprett konto
                </Button>
              </Group>
            ) : (
              <UserMenu />
            )}
          </Group>
        </Group>
      </Container>

      <MobileNavDrawer
        opened={drawerOpened}
        onClose={closeDrawer}
        links={currentLinks}
        isGuest={isGuest}
      />
    </>
  );
};
