import * as S from "./styles";
type ContainerIdentityVisualProps = {
  children: React.ReactNode;
};

export default function ContainerIdentityVisual({
  children,
}: ContainerIdentityVisualProps) {
  return <S.Container>{children}</S.Container>;
}
