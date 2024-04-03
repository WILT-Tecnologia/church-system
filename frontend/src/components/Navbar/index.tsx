"use client";

import Link from "next/link";
import { useState } from "react";
import { DefaultTheme } from "styled-components";

import Logo from "../../../public/assets/storage/app/public/default.png";
import Avatar from "../Avatar/avatar";
import Button from "../Button";
import { Dropdown } from "../Dropdown";
import Typography from "../Typography";

import * as S from "./styles";

export type NavbarProps = {
  color: keyof DefaultTheme["colors"];
  enableColorOnDark?: boolean;
  percentDark?: number;
  position?: "absolute" | "fixed" | "relative" | "static" | "sticky";
};

const Navbar = ({
  color = "white",
  position = "relative",
  enableColorOnDark = false,
  percentDark = 0.5,
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
      <S.Logo>
        <Typography color="gray" size="small">
          Perfil:&nbsp;
        </Typography>
        <Dropdown.Root>
          <Dropdown.Header color="primary" size="xsmall" onClick={toggleBase}>
            Administrador - Templo Sede
          </Dropdown.Header>
          <Dropdown.Content isOpen={show} onClick={toggleBase}>
            <Dropdown.ListItem color="white">
              <Dropdown.Item color="gray" size="xsmall">
                Usuário comum
              </Dropdown.Item>
            </Dropdown.ListItem>
          </Dropdown.Content>
        </Dropdown.Root>
      </S.Logo>
      <S.ProfileContainer>
        <input type="checkbox" onClick={toggleBase} />
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
