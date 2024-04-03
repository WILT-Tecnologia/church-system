"use client";

import GlobalStyles from "@/styles/global";
import theme from "@/styles/theme";
import { ThemeProvider } from "styled-components";

type ThemeProviderPageProps = {
  children: React.ReactNode;
};

export default function ThemeProviderPage({
  children,
}: ThemeProviderPageProps) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </>
  );
}
