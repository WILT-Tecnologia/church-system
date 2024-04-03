import { ReactNode } from "react";
import { DefaultTheme } from "styled-components";

import * as S from "./styles";

export type IconProps = {
  children?: ReactNode | JSX.Element;
  color: keyof DefaultTheme["colors"];
  size: keyof DefaultTheme["fonts"]["sizes"];
};

const Icon = ({ children, color, size }: IconProps) => {
  return (
    <S.Wrapper color={color} size={size}>
      {children}
    </S.Wrapper>
  );
};

export default Icon;
