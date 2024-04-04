import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  ${({ theme }) => css`
    border: 1rem solid ${theme.colors.secondary};
    border-top: 1rem solid ${theme.colors.primary};
    border-radius: 30rem;
    width: 10rem;
    height: 10rem;
    animation: spin 0.3s linear infinite;
    margin: 5rem auto;
  `}

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
