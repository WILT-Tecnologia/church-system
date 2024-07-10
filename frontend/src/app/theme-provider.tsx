"use client";

// import NextAuthSessionProvider from "@/providers/sessionProvider";
import FetchPrimaryColor from "@/requests/queries/FetchPrimaryColor";
import GlobalStyles from "@/styles/global";
import theme from "@/styles/theme";
import ThemeStyledComponent from "@/styles/themeStyledComponent";
import Base from "@/templates/Base";
import { ThemeProvider } from "@mui/material";
import {
  hydrate,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  DefaultTheme,
  ThemeProvider as ThemeProviderStyledComponent,
} from "styled-components";

type ThemeProviderPageProps = {
  children: React.ReactNode;
};

type CustomTheme = {
  colors: {
    primary: string;
  };
} & DefaultTheme;

const ThemeProviderPage = ({ children }: ThemeProviderPageProps) => {
  const queryClient = new QueryClient();
  const primaryColor: string | any = FetchPrimaryColor();

  const customTheme: CustomTheme = {
    ...ThemeStyledComponent,
    colors: {
      ...ThemeStyledComponent.colors,
      primary: primaryColor,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={hydrate}>
        <ThemeProvider theme={theme}>
          <ThemeProviderStyledComponent theme={customTheme}>
            <Base>{children}</Base>
            <GlobalStyles />
          </ThemeProviderStyledComponent>
        </ThemeProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default ThemeProviderPage;
