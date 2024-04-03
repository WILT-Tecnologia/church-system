import { DefaultTheme } from "styled-components";

import * as S from "./styles";

export type ListItemProps = {
  children: string | React.ReactNode;
  color: keyof DefaultTheme["colors"];
};

const ListItem = ({ children, color }: ListItemProps) => {
  return <S.Wrapper color={color}>{children}</S.Wrapper>;
};

export default ListItem;
