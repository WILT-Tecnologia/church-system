"use client";

import Navbar from "@/components/Navbar";
import useFetchPrimaryColor from "@/requests/queries/FetchPrimaryColor";
import GlobalStyles from "@/styles/global";
import themeStyledComponent from "@/styles/theme-styled-component";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import {
  hydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
} from "styled-components";

import "../styles/global.css";

type ThemeProviderPageProps = {
  children: React.ReactNode;
};

type CustomTheme = {
  colors: {
    primary: string;
  };
} & DefaultTheme;

const ThemeProviderPage = ({ children }: ThemeProviderPageProps) => {
  const pathname = usePathname();
  const queryClient = new QueryClient();
  const isAdminRoute = pathname.startsWith("/admin");
  const primaryColor = useFetchPrimaryColor();

  const customTheme: CustomTheme = {
    ...themeStyledComponent,
    colors: {
      ...themeStyledComponent.colors,
      primary: primaryColor,
    },
  };

  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: "#0DBF87",
      },
      error: {
        main: "#EE4C4C",
      },
      warning: {
        main: "#F4DA85",
      },
      common: {
        black: "#13110C",
        white: "#F8FAFA",
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={hydrate}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <StyledComponentsThemeProvider theme={customTheme}>
            {isAdminRoute && <Navbar />}
            {children}
            <GlobalStyles />
          </StyledComponentsThemeProvider>
        </ThemeProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default ThemeProviderPage;
