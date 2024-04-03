"use client";

import styled from "styled-components";
import { generateMedia } from "styled-media-query";

const customMedia = generateMedia({
  small: "576px",
  medium: "768px",
  large: "992px",
  huge: "1200px",
});

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
`;

export default PageContainer;
