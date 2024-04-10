import Link from "next/link";
import { darken } from "polished";
import styled, { DefaultTheme, css } from "styled-components";
import media from "styled-media-query";

export const HamburguerWrapper = styled.div`
  padding-left: 25rem;
`;

export const SidebarWrapper = styled.div<{ isOpen: boolean }>`
  ${({ theme, isOpen }) => css`
    width: ${isOpen ? "30rem" : "0"};
    transition: width 0.3s ease-in-out;
    overflow: hidden;
    background: ${theme.colors.white};
    box-shadow: ${theme.shadows.default};
  `}
`;

export const Wrapper = styled.aside`
  ${({ theme }) => css`
    grid-area: sidebar;
    display: grid;
    grid-template-areas:
      "logo"
      "menu";
    grid-template-rows: 8rem 1fr;
    text-align: center;
    height: 100vh;
    box-shadow: ${theme.shadows.default};

    ${media.lessThan("medium")`
      display: none;
    `}
  `}
`;

export const Logo = styled(Link)`
  ${({ theme }) => css`
    grid-area: logo;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    transform: scale(0.9);
    transition: ${theme.transitions.fast};

    &:hover {
      transform: scale(1);
    }
  `}
`;

export const MenuItems = styled.ul`
  ${({ theme }) => css`
    grid-area: menu;
    padding: ${theme.spacings.small} ${theme.spacings.xxsmall};
    list-style-type: none;
  `}
`;

const menuItemModifiers = {
  active: (theme: DefaultTheme) => css`
    a {
      color: ${theme.colors.gray};
      background: ${theme.colors.white};
      border-left: 0.5rem solid ${theme.colors.primary};
      padding-left: ${theme.spacings.xxsmall};
      box-shadow:
        inset 0.15rem 0.1rem 0.1rem -0.05rem #ccdbdb,
        inset 0.1rem -0.1rem 0.15rem -0.05rem #ccdbdb;
    }
  `,
};

type MenuItemProps = {
  active?: boolean;
};
export const MenuItem = styled.li<MenuItemProps>`
  ${({ theme, active }) => css`
    height: 4.5rem;
    transition: background 0.2s ease-in-out;

    & + & {
      margin-top: 0.1rem;
    }

    a {
      display: flex;
      align-items: center;
      height: 100%;
      border-radius: 0.7rem;
      padding-left: ${theme.spacings.xsmall};
      text-decoration: none;
      color: ${darken(0.08, theme.colors.primary)};
      transition: background 0.2s ease-in-out;
    }

    ${!active &&
    css`
      &:hover a {
        background-color: ${darken(0.07, theme.colors.white)};
        border-radius: 0.7rem;
      }
    `}

    ${!!active && menuItemModifiers.active(theme)}
  `}
`;
