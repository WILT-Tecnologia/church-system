import styled, { css } from "styled-components";

import { DividerProps } from ".";

export const Wrapper = styled.div<DividerProps>`
  ${({ theme, light }) => css`
    height: 0.1rem;
    background-color: ${light ? theme.colors.white : theme.colors.gray};
    border-radius: 100rem;
    transition: ${theme.transitions.fast};
  `}
`;
