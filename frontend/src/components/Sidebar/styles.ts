import { Box } from "@mui/material";
import Link from "next/link";
import styled, { css } from "styled-components";

export const Wrapper = styled(Box)`
  width: 15rem;
  background-color: #ffffff;
  height: 100dvh;
`;

export const Logo = styled(Link)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 5rem;
    max-height: 5rem;
    cursor: pointer;
    transform: scale(0.9);
    transition: ${theme.transitions.fast};

    &:hover {
      transform: scale(1);
    }
  `}
`;
