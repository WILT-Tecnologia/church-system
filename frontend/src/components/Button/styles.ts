import { darken, setLightness } from "polished";
import styled, { DefaultTheme, css } from "styled-components";
import media from "styled-media-query";

import { ButtonProps } from ".";

export type WrapperProps = {
  hasIcon: boolean;
} & Pick<
  ButtonProps,
  "size" | "fullWidth" | "color" | "labelColor" | "variant"
>;

const buttonModifications = {
  small: (theme: DefaultTheme) => css`
    height: 3rem;
    font-size: ${theme.fonts.sizes.small};
    padding: ${theme.spacings.xxsmall};
  `,
  medium: (theme: DefaultTheme) => css`
    height: 4rem;
    font-size: ${theme.fonts.sizes.small};
    padding: ${theme.spacings.xsmall};
  `,
  large: (theme: DefaultTheme) => css`
    height: 5rem;
    font-size: ${theme.fonts.sizes.small};
    padding: ${theme.spacings.small};
  `,
  fullWidth: () => css`
    width: 100%;
  `,
  withIcon: (theme: DefaultTheme) => css`
    svg {
      width: 2rem;
      stroke-width: 2;

      & + span {
        margin-left: ${theme.spacings.xxsmall};
      }
    }
  `,
  disabled: () => css`
    &:disabled {
      pointer-events: none;
      cursor: not-allowed;
      filter: saturate(30%);
    }
  `,
  contained: (theme: DefaultTheme) => css``,
  outlined: (theme: DefaultTheme) => css``,
  text: (theme: DefaultTheme) => css``,
};

export const Wrapper = styled.button<WrapperProps>`
  ${({
    theme,
    color,
    labelColor,
    size,
    fullWidth,
    hasIcon,
    disabled,
    variant,
  }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${variant === "contained"
      ? theme.colors[color]
      : variant === "outlined"
        ? theme.colors.transparent
        : theme.colors.transparent};
    color: ${variant === "contained"
      ? theme.colors.white
      : variant === "outlined"
        ? theme.colors[labelColor]
        : theme.colors[labelColor]};
    width: auto;
    white-space: nowrap;
    overflow: hidden;
    border: ${variant === "outlined"
      ? "0.15rem solid" + theme.colors[color]
      : "0"};
    border-radius: 0.4rem;
    font-family: ${theme.fonts.family.primary};
    font-style: ${theme.fonts.style.normal};
    font-weight: ${variant === "contained"
      ? theme.fonts.weight.medium
      : theme.fonts.weight.bold};
    letter-spacing: 0.25rem;
    line-height: 1.6rem;
    text-decoration: none;
    text-align: center;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: ${variant === "contained" || variant === "outlined"
      ? theme.shadows.default
      : theme.shadows.none};
    transition: ${theme.transitions.fast};

    &:hover {
      transition: ${theme.transitions.hover};
      box-shadow: ${variant === "text"
        ? theme.shadows.none
        : theme.shadows.hover};
      background-color: ${variant === "contained"
        ? darken(0.15, theme.colors[color])
        : variant === "outlined"
          ? setLightness(0.7, theme.colors[color])
          : setLightness(0.7, theme.colors[color])};
      color: ${variant === "contained"
        ? darken(0.1, theme.colors.white)
        : variant === "outlined"
          ? darken(0.1, theme.colors[labelColor])
          : darken(0.1, theme.colors[labelColor])};
    }

    ${media.lessThan("medium")`width: 100%`}

    ${!!variant && buttonModifications[variant](theme)};
    ${!!fullWidth && buttonModifications.fullWidth()};
    ${!!size && buttonModifications[size](theme)};
    ${!!hasIcon && buttonModifications.withIcon(theme)};
    ${disabled && buttonModifications.disabled()};
  `}
`;
