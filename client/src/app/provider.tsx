'use client';

import { Navbar } from '@/components/Navbar';
import NextAuthSessionProvider from '@/providers/sessionProvider';
import useFetchPrimaryColor from '@/requests/queries/FetchPrimaryColor';
import GlobalStyles from '@/styles/global';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import {
  hydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import '../styles/globals.css';
import Loading from './loading';

type ThemeProviderPageProps = {
  children: React.ReactNode;
};

export const Provider = ({ children }: ThemeProviderPageProps) => {
  const [loading, setLoading] = useState(false);
  const queryClientRef = new QueryClient();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/administrative');
  const primaryColor = useFetchPrimaryColor();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    handleStart();

    handleComplete();

    return () => {
      // Limpeza se fosse necessário
    };
  }, [pathname]);

  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: primaryColor,
      },
      error: {
        main: '#EE4C4C',
      },
      info: {
        main: '#0d54bf',
      },
      success: {
        main: '#0bd688',
      },
      warning: {
        main: '#F4DA85',
      },
      common: {
        black: '#13110C',
        white: '#F8FAFA',
      },
      background: {
        default: '#F8FAFA',
        paper: '#F0F0F0',
      },
      text: {
        primary: '#13110C',
        secondary: '#717273',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
      grey: {
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
    },
    typography: {
      allVariants: {
        fontFamily: 'var(--font-poppins)',
      },
    },
  });

  return (
    <NextAuthSessionProvider>
      <QueryClientProvider client={queryClientRef}>
        <HydrationBoundary state={hydrate}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles />
            {loading && <Loading />}
            {!loading && !isAdminRoute && <Navbar />}
            {!loading && <Box className="m-4 p-4">{children}</Box>}
          </ThemeProvider>
        </HydrationBoundary>
      </QueryClientProvider>
    </NextAuthSessionProvider>
  );
};
