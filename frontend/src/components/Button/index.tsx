import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  ReactNode,
  forwardRef,
} from "react";
import { DefaultTheme } from "styled-components";
import * as S from "./styles";

type ButtonTypes =
  | AnchorHTMLAttributes<HTMLAnchorElement>
  | ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = {
  children: string | ReactNode;
  size?: "small" | "medium" | "large";
  color: keyof DefaultTheme["colors"];
  labelColor: keyof DefaultTheme["colors"];
  disabled?: boolean;
  icon?: string | ReactNode;
  fullWidth?: boolean;
  variant: "contained" | "outlined" | "text";
  hasIcon?: boolean;
  as?: ElementType;
} & ButtonTypes;

const Button: React.ForwardRefRenderFunction<HTMLButtonElement, ButtonProps> = (
  {
    children,
    hasIcon,
    color,
    labelColor,
    disabled = false,
    fullWidth = false,
    icon,
    size = "medium",
    variant,
    as,
    ...props
  },
  ref
) => (
  <S.Wrapper
    color={color}
    labelColor={labelColor}
    size={size}
    disabled={disabled}
    fullWidth={fullWidth}
    variant={variant}
    ref={ref}
    hasIcon={!!icon}
    as={as}
    {...props}
  >
    {!!icon && icon}
    {!!children && <span>{children}</span>}
  </S.Wrapper>
);

export default forwardRef(Button);
