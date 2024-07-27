import * as S from "./styles";

export type ContainerTableProps = {
  children: React.ReactNode;
  isPadding?: boolean;
};

const ContainerTable = ({ children, isPadding }: ContainerTableProps) => {
  return <S.Wrapper isPadding={isPadding}>{children}</S.Wrapper>;
};

export default ContainerTable;
