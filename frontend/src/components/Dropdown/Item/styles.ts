import { darken } from "polished";
import styled, { css } from "styled-components";

import { ItemProps } from ".";

type ItemPropsPick = {
  dark?: boolean;
} & Pick<ItemProps, "color" | "size">;

export const Wrapper = styled.span<ItemPropsPick>`
  ${({ theme, color, size, dark }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-size: ${theme.fonts.sizes[size]};
    color: ${dark ? darken(0.1, theme.colors[color]) : theme.colors[color]};
    transition: ${theme.transitions.fast};
  `}
`;
