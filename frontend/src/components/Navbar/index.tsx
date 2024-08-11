"use client";

import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MenuList from "./MenuList";
import * as S from "./styles";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const open = Boolean(anchorEl);
  const subMenuOpen = Boolean(subMenuAnchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSubMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    routeName: string
  ) => {
    if (openSubMenu === routeName) {
      setSubMenuAnchorEl(null);
      setOpenSubMenu(null);
    } else {
      setSubMenuAnchorEl(event.currentTarget);
      setOpenSubMenu(routeName);
    }
  };

  const handleClose = async () => {
    await signOut({ callbackUrl: "/login", redirect: true });
    setAnchorEl(null);
    setSubMenuAnchorEl(null);
    setOpenSubMenu(null);
  };

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  return (
    <S.Wrapper component="nav" sx={{ flexGrow: 1 }}>
      <S.Header color="inherit" position="static">
        {isMobile && (
          <>
            <IconButton
              edge="start"
              color="primary"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              color="primary"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              <MenuList />
            </Drawer>
          </>
        )}
        <S.Logo href={"/"}>
          <Image src="/vercel.svg" alt="logo" width={100} height={100} />
        </S.Logo>
        {/* {!isMobile && (
          <>
            <S.Menu>
              {global.map((route) => (
                <Fragment key={route.path}>
                  {route.subRoutes && route.subRoutes.length > 0 ? (
                    <div>
                      <Button
                        color="primary"
                        variant="text"
                        onClick={(event) =>
                          handleSubMenuClick(event, route.name)
                        }
                      >
                        {route.name}
                      </Button>
                      <Menu
                        anchorEl={subMenuAnchorEl}
                        open={openSubMenu === route.name}
                        onClose={handleClose}
                        onClick={handleClose}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}
                      >
                        {route.subRoutes.map((subRoute) => (
                          <MenuItem
                            key={subRoute.path}
                            component={Link}
                            href={subRoute.path}
                          >
                            {subRoute.name}
                          </MenuItem>
                        ))}
                      </Menu>
                    </div>
                  ) : (
                    <Link href={route.path} key={route.path}>
                      <Button color="primary" variant="text">
                        {route.name}
                      </Button>
                    </Link>
                  )}
                </Fragment>
              ))}
            </S.Menu>
          </>
        )} */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {!isMobile && (
            <>
              <Link href="/admin/church">
                <Button
                  color="primary"
                  key="igrejas"
                  size="large"
                  variant="text"
                  sx={{ mr: 1 }}
                >
                  Igrejas
                </Button>
              </Link>
              <Link href="/admin/administrative">
                <Button
                  color="primary"
                  key="administrativo"
                  size="large"
                  variant="text"
                  sx={{ mr: 1 }}
                >
                  Administrativo
                </Button>
              </Link>
            </>
          )}
          <Button
            id="basic-button"
            aria-controls={open ? "profile" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            color="primary"
            variant="text"
            endIcon={
              <Image
                src="/assets/storage/app/public/default.png"
                width={50}
                height={50}
                alt="image-profile"
              />
            }
          >
            Tiago Persch
          </Button>
          <Menu
            id="profile"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            MenuListProps={{
              "aria-labelledby": "Profile",
            }}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {isMobile && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  flexDirection: "column",
                }}
              >
                <Link href="/admin/church">
                  <MenuItem onClick={handleClose}>Igrejas</MenuItem>
                </Link>
                <Link href="/admin/administrative">
                  <MenuItem onClick={handleClose}>Administrativo</MenuItem>
                </Link>
              </Box>
            )}
            <MenuItem onClick={handleClose}>Perfil</MenuItem>
            <MenuItem onClick={handleClose}>Sair</MenuItem>
          </Menu>
        </Box>
      </S.Header>
    </S.Wrapper>
  );
}
