import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import media from "styled-media-query";

export const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  padding: 3rem;

  ${media.lessThan("medium")`
    padding: 1rem;
  `}
`;

export const Identity = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ColorPicker = styled(Box)`
  width: 2.4rem;
  height: 2.4rem;
`;

export const CTA = styled(Box)`
  display: flex;
  gap: 1rem;
  width: 10dvw;
  justify-content: flex-start;
  align-items: center;

  ${media.lessThan("medium")`
    width: 100%; 
    flex-direction: column;
  `}
`;

export const LastAlteration = styled(Typography)`
  color: gray;
`;

export const ContainerCTAConclusive = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;

  ${media.lessThan("medium")`
    max-width: 100%;
    align-items: normal;
    flex-direction: column;
  `}
`;

export const Buttons = styled(Box)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 30dvw;
  max-width: 30dvw;
  gap: 1rem;

  ${media.lessThan("medium")`
    width: 100%; 
    max-width: 100%;
    flex-direction: column-reverse;
  `}
`;
