"use client";

import { Menu } from "@styled-icons/feather";
import Link from "next/link";
import { useState } from "react";
import { DefaultTheme } from "styled-components";

import Logo from "../../../public/assets/storage/app/public/default.png";
import Avatar from "../Avatar/avatar";
import Button from "../Button";
import { Dropdown } from "../Dropdown";
import Icon from "../Icon";
import Typography from "../Typography";

import * as S from "./styles";

export type NavbarProps = {
  color: keyof DefaultTheme["colors"];
  enableColorOnDark?: boolean;
  percentDark?: number;
  position?: "absolute" | "fixed" | "relative" | "static" | "sticky";
  onClick?: () => void;
};

const Navbar = ({
  color = "white",
  position = "relative",
  enableColorOnDark = false,
  percentDark = 0.5,
  onClick,
}: NavbarProps) => {
  const [show, setShow] = useState(false);

  const toggleBase = () => {
    setShow((current) => !current);
  };

  return (
    <S.Wrapper
      color={color}
      position={position}
      enableColorOnDark={enableColorOnDark}
      percentDark={percentDark}
    >
      <S.WrapperHamburguerAndProfileAndPermission>
        <S.Hamburguer onClick={onClick}>
          <Icon color="primary" size="medium">
            <Menu />
          </Icon>
        </S.Hamburguer>
        <S.ProfileAndPermission>
          <Typography color="gray" size="xsmall" ocult>
            Perfil:&nbsp;
          </Typography>
          <Dropdown.Root isOpen={show}>
            <Dropdown.Header color="primary" size="xsmall" onClick={toggleBase}>
              Administrador - Templo Sede
            </Dropdown.Header>
            <Dropdown.Content isOpen={show}>
              <Dropdown.ListItem color="white">
                <Link href="/dashboard">
                  <Dropdown.Item color="primary" size="xsmall" dark>
                    Usuário comum
                  </Dropdown.Item>
                </Link>
              </Dropdown.ListItem>
            </Dropdown.Content>
          </Dropdown.Root>
        </S.ProfileAndPermission>
      </S.WrapperHamburguerAndProfileAndPermission>
      <S.ProfileContainer>
        {show && (
          <Link href="/sign-in">
            <Button color="primary" labelColor="white" variant="contained">
              Login
            </Button>
          </Link>
        )}
        {!show && (
          <Link href="/profile">
            <S.Profile>
              <Typography
                color="gray"
                size="xsmall"
                transform="capitalize"
                mobile
                ocult
              >
                Tiago Persch
              </Typography>
              <Avatar src={Logo} height={50} width={50} />
            </S.Profile>
          </Link>
        )}
      </S.ProfileContainer>
    </S.Wrapper>
  );
};

export default Navbar;
