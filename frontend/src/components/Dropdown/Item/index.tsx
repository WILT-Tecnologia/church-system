import Icon from "@/components/Icon";

import { DefaultTheme } from "styled-components";

import * as S from "./styles";

export type ItemProps = {
  children: string | React.ReactNode;
  color: keyof DefaultTheme["colors"];
  size: keyof DefaultTheme["fonts"]["sizes"];
  icon?: React.ReactNode | React.ReactElement;
};

const Item = ({ children, color, size, icon }: ItemProps) => {
  return (
    <S.Wrapper size={size} color={color} dark>
      {!!icon && (
        <Icon color="primary" heigth={1.2} width={1.2}>
          {icon}
        </Icon>
      )}
      {children}
    </S.Wrapper>
  );
};

export default Item;
