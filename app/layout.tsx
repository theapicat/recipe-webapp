import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';

import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ReactNode } from "react";
import { Metadata, Viewport } from "next";
import MainShell from "@/components/layout/MainShell";
import { SessionProvider } from "@/lib/session/SessionProvider";
import sessionManager from "@/lib/session/sessionManager";
import { theme } from "@/theme";

interface IProps {
  children: ReactNode;
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#5E8C71' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1B1E' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Kjøkkenhylla',
    template: '%s | Kjøkkenhylla',
  },
  description: 'Din personlige oppskriftshubb, kokebok og måltidsplanlegger.',
  keywords: ['oppskrifter', 'måltidsplanlegger', 'ukemeny', 'handleliste', 'kokebok', 'kjøkkenhylla'],
  icons: {
    icon: '/icons/favicon.png',
    shortcut: '/icons/favicon.png',
    apple: '/icons/favicon.png',
  },
  openGraph: {
    title: 'Kjøkkenhylla',
    description: 'Din personlige oppskriftshubb og måltidsplanlegger.',
    siteName: 'Kjøkkenhylla',
    locale: 'nb_NO',
    type: 'website',
  },
};

export default async function RootLayout({ children }: IProps) {
  const user = await sessionManager.getUserData();

  return (
    <html lang="nb" {...mantineHtmlProps}>
    <head>
      <ColorSchemeScript defaultColorScheme="auto" />
    </head>

    <body>
    <SessionProvider initialUser={user}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" />
        <MainShell>
          {children}
        </MainShell>
      </MantineProvider>
    </SessionProvider>
    </body>
    </html>
  );
}