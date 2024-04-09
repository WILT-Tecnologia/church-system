import { DefaultTheme } from "styled-components";

import * as S from "./styles";

export type HeaderProps = {
  children: string | React.ReactNode;
  color: keyof DefaultTheme["colors"];
  size: keyof DefaultTheme["fonts"]["sizes"];
  dark?: boolean;
  disabled?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
};

const Header = ({
  children,
  color = "primary",
  size = "medium",
  disabled = false,
  dark = false,
  isOpen,
  onClick,
}: HeaderProps) => {
  return (
    <S.Wrapper color={color} size={size} disabled={disabled} onClick={onClick}>
      {!!children && (
        <S.Label size={size} color={color} dark={dark}>
          {children}
        </S.Label>
      )}
      <S.ArrowIcon size={size} color={color} dark={dark} isOpen={isOpen} />
    </S.Wrapper>
  );
};

export default Header;
