import * as S from "./styles";

export type DividerProps = {
  light?: boolean;
};

const Divider = ({ light = false }: DividerProps) => {
  return <S.Wrapper light={light} />;
};

export default Divider;
