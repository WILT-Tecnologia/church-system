import theme from "@/styles/theme";

import { darken, setLightness } from "polished";
import styled, { DefaultTheme, css } from "styled-components";

import { AlertProps } from ".";

type WrapperProps = {
  hasIcon: boolean;
} & Pick<
  AlertProps,
  | "action"
  | "closeIcon"
  | "color"
  | "dark"
  | "description"
  | "icon"
  | "backgroundColor"
  | "iconAnimation"
>;

type alertModifiersProps = {
  color: keyof typeof theme.colors;
};

const alertModifiers = {
  withIcon: (theme: DefaultTheme) => css`
    svg {
      width: 2rem;
      stroke-width: 2;

      & + span {
        margin-left: ${theme.spacings.xxsmall};
      }
    }
  `,
};

export const Wrapper = styled.div<WrapperProps>`
  ${({ theme, color, backgroundColor, dark, hasIcon }) => css`
    display: flex;
    color: ${dark ? darken(0.2, theme.colors[color]) : theme.colors[color]};
    background-color: ${dark
      ? darken(0.2, theme.colors[backgroundColor])
      : theme.colors[backgroundColor]};
    align-items: center;
    padding: ${theme.spacings.xsmall};
    transition: ${theme.transitions.fast};
    border-radius: 0.6rem;

    ${!!hasIcon && alertModifiers.withIcon(theme)};
  `}
`;

export const Icon = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: start;
    margin-right: ${theme.spacings.xsmall};
  `}
`;

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const TitleDescription = styled.div`
  display: flex;
  flex-direction: column;
`;

type TitleProps = {
  color?: keyof typeof theme.colors;
  bold?: boolean;
};

export const Title = styled.span<TitleProps>`
  ${({ theme, color = "white", bold }) => css`
    color: ${theme.colors[color]};
    font-weight: ${bold ? theme.fonts.weight.bold : theme.fonts.weight.normal};
    padding: ${theme.spacings.xxsmall};
  `}
`;

export const Description = styled.span`
  ${({ theme }) => css`
    padding: ${theme.spacings.xxsmall};
  `}
`;
export const ActionButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacings.xxsmall};
  `}
`;

type ActionButtonProps = {
  color: keyof typeof theme.colors;
  background: keyof typeof theme.colors;
};

export const ActionButton = styled.button<ActionButtonProps>`
  ${({ theme, color }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.transparent};
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    border: 0;
    outline: 0;
    stroke-width: 2;
    color: ${theme.colors[color]};
    padding: 0.4rem;
    transition: ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.white};
      background-color: ${setLightness(0.5, theme.colors.red)};
    }
  `}
`;
