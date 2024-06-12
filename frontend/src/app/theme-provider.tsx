"use client";

import FetchPrimaryColor from "@/requests/queries/FetchPrimaryColor";
import GlobalStyles from "@/styles/global";
import theme from "@/styles/theme";
import ThemeStyledComponent from "@/styles/themeStyledComponent";
import { ThemeProvider } from "@mui/material";
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
  const primaryColor: string | any = FetchPrimaryColor();

  const customTheme: CustomTheme = {
    ...ThemeStyledComponent,
    colors: {
      ...ThemeStyledComponent.colors,
      primary: primaryColor,
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <ThemeProviderStyledComponent theme={customTheme}>
        <GlobalStyles />
        {children}
      </ThemeProviderStyledComponent>
    </ThemeProvider>
  );
};

export default ThemeProviderPage;
