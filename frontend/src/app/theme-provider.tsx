"use client";

import GlobalStyles from "@/styles/global";
import theme from "@/styles/theme";
import FetchPrimaryColor from "@/utils/FetchPrimaryColor";
import { DefaultTheme, ThemeProvider } from "styled-components";

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
    ...theme,
    colors: {
      ...theme.colors,
      primary: primaryColor,
    },
  };

  return (
    <ThemeProvider theme={customTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderPage;
