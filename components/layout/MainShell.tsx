"use client";

import { ReactNode } from "react";
import { AppShell, AppShellHeader, AppShellMain, Box } from "@mantine/core";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface IProps {
  children: ReactNode;
}

const MainShell = ({ children }: IProps) => {
  return (
    <AppShell padding={0} header={{ height: 60 }}>
      <AppShellHeader>
        <Header />
      </AppShellHeader>

      <AppShellMain
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Box style={{ flex: 1 }}>{children}</Box>
        <Footer />
      </AppShellMain>
    </AppShell>
  );
};

export default MainShell;