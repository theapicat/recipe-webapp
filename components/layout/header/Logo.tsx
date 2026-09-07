"use client";

import { Group, Text, UnstyledButton } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: number;
}

export const Logo = ({ href = "/", size = 32 }: LogoProps) => {
  return (
    <UnstyledButton component={Link} href={href} style={{ textDecoration: "none" }}>
      <Group gap="xs" align="center" wrap="nowrap">
        <Image
          src="/icons/logo.svg"
          alt="Kjøkkenhylla logo"
          width={size}
          height={size}
          priority
        />
        <Text fw={800} size="lg" style={{ letterSpacing: "-0.5px" }}>
          Kjøkkenhylla
        </Text>
      </Group>
    </UnstyledButton>
  );
};