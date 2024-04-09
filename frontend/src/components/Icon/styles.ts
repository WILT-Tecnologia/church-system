import styled, { css } from "styled-components";

import { IconProps } from ".";

export const Wrapper = styled.div<IconProps>`
  ${({ theme, color, heigth, width }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors[color]};
    stroke-width: 1.5;
    transition: ${theme.transitions.fast};
    height: ${heigth}rem;
    width: ${width}rem;
  `}
`;
