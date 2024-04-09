"use client";

import "@/styles/global.css";
import theme from "@/styles/theme";
import { ThemeProvider } from "styled-components";

type ThemeProviderPageProps = {
  children: React.ReactNode;
};

const ThemeProviderPage = ({ children }: ThemeProviderPageProps) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ThemeProviderPage;
