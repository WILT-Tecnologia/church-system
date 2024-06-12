"use client";

import { Menu } from "@styled-icons/feather";
import Link from "next/link";
import { useState } from "react";

import { AppBar, Box, Button, Typography } from "@mui/material";
import Logo from "../../../public/assets/storage/app/public/default.png";
import Avatar from "../Avatar/avatar";

import Hamburguer from "../Hamburguer";
import * as S from "./styles";

export type NavbarProps = {
  toggleSidebar?: () => void;
  sidebarOpen?: boolean;
};

const Navbar = ({ toggleSidebar, sidebarOpen }: NavbarProps) => {
  const [show, setShow] = useState(true);

  const toggleBase = () => {
    setShow((current) => !current);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <S.WrapperHamburguerAndProfileAndPermission>
          {!sidebarOpen && (
            <Hamburguer
              position="relative"
              onClick={toggleSidebar}
              icon={<Menu />}
            />
          )}
          <S.ProfileAndPermission>
            <Typography>Perfil:&nbsp;</Typography>
          </S.ProfileAndPermission>
        </S.WrapperHamburguerAndProfileAndPermission>
        <S.ProfileContainer>
          <input type="checkbox" onClick={toggleBase} />
          {show && (
            <Link href="/sign-in">
              <Button color="primary" variant="contained">
                Login
              </Button>
            </Link>
          )}
          {!show && (
            <Link href="/profile">
              <S.Profile>
                <Typography>Tiago Persch</Typography>
                <Avatar src={Logo} height={50} width={50} />
              </S.Profile>
            </Link>
          )}
        </S.ProfileContainer>
      </AppBar>
    </Box>
  );
};

export default Navbar;
