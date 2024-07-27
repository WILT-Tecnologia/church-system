import { Box } from "@mui/material";
import styled from "styled-components";
import media from "styled-media-query";

export const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  width: 100%;
`;

export const Inputs = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin: 1rem 0;

  ${media.lessThan("medium")`
    flex-direction: column;
  `}
`;

export const Footer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${media.lessThan("medium")`
    flex-direction: column;
  `}
`;

export const CTA = styled(Box)`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem 0;

  ${media.lessThan("medium")`
    width: 100%;
    flex-direction: column-reverse;
  `}
`;
