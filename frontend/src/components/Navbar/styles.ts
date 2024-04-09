import { darken } from "polished";
import styled, { css } from "styled-components";
import media from "styled-media-query";

import { NavbarProps } from ".";

const navbarModifiers = {
  absolute: () => css`
    position: absolute;
  `,
  fixed: () => css`
    position: fixed;
  `,
  relative: () => css`
    position: relative;
  `,
  static: () => css`
    position: static;
  `,
  sticky: () => css`
    position: sticky;
  `,
};

export const Wrapper = styled.nav<NavbarProps>`
  ${({ theme, color, position, enableColorOnDark, percentDark = 0.5 }) => css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 8rem;
    width: 100%;
    max-width: 100%;
    color: ${theme.colors.white};
    background-color: ${enableColorOnDark
      ? darken(percentDark, theme.colors[color])
      : theme.colors[color]};
    padding: ${theme.spacings.xsmall};
    transition: ${theme.transitions.fast};
    box-shadow: ${theme.shadows.navbar};

    ${!!position && navbarModifiers[position]};
  `}
`;

export const WrapperHamburguerAndProfileAndPermission = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

export const Hamburguer = styled.a`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    border: 0.2rem solid ${theme.colors.primary};
    border-radius: 30rem;
    padding: 0.5rem;
    cursor: pointer;
    height: 3rem;
    width: 3rem;
  `}
`;

export const ProfileAndPermission = styled.div`
  ${({ theme }) => css`
    display: flex;

    align-items: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;

    ${media.lessThan("medium")`
      flex-wrap: wrap;
    `}
  `}
`;

export const ProfileContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  align-items: center;
  gap: 2rem;
`;

export const Profile = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;
