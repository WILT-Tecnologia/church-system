import * as S from "./styles";

export type BadgeProps = {
  children: React.ReactNode | string;
  variant: "success" | "info" | "orange" | "error";
};

const Badge = ({ children, variant = "success" }: BadgeProps) => (
  <S.Wrapper variant={variant}>{children}</S.Wrapper>
);

export default Badge;
