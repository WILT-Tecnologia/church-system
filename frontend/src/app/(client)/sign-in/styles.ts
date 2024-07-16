import { Box } from "@mui/material";
import styled from "styled-components";
import media from "styled-media-query";

export const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: 100%;
  height: 100dvh;

  ${media.lessThan("medium")`
    padding: 1rem;
    justify-content: center;
    align-items: stretch;
    width: 100%;
  `}
`;

export const WrapperForm = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 30dvw;

  ${media.lessThan("medium")`
    width: 100%;
  `}
`;

export const CTA = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
`;
