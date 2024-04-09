import { ReactNode } from "react";
import { DefaultTheme } from "styled-components";

import * as S from "./styles";

export type IconProps = {
  children?: ReactNode | JSX.Element;
  color: keyof DefaultTheme["colors"];
  heigth: number | string;
  width: number | string;
};

const Icon = ({ children, color, heigth, width }: IconProps) => {
  return (
    <S.Wrapper color={color} heigth={heigth} width={width}>
      {children}
    </S.Wrapper>
  );
};

export default Icon;
