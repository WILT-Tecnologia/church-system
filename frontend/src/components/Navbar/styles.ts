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

export const LogoLink = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    font-family: ${theme.fonts.family.primary};
    font-size: ${theme.fonts.sizes.medium};
    height: 100%;

    > span {
      font-weight: ${theme.fonts.weight.normal};
      color: ${theme.colors.black};
      margin-right: ${theme.spacings.xxsmall};
    }
  `}
`;

export const Logo = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    /* transform: scale(0.9);
    transition: ${theme.transitions.fast}; */

    /* &:hover {
      transform: scale(1);
    } */

    ${media.lessThan("medium")`
      max-width: 16.5rem;
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
