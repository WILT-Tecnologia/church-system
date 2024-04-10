import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  ${({ theme }) => css`
    border: 2rem solid ${theme.colors.secondary};
    border-top: 2rem solid ${theme.colors.primary};
    border-radius: 30rem;
    margin: 0 auto;
    width: 30rem;
    height: 30rem;
    max-height: 100vh;
    animation: spin 0.8s alternate-reverse infinite;
    display: flex;
    align-items: center;
    justify-content: center;
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

export const WrapperReverse = styled.div`
  ${({ theme }) => css`
    border: 2rem solid ${theme.colors.secondary};
    border-top: 2rem solid ${theme.colors.primary};
    border-radius: 30rem;
    gap: 10rem;
    margin: 0 auto;
    width: 10rem;
    height: 10rem;
    max-height: 100vh;
    animation: spin 0.5s alternate-reverse infinite;
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
