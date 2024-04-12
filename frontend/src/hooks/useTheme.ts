import theme from "@/styles/theme";
import { createContext, useContext } from "react";

const ThemeContext = createContext(theme);

export function useTheme() {
  return useContext(ThemeContext);
}
