"use client";

import React from "react";
import { Paper } from "@mantine/core";

interface AuthCardProps {
  children: React.ReactNode;
}

export const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <Paper radius="md" p="md" withBorder>
      {children}
    </Paper>
  );
};
