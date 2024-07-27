import { Box } from "@mui/material";
import styled, { css } from "styled-components";
import media from "styled-media-query";
import { ContainerTableProps } from ".";

export const Wrapper = styled(Box)<ContainerTableProps>`
  ${({ theme, isPadding }) => css`
    height: 100%;
    width: 100%;
    padding: ${isPadding ? "0rem 5rem 5rem" : "0rem"};

    ${media.lessThan("medium")`
      padding: 0 1rem 2rem;
    `}
  `}
`;
