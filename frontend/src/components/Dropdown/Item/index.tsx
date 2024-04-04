import { DefaultTheme } from "styled-components";

import Icon from "../../Icon";

import * as S from "./styles";

export type ItemProps = {
  children: string | React.ReactNode;
  color: keyof DefaultTheme["colors"];
  size: keyof DefaultTheme["fonts"]["sizes"];
  dark?: boolean;
  icon?: React.ReactNode;
};

const Item = ({ children, color, dark, size, icon }: ItemProps) => {
  return (
    <S.Wrapper size={size} color={color} dark={dark}>
      {!!icon && (
        <Icon color={color} size={size}>
          {icon}
        </Icon>
      )}

      {children}
    </S.Wrapper>
  );
};

export default Item;
