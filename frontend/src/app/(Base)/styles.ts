import styled, { css } from "styled-components";
import media from "styled-media-query";

export const Wrapper = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-areas:
      "sidebar header"
      "sidebar main-content";
    grid-template-columns: auto 1fr;
    grid-template-rows: 8rem 1fr;
    grid-row-gap: 0.2rem;
    width: 100%;
    height: 100dvh;
    background: ${theme.colors.white};

    ${media.lessThan("medium")`
      grid-template-columns: 100% 1fr;
      grid-template-areas:
      "header"
      "main-content";
    `}
  `}
`;

export const NavbarWrapper = styled.div`
  grid-area: header;
  width: 100%;
`;

export const SidebarWrapper = styled.div`
  grid-area: sidebar;
  width: 100%;
  height: 100%;
`;

export const Content = styled.section`
  ${({ theme }) => css`
    grid-area: main-content;
    padding: 1.6rem;
    overflow-y: auto;
  `}
`;
