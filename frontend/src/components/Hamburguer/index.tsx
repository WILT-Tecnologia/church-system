import { ReactElement } from "react";
import { DefaultTheme } from "styled-components";

import * as S from "./styles";

export type HamburguerProps = {
  onClick?: () => void;
  icon?: ReactElement;
  position?: keyof DefaultTheme["position"];
};

const Hamburguer = ({
  onClick,
  icon,
  position = "fixed",
  ...props
}: HamburguerProps) => {
  return (
    <S.Wrapper position={position} onClick={onClick} {...props}>
      <S.Icon>{icon}</S.Icon>
    </S.Wrapper>
  );
};

export default Hamburguer;
