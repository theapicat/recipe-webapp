"use client";

import { ReactNode } from "react";
import { Center, Container, ContainerProps, Loader } from "@mantine/core";

interface MainContainerProps extends ContainerProps {
  children: ReactNode;
}

interface AsyncMainContainerProps extends Omit<MainContainerProps, "children"> {
  // Valgfri her (i motsetning til MainContainerProps) — når `loading` er true blir children
  // aldri rendret, f.eks. når komponenten brukes som ren Suspense-fallback uten eget innhold.
  children?: ReactNode;
  loading?: boolean;
  minHeight?: number | string;
}

/**
 * Ren statisk beholder for hovedinnhold.
 */
export const MainContainer = ({
  children,
  size = "lg",
  py = "xl",
  ...props
}: MainContainerProps) => {
  return (
    <Container size={size} py={py} {...props}>
      {children}
    </Container>
  );
};

/**
 * Beholder med laste-tilstand (Loader).
 */
export const AsyncMainContainer = ({
  loading = false,
  minHeight = 300,
  children,
  ...props
}: AsyncMainContainerProps) => {
  return (
    <MainContainer {...props}>
      {loading ? (
        <Center style={{ minHeight }}>
          <Loader color="sage" size="md" type="dots" />
        </Center>
      ) : (
        children
      )}
    </MainContainer>
  );
};
