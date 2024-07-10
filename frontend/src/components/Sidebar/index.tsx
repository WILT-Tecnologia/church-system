"use client";

import { Fragment, useEffect, useState } from "react";

import { Home } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/next.svg";
import { global } from "../../config/global.routes";
import * as S from "./styles";

type Route = {
  path: string;
  name: string;
};

type Routes = {
  [key: string]: Route[];
};

const routes: Routes = {
  global,
};

export type SidebarProps = {
  isOpen?: boolean;
  toggleSidebar?: () => void;
};

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isOpen) {
        toggleSidebar?.();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, toggleSidebar]);

  return (
    <>
      {isOpen && (
        <S.Wrapper
          sx={{
            width: "15rem",
            backgroundColor: "white",
            height: "100dvh",
          }}
          component="aside"
          role="presentation"
          onClick={toggleDrawer(false)}
        >
          <List>
            <S.Logo href="/">
              <Image src={Logo} width={150} quality={80} alt="Logo" priority />
            </S.Logo>
            {Object.entries(routes).map(([key, value]) => (
              <Fragment key={key}>
                {value.map((route) => (
                  <Link href={route.path}>
                    <ListItem disablePadding key={route.path}>
                      <ListItemButton>
                        <ListItemIcon>
                          <Home />
                        </ListItemIcon>
                        <ListItemText primary={route.name} />
                      </ListItemButton>
                    </ListItem>
                  </Link>
                ))}
              </Fragment>
            ))}
          </List>
        </S.Wrapper>
      )}
    </>
  );
};

export default Sidebar;
