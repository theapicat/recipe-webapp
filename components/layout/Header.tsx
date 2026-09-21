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
import { ColorSchemeToggle } from "@/components/layout/header/ColorSchemeToggle";

export const Header = () => {
  const session = useSession();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const isGuest = !session.role;
  const logoHref =
    session.role === "admin" ? "/admin/dashboard" : session.role === "user" ? "/dashboard" : "/";

  const currentLinks =
    session.role === "admin" ? ADMIN_LINKS : session.role === "user" ? USER_LINKS : GUEST_LINKS;

  // Under dette bruddpunktet vises burger-menyen i stedet for lenkene i headeren. Flere enn 5 lenker (admin) trenger
  // mer plass enn `md` (992px) gir — da klippes brukermenyen ytterst til høyre — så de går til burger under `lg`.
  const collapseBelow = currentLinks.length > 5 ? "lg" : "md";

  return (
    <>
      <Container size="xl" h="100%">
        <Group justify="space-between" align="center" h="100%" wrap="nowrap">
          {/* Burger og Desktop-logo */}
          <Group gap="xs" wrap="nowrap">
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom={collapseBelow}
              size="sm"
            />
            <Group visibleFrom={collapseBelow}>
              <Logo href={logoHref} />
            </Group>
          </Group>

          {/* Mobil-logo (vises kun når burgeren er synlig) */}
          <Group hiddenFrom={collapseBelow}>
            <Logo href={logoHref} />
          </Group>

          {/* Desktop Navigasjon */}
          <NavLinksContainer links={currentLinks} visibleFrom={collapseBelow} />

          {/* Høyre del (Fargetema + Bruker-meny eller Innlogging) */}
          <Group gap="xs" wrap="nowrap">
            <ColorSchemeToggle />
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
        hiddenFrom={collapseBelow}
      />
    </>
  );
};
