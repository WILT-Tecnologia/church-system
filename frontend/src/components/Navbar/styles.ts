import styled, { css } from "styled-components";
import media from "styled-media-query";

import { NavbarProps } from ".";

export const Wrapper = styled.nav<NavbarProps>`
  ${({ theme, color }) => css`
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 8rem;
    width: 100%;
    max-width: 100%;
    color: ${theme.colors.white};
    background-color: ${theme.colors.black};
    padding: ${theme.spacings.large};
    transition: ${theme.transitions.fast};
    box-shadow: ${theme.shadows.navbar};
  `}
`;

export const WrapperHamburguerAndProfileAndPermission = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
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
