import { Box } from "@mui/material";
import styled from "styled-components";
import media from "styled-media-query";

export const Container = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 5rem;
  max-width: 35dvw;
  flex: 1;

  ${media.lessThan("medium")`
    flex-direction: column;
    max-width: 100%;
    gap: 2rem;
  `}
`;
