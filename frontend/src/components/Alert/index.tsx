import { X } from "@styled-icons/feather";
import { ReactNode, useState } from "react";
import { DefaultTheme } from "styled-components";

import * as S from "./styles";

export type AlertProps = {
  children?: string | ReactNode;
  description?: string | ReactNode;
  action?: ReactNode;
  closeIcon?: boolean;
  color: keyof DefaultTheme["colors"];
  backgroundColor: keyof DefaultTheme["colors"];
  icon?: ReactNode;
  dark?: boolean;
  iconAnimation?: boolean;
  bold?: boolean;
};

const Alert = ({
  children,
  description,
  action,
  closeIcon,
  color = "white",
  backgroundColor = "primary",
  icon,
  dark = false,
  iconAnimation = false,
  bold,
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible((current) => !current);
  };

  return (
    <>
      {isVisible && (
        <S.Wrapper
          action={action}
          closeIcon={closeIcon}
          backgroundColor={backgroundColor}
          color={color}
          hasIcon={!!icon}
          dark={dark}
          iconAnimation={iconAnimation}
        >
          {!!icon && <S.Icon>{icon}</S.Icon>}
          <S.Container>
            <S.TitleDescription>
              {!!children && <S.Title bold={bold}>{children}</S.Title>}
              {!!description && <S.Description>{description}</S.Description>}
            </S.TitleDescription>
            {!!closeIcon && (
              <S.ActionButtonsContainer>
                <S.ActionButton
                  color="white"
                  background="primary"
                  onClick={handleClose}
                >
                  <X />
                </S.ActionButton>
              </S.ActionButtonsContainer>
            )}
          </S.Container>
        </S.Wrapper>
      )}
    </>
  );
};

export default Alert;
