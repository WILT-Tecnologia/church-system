import { Box } from "@mui/material";
import styled, { css } from "styled-components";
import media from "styled-media-query";
import { ContainerButtonProps } from ".";

export const Wrapper = styled(Box)<ContainerButtonProps>`
  ${({ isFullwidth }) => css`
    display: flex;
    justify-content: flex-start;
    margin-bottom: 1rem;

    ${media.lessThan("medium")`
      flex-direction: column;
      width: ${isFullwidth ? "100%" : "fit-content"};
    `}
  `}
`;
