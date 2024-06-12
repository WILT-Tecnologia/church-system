import themeStyledComponent from "@/styles/themeStyledComponent";

type Theme = typeof themeStyledComponent;

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
