import styled, { DefaultTheme, css } from "styled-components";

import { InputAs } from ".";

type WrapperProps = {
  inputAs: InputAs;
  disabled: boolean;
  size: "large" | "medium" | "small";
};

const wrapperInputModifiers = {
  large: () => css`
    height: 6rem;
  `,
  medium: () => css`
    height: 4rem;
  `,
  small: () => css`
    height: 3rem;
  `,
};

const wrapperTextAreaModifiers = {
  large: () => css`
    max-height: 40rem;
  `,
  medium: () => css`
    max-height: 30rem;
  `,
  small: () => css`
    max-height: 20rem;
  `,
};

export const Wrapper = styled.div<WrapperProps>`
  ${({ theme, inputAs, size, disabled }) => css`
    position: relative;
    line-height: 1.2rem;
    width: 100%;

    ${disabled &&
    css`
      * {
        pointer-events: none !important;
      }
    `}

    ${inputAs === "textarea"
      ? css`
          ${wrapperTextAreaModifiers[size]}
        `
      : css`
          ${wrapperInputModifiers[size]}
        `}
  `}
`;

type ContainerProps = {
  hasClickableIcon: boolean;
};

export const Container = styled.div<ContainerProps>`
  ${({ hasClickableIcon }) => css`
    height: 100%;

    ${hasClickableIcon &&
    css`
      display: grid;
      grid-template-columns: 1fr 4rem;
    `}
  `}
`;

const labelModifiers = {
  inFocusOrValue: (theme: DefaultTheme, disabled: boolean) => css`
    box-shadow: inset 0rem 0rem 0rem 0.2rem
      ${disabled ? theme.colors.gray : theme.colors.primary};

    span {
      top: 0;
      transform: translateY(-50%);
      left: 0.8rem;
      font-size: ${theme.fonts.sizes.xsmall};
      color: ${disabled ? theme.colors.gray : theme.colors.primary};
    }
  `,
  disabled: () => css`
    background: rgba(151, 174, 177, 0.2);
  `,
  input: () => css`
    top: 50%;
    transform: translateY(-50%);
  `,
  textarea: () => css`
    top: 0.5rem;
    transform: translateY(50%);
  `,
};

type LabelProps = {
  hasValue: boolean;
  inputAs: InputAs;
  isDisabled?: boolean;
};

export const Label = styled.label<LabelProps>`
  ${({ theme, hasValue, inputAs, isDisabled }) => css`
    display: block;
    cursor: text;
    width: 100%;
    height: 100%;
    max-height: inherit;
    transition: all 0.3s ease;
    border-radius: 0.5rem;
    box-shadow: inset 0rem 0rem 0rem 0.1rem ${theme.colors.gray};

    span {
      padding: 0.5rem 1rem;
      position: absolute;
      left: 1rem;
      background: ${theme.colors.white};
      font-size: ${theme.fonts.sizes.small};
      transition: all 0.15s ease-out;
      color: ${theme.colors.gray};
      border-radius: 10rem;

      ${labelModifiers[inputAs]}
    }

    ${hasValue && labelModifiers.inFocusOrValue(theme, !!isDisabled)}
    ${!!isDisabled && labelModifiers.disabled}

    &:hover {
      box-shadow: inset 0rem 0rem 0rem 0.1rem ${theme.colors.primary};
    }

    &:focus-within {
      ${labelModifiers.inFocusOrValue(theme, !!isDisabled)}
    }
  `}
`;

const inputContainerModifiers = {
  large: (hasIcon: boolean) => css`
    grid-template-columns: ${hasIcon ? "1fr 4rem" : "1fr"};
    > svg {
      width: 2.4rem;
    }
  `,
  medium: (hasIcon: boolean) => css`
    grid-template-columns: ${hasIcon ? "1fr 2rem" : "1fr"};
    > svg {
      width: 1.6rem;
    }
  `,
  small: (hasIcon: boolean) => css`
    grid-template-columns: ${hasIcon ? "1fr 1rem" : "1fr"};
    > svg {
      width: 1.2rem;
    }
  `,
};

type InputContainerProps = {
  hasIcon: boolean;
  size: "large" | "medium" | "small";
};

export const InputContainer = styled.div<InputContainerProps>`
  ${({ size, hasIcon }) => css`
    display: grid;
    height: 100%;
    align-items: center;

    > svg {
      justify-self: center;
    }

    ${inputContainerModifiers[size](hasIcon)}
  `}
`;

const TextArea = (theme: DefaultTheme) => css`
  padding: ${theme.spacings.xxsmall} ${theme.spacings.xsmall};
`;

const inputModifiers = {
  large: (theme: DefaultTheme) => css`
    padding: 0 ${theme.spacings.xsmall};
    font-size: ${theme.fonts.sizes.small};
  `,
  medium: (theme: DefaultTheme) => css`
    padding: 0 ${theme.spacings.xxsmall};
    font-size: ${theme.fonts.sizes.small};
  `,
  small: (theme: DefaultTheme) => css`
    padding: 0 calc(${theme.spacings.xsmall} / 2);
    font-size: ${theme.fonts.sizes.xsmall};
  `,
  disabled: (theme: DefaultTheme) => css`
    color: ${theme.colors.gray};
  `,
};

type InputProps = {
  inputSize: "large" | "medium" | "small";
};

export const Input = styled.input<InputProps>`
  ${({ theme, inputSize, disabled }) => css`
    &:not(input) {
      ${TextArea(theme)}
    }
    background: ${theme.colors.white};
    border: 0.1rem solid ${theme.colors.primary};
    outline: 0;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    height: 100%;
    max-height: inherit;
    color: ${theme.colors.black};
    font-family: ${theme.fonts.family.primary};

    &:focus {
      border: 0.2rem solid ${theme.colors.primary};
    }

    ${inputModifiers[inputSize](theme)}
    ${!!disabled && inputModifiers.disabled(theme)}
  `}
`;

export const IconButton = styled.button.attrs({ type: "button" })`
  ${({ theme }) => css`
    cursor: pointer;
    max-width: 2rem;
    max-height: 100%;
    background-color: ${theme.colors.transparent};
    color: ${theme.colors.primary};
    border: none;
    outline: 0;
    margin: 0.2rem;
    margin-left: 0.5rem;
    stroke-width: 2;
  `}
`;

type AsteriskProps = {
  required: boolean;
};

export const Asterisk = styled.label<AsteriskProps>`
  ${({ theme, required }) => css`
    color: ${required ? theme.colors.red : "inherit"};
  `}
`;
