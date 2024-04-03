import styled, { css, DefaultTheme } from "styled-components";
import media from "styled-media-query";

import { TypographyProps } from ".";

export type TypographyPropsPicker = Pick<
  TypographyProps,
  "align" | "color" | "size" | "transform" | "bold" | "mobile"
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

export const Wrapper = styled.span<TypographyPropsPicker>`
  ${({ theme, color, size, align, transform, bold, mobile }) => css`
    color: ${theme.colors[color]};
    transition: ${theme.transitions.fast};
    font-size: ${theme.fonts.sizes[size]};

    ${!!mobile && typographyModifiers.mobile(theme)};
    ${!!bold && typographyModifiers.bold(theme)};
    ${!!align && typographyModifiers[align]};
    ${!!transform && typographyModifiers[transform]};
  `}
`;
