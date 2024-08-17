import { createGlobalStyle, css } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    outline: none;

    &::before, &::after {
      box-sizing: inherit;
    }
  }

  html {
    scroll-behavior: smooth;
  }

  ::selection {
    ${({ theme }) => css`
      color: ${theme.colors.white};
      background-color: ${theme.colors.primary};
    `}
  }

  body {
    ${({ theme }) => css`
      background-color: ${theme.colors.white};
      font-size: ${theme.fonts.sizes.xxsmall};
      font-family: ${theme.fonts.family.primary};
      color: ${theme.colors.black};
      outline: none;
    `}
  }

  button, a {
    cursor: pointer;
    text-decoration: none !important;
  }
`;
export default GlobalStyles;
