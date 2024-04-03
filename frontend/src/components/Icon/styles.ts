import styled, { css } from "styled-components";

import { IconProps } from ".";

const iconModifiers = {
  xxsmall: () => css`
    width: 1rem;
    height: 1rem;
  `,
  xsmall: () => css`
    width: 1.2rem;
    height: 1.2rem;
  `,
  small: () => css`
    width: 1.6rem;
    height: 1.6rem;
  `,
  medium: () => css`
    width: 2.4rem;
    height: 2.4rem;
  `,
  large: () => css`
    width: 3.2rem;
    height: 3.2rem;
  `,
  xlarge: () => css`
    width: 4rem;
    height: 4rem;
  `,
  xxlarge: () => css`
    width: 4.8rem;
    height: 4.8rem;
  `,
  huge: () => css`
    width: 5.6rem;
    height: 5.6rem;
  `,
  xhuge: () => css`
    width: 6.4rem;
    height: 6.4rem;
  `,
};

export const Wrapper = styled.div<IconProps>`
  ${({ theme, color, size }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors[color]};
    stroke-width: 1.5;
    transition: ${theme.transitions.fast};

    ${size && iconModifiers[size]}
  `}
`;
