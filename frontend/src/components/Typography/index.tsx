import { DefaultTheme } from "styled-components";

import * as S from "./styles";

export type TypographyProps = {
  children: string | React.ReactNode;
  color: keyof DefaultTheme["colors"];
  size: keyof DefaultTheme["fonts"]["sizes"];
  align?: "center" | "inherit" | "justify" | "left" | "right";
  transform?: "capitalize" | "lowercase" | "uppercase" | "none";
  bold?: boolean;
  mobile?: boolean;
  ocult?: boolean;
};

const Typography = ({
  children,
  align = "left",
  color = "primary",
  size = "small",
  transform = "none",
  bold,
  ocult,
  mobile,
}: TypographyProps) => {
  return (
    <S.Wrapper
      align={align}
      color={color}
      size={size}
      transform={transform}
      bold={bold}
      ocult={ocult}
      mobile={mobile}
    >
      {children}
    </S.Wrapper>
  );
};

export default Typography;
