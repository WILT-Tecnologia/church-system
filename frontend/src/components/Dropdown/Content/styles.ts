import styled, { css } from "styled-components";

import { ContentProps } from ".";

export const Wrapper = styled.div<ContentProps>`
  ${({ theme, isOpen }) => css`
    position: absolute;
    background: ${theme.colors.white};
    width: auto;
    max-width: 100%;
    padding: 1rem;
    top: 100%;
    border-radius: 0.3rem;
    z-index: ${theme.layers.menu};
    transition: ${theme.transitions.fast};
    box-shadow: ${theme.shadows.notFocus};
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    visibility: visible;
    opacity: 1;
    transform: translateY(0);

    ${!isOpen &&
    css`
      visibility: hidden;
      opacity: 0;
      transform: translateY(50%);
    `}
    > ul {
      list-style: none;
    }
  `}
`;
