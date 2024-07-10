"use client";

import Link from "next/link";

import { Menu } from "@mui/icons-material";
import { Button, IconButton, Typography } from "@mui/material";
import * as S from "./styles";

export type NavbarProps = {
  toggleSidebar?: () => void;
  sidebarOpen?: boolean;
};

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  return (
    <S.Wrapper component="nav" sx={{ flexGrow: 1 }}>
      <S.Header color="inherit" position="static">
        <S.MenuAndProfile>
          <IconButton onClick={toggleSidebar}>
            <Menu color="primary" />
          </IconButton>
          <Typography color="primary">Perfil:&nbsp;</Typography>
        </S.MenuAndProfile>
        <Link href="/sign-in">
          <Button color="primary" variant="contained">
            Login
          </Button>
        </Link>
      </S.Header>
    </S.Wrapper>
  );
};

export default Navbar;
