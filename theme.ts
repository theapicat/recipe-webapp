import { createTheme, MantineColorsTuple } from '@mantine/core';

// 10-stegs fargetuple for Sage (Mosegrønn / Salvie)
const sage: MantineColorsTuple = [
  '#f2f6f3', // 0
  '#e3ece5', // 1
  '#c5d9c9', // 2
  '#a4c4ab', // 3
  '#7ca386', // 4 - Dark Mode Primary
  '#5e8869', // 5
  '#4a6b53', // 6 - Light Mode Primary
  '#3a5441', // 7
  '#2a3e30', // 8
  '#18261c', // 9
];

// 10-stegs fargetuple for Terracotta (Terrakotta / Brent Jord)
const terracotta: MantineColorsTuple = [
  '#fdf5f3', // 0
  '#f9ebe6', // 1 - Light Mode Accent Bg
  '#f1d3ca', // 2
  '#e6b2a2', // 3
  '#dd8a6e', // 4 - Dark Mode Accent
  '#d07052', // 5
  '#c86a4b', // 6 - Light Mode Accent
  '#a34e34', // 7
  '#7e3a25', // 8
  '#4e2114', // 9
];

export const theme = createTheme({
  primaryColor: 'sage',
  primaryShade: { light: 6, dark: 4 },
  colors: {
    sage,
    terracotta,
  },
  defaultRadius: 'md',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '700',
  },
});