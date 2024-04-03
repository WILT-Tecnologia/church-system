import { ChevronDown } from "@styled-icons/feather";
import { darken } from "polished";
import styled, { DefaultTheme, css } from "styled-components";

import { HeaderProps } from ".";

type HeaderPropsPick = Pick<
  HeaderProps,
  "color" | "dark" | "disabled" | "size" | "isOpen"
>;

const HeaderModifiers = {
  disabled: (theme: DefaultTheme) => css`
    color: ${theme.colors.gray} !important;
    cursor: not-allowed;
    box-shadow: none;
    pointer-events: none;
  `,
};

export const Wrapper = styled.div<HeaderPropsPick>`
  ${({ theme, disabled }) => css`
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;

    ${!!disabled && HeaderModifiers.disabled(theme)}
  `}
`;

export const ImageWrapper = styled.div`
  margin: 0 0.5rem;
`;

export const Label = styled.span<HeaderPropsPick>`
  ${({ theme, color, dark, size, disabled }) => css`
    transition: ${theme.transitions.fast};
    font-size: ${theme.fonts.sizes[size]};
    color: ${dark ? darken(0.1, theme.colors[color]) : theme.colors[color]};

    ${!!disabled && HeaderModifiers.disabled(theme)};
  `}
`;

export const ArrowIcon = styled(ChevronDown)<HeaderPropsPick>`
  ${({ theme, isOpen, color, dark, size, disabled }) => css`
    width: ${theme.fonts.sizes[size]};
    stroke-width: 1.5;
    transition: transform 0.3s ease;
    color: ${dark ? darken(0.1, theme.colors[color]) : theme.colors[color]};

    ${isOpen &&
    css`
      transform: rotateZ(180deg);
    `}

    ${!!disabled && HeaderModifiers.disabled(theme)};
  `}
`;
