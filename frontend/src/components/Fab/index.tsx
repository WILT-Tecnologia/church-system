import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  ReactNode,
} from "react";
import { DefaultTheme } from "styled-components";

import * as S from "./styles";

type FabTypes =
  | AnchorHTMLAttributes<HTMLAnchorElement>
  | ButtonHTMLAttributes<HTMLButtonElement>;

export type FabProps = {
  children?: string | ReactNode;
  color: keyof DefaultTheme["colors"];
  hasIcon?: boolean;
  icon?: ReactNode;
  as?: ElementType;
  labelColor: keyof DefaultTheme["colors"];
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "circular" | "extended";
} & FabTypes;

const Fab = ({
  children,
  as,
  labelColor = "white",
  disabled = false,
  size = "large",
  color = "primary",
  hasIcon,
  icon,
  variant = "circular",
  ...props
}: FabProps) => {
  return (
    <S.Wrapper
      size={size}
      as={as}
      hasIcon={!!icon}
      color={color}
      labelColor={labelColor}
      disabled={disabled}
      variant={variant}
      {...props}
    >
      {!!icon && icon}
      {variant === "extended" && children}
    </S.Wrapper>
  );
};

export default Fab;
