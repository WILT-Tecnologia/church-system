import styled, { css, DefaultTheme } from "styled-components";
import media from "styled-media-query";

import { TypographyProps } from ".";

export type TypographyPropsPicker = Pick<
  TypographyProps,
  "align" | "color" | "size" | "transform" | "bold" | "mobile" | "ocult"
>;

const typographyModifiers = {
  mobile: (theme: DefaultTheme) => css`
    ${media.lessThan("medium")`
      font-size: ${theme.fonts.sizes.xsmall};
    `}
  `,
  bold: (theme: DefaultTheme) => css`
    font-weight: ${theme.fonts.weight.bold};
  `,
  capitalize: () => css`
    text-transform: capitalize;
  `,
  lowercase: () => css`
    text-transform: lowercase;
  `,
  uppercase: () => css`
    text-transform: uppercase;
  `,
  none: () => css`
    text-transform: none;
  `,
  center: () => css`
    text-align: center;
  `,
  inherit: () => css`
    text-align: inherit;
  `,
  justify: () => css`
    text-align: justify;
  `,
  left: () => css`
    text-align: left;
  `,
  right: () => css`
    text-align: right;
  `,
};

export const Wrapper = styled.p<TypographyPropsPicker>`
  ${({ theme, color, size, align, transform, bold, mobile, ocult }) => css`
    color: ${theme.colors[color]};
    transition: ${theme.transitions.fast};
    font-size: ${theme.fonts.sizes[size]};

    ${media.lessThan("medium")`
  ${
    ocult &&
    css`
      display: none;
    `
  }
    `}

    ${!!mobile && typographyModifiers.mobile(theme)};
    ${!!bold && typographyModifiers.bold(theme)};
    ${!!align && typographyModifiers[align]};
    ${!!transform && typographyModifiers[transform]};
  `}
`;
