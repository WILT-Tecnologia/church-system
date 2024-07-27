import { global } from "@/config/global.routes";
import { Button, List, ListItemButton, Menu, MenuItem } from "@mui/material";
import Link from "next/link";
import { Fragment, useState } from "react";

export default function MenuList() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

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

  const handleClose = () => {
    setAnchorEl(null);
    setSubMenuAnchorEl(null);
    setOpenSubMenu(null);
  };

  return (
    <List>
      {global.map((route) => (
        <Fragment key={route.path}>
          {route.subRoutes && route.subRoutes.length > 0 ? (
            <div>
              <Button
                fullWidth
                color="inherit"
                variant="text"
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  padding: "8px 16px",
                }}
                onClick={(event) => handleSubMenuClick(event, route.name)}
              >
                {route.name}
              </Button>
              <Menu
                anchorEl={subMenuAnchorEl}
                open={openSubMenu === route.name}
                onClose={handleClose}
                transformOrigin={{ horizontal: "left", vertical: "top" }}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
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
              <ListItemButton
                component={Button}
                href={route.path}
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  padding: "8px 16px",
                }}
              >
                {route.name}
              </ListItemButton>
            </Link>
          )}
        </Fragment>
      ))}
    </List>
  );
}
