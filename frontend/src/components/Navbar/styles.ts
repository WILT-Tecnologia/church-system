import { AppBar, Box } from "@mui/material";
import styled, { css } from "styled-components";

export const Wrapper = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-content: stretch;
    width: 100%;
    height: 5rem;
  `}
`;

export const Header = styled(AppBar)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    padding: 1rem;
  `}
`;

export const Profile = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export const Menu = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;
