"use client";

import { ReactNode } from "react";
import { Center, Container, ContainerProps, Loader } from "@mantine/core";

interface MainContainerProps extends ContainerProps {
  children: ReactNode;
}

interface AsyncMainContainerProps extends MainContainerProps {
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