import { setLightness } from "polished";
import styled, { css } from "styled-components";

import { ListItemProps } from ".";

export const Wrapper = styled.div<ListItemProps>`
  ${({ theme, color }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem;
    text-align: left;
    font-size: ${theme.fonts.sizes.xsmall};
    white-space: break-spaces;
    color: ${theme.colors[color]};
    list-style: none;
    transition: ${theme.transitions.fast};
    border-radius: 0.4rem;
    cursor: pointer;

    &:hover {
      background: ${setLightness(0.93, theme.colors[color])};
      border-radius: 0.4rem;
    }

    a {
      color: ${theme.colors[color]} !important;
      text-decoration: none;
    }
  `}
`;
