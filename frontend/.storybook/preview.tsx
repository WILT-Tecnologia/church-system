import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider } from "styled-components";

import GlobalStyles from "../src/styles/global";
import theme from "../src/styles/theme";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "black",
      values: [
        {
          name: "white",
          value: theme.colors.white,
        },
        {
          name: "black",
          value: theme.colors.black,
        },
      ],
    },
  },
};

export const decorators = [
  (Story: any) => (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Story />
    </ThemeProvider>
  ),
];

export default preview;
