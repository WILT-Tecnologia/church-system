import { darken } from "polished";
import styled, { DefaultTheme, css } from "styled-components";

import { FabProps } from ".";

export type WrapperProps = {
  hasIcon: boolean;
} & Pick<FabProps, "size" | "color" | "labelColor" | "variant">;

const FabModifiers = {
  small: (theme: DefaultTheme) => css`
    height: 3rem;
    padding: 1rem;
  `,
  medium: (theme: DefaultTheme) => css`
    height: 4rem;
    padding: 1.2rem;
  `,
  large: (theme: DefaultTheme) => css`
    height: 5rem;
    padding: 1.4rem;
  `,
  withIcon: (theme: DefaultTheme) => css`
    svg {
      width: 2.5rem;
      stroke-width: 2;

      & + span {
        margin-left: ${theme.spacings.xxsmall};
      }
    }
  `,
  disabled: () => css`
    color: #9e9e9e;
    background-color: #a9a9a9a9;

    &:hover {
      background-color: ${darken(0.15, "#e9e9e9e9")};
    }

    &:disabled {
      cursor: not-allowed;
      filter: saturate(30%);
    }
  `,
  circular: (theme: DefaultTheme) => css`
    height: 5rem;
  `,
  extended: (theme: DefaultTheme) => css`
    height: 5rem;
    padding: ${theme.spacings.medium};
  `,
};

export const Wrapper = styled.button<WrapperProps>`
  ${({ theme, color, variant, size, disabled, hasIcon, labelColor }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: auto;
    white-space: nowrap;
    border: none;
    border-radius: 30rem;
    color: ${theme.colors[labelColor]};
    background-color: ${theme.colors[color]};
    font-family: ${theme.fonts.family.primary};
    font-style: ${theme.fonts.style.normal};
    font-weight: ${theme.fonts.weight.bold};
    padding: 1rem;
    letter-spacing: 0.2rem;
    line-height: 1.6rem;
    text-decoration: none;
    text-transform: uppercase;
    text-align: center;
    outline: none;
    cursor: pointer;
    box-shadow: ${color === "transparent" ? "none" : theme.shadows.default};
    transition: ${theme.transitions.fast};

    &:hover {
      transition: ${theme.transitions.hover};
      box-shadow: ${color === "transparent" ? "none" : theme.shadows.hover};
      background-color: ${darken(0.15, theme.colors[color])};
    }

    ${!!variant && FabModifiers[variant](theme)}
    ${!!size && FabModifiers[size](theme)}
    ${!!hasIcon && FabModifiers.withIcon(theme)}
    ${disabled && FabModifiers.disabled()}
  `}
`;
