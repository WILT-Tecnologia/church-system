import * as S from "./styles";

export type ContainerButtonProps = {
  children: React.ReactNode;
  isFullwidth?: boolean;
};

export default function ContainerButton({
  children,
  isFullwidth,
}: ContainerButtonProps) {
  return <S.Wrapper isFullwidth={isFullwidth}>{children}</S.Wrapper>;
}
