import styled, { css } from "styled-components";

import { HamburguerProps } from ".";

type HamburguerStyleProps = Pick<HamburguerProps, "icon" | "position">;

export const Wrapper = styled.div<HamburguerStyleProps>`
  ${({ theme, position = "fixed" }) => css`
    position: ${theme.position[position]};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    border: 0.1rem solid ${theme.colors.primary};
    border-radius: 1.5rem;
    color: ${theme.colors.primary};
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    margin: 2rem auto;
    outline: none;
    transition: all 0.3s ease-in-out;

    :active {
      transition: all 0.3s ease-in-out;
    }
  `}
`;

export const Icon = styled.svg<HamburguerStyleProps>`
  ${({ theme }) => css`
    width: 2rem;
    height: 2rem;
    color: ${theme.colors.primary};
  `}
`;
