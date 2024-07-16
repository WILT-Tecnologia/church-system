"use client";

import { global } from "@/config/global.routes";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import * as S from "./styles";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subMenuAnchorEl, setSubMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const open = Boolean(anchorEl);
  const subMenuOpen = Boolean(subMenuAnchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleSubMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSubMenuAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSubMenuAnchorEl(null);
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

  const menuList = (
    <List>
      {global.map((route) => (
        <Fragment key={route.path}>
          {route.subRoutes ? (
            <div>
              <Button
                color="primary"
                variant="text"
                onClick={handleSubMenuClick}
              >
                {route.name}
              </Button>
              <Menu
                anchorEl={subMenuAnchorEl}
                open={subMenuOpen}
                onClose={handleClose}
                onClick={handleClose}
                // PaperProps={{
                //   elevation: 0,
                //   sx: {
                //     overflow: "visible",
                //     filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                //     mt: 1.5,
                //     "& .MuiAvatar-root": {
                //       width: 32,
                //       height: 32,
                //       ml: -0.5,
                //       mr: 1,
                //     },
                //     "&::before": {
                //       content: '""',
                //       display: "block",
                //       position: "absolute",
                //       top: 0,
                //       right: 14,
                //       width: 10,
                //       height: 10,
                //       bgcolor: "background.paper",
                //       transform: "translateY(-50%) rotate(45deg)",
                //       zIndex: 0,
                //     },
                //   },
                // }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
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
            <ListItemButton component={Link} href={route.path}>
              <ListItemText primary={route.name} />
            </ListItemButton>
          )}
        </Fragment>
      ))}
      <ListItemButton color="primary" component={Link} href="/sign-in">
        <ListItemText color="primary" primary="Login" />
      </ListItemButton>
    </List>
  );

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
              {menuList}
            </Drawer>
          </>
        )}
        {!isMobile && (
          <>
            <S.Profile>
              <Typography color="primary" fontWeight="bold">
                Perfil:&nbsp;
              </Typography>
            </S.Profile>
            <S.Menu>
              {global.map((route) => (
                <Fragment key={route.path}>
                  {route.subRoutes ? (
                    <div>
                      <Button
                        color="primary"
                        variant="text"
                        onClick={handleSubMenuClick}
                      >
                        {route.name}
                      </Button>
                      <Menu
                        anchorEl={subMenuAnchorEl}
                        open={subMenuOpen}
                        onClose={handleClose}
                        onClick={handleClose}
                        // PaperProps={{
                        //   elevation: 0,
                        //   sx: {
                        //     overflow: "visible",
                        //     filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        //     mt: 1.5,
                        //     "& .MuiAvatar-root": {
                        //       width: 32,
                        //       height: 32,
                        //       ml: -0.5,
                        //       mr: 1,
                        //     },
                        //     "&::before": {
                        //       content: '""',
                        //       display: "block",
                        //       position: "absolute",
                        //       top: 0,
                        //       right: 14,
                        //       width: 10,
                        //       height: 10,
                        //       bgcolor: "background.paper",
                        //       transform: "translateY(-50%) rotate(45deg)",
                        //       zIndex: 0,
                        //     },
                        //   },
                        // }}
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
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
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
            <MenuItem onClick={handleClose}>Perfil</MenuItem>
            <MenuItem onClick={handleClose}>Sair</MenuItem>
          </Menu>
        </Box>
      </S.Header>
    </S.Wrapper>
  );
};

export default Navbar;

// "use client";

// import { global } from "@/config/global.routes";
// import MenuIcon from "@mui/icons-material/Menu";
// import {
//   Box,
//   Button,
//   Drawer,
//   IconButton,
//   List,
//   ListItemButton,
//   ListItemText,
//   Menu,
//   MenuItem,
//   Typography,
//   useMediaQuery,
// } from "@mui/material";
// import Image from "next/image";
// import Link from "next/link";
// import { Fragment, useState } from "react";
// import * as S from "./styles";

// type Route = {
//   path: string;
//   name: string;
// };

// type Routes = {
//   [key: string]: Route[];
// };

// const routes: Routes = {
//   global,
// };

// const Navbar = () => {
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const isMobile = useMediaQuery("(max-width:768px)");
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const open = Boolean(anchorEl);
//   const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const toggleDrawer =
//     (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
//       if (
//         event.type === "keydown" &&
//         ((event as React.KeyboardEvent).key === "Tab" ||
//           (event as React.KeyboardEvent).key === "Shift")
//       ) {
//         return;
//       }
//       setDrawerOpen(open);
//     };

//   const menuList = (
//     <List>
//       {Object.entries(routes).map(([key, value]) => (
//         <Fragment key={key}>
//           {value.map((route) => (
//             <ListItemButton key={route.path} component={Link} href={route.path}>
//               <ListItemText primary={route.name} />
//             </ListItemButton>
//           ))}
//         </Fragment>
//       ))}
//       <ListItemButton color="primary" component={Link} href="/sign-in">
//         <ListItemText color="primary" primary="Login" />
//       </ListItemButton>
//     </List>
//   );

//   return (
//     <S.Wrapper component="nav" sx={{ flexGrow: 1 }}>
//       <S.Header color="inherit" position="static">
//         {isMobile && (
//           <>
//             <IconButton
//               edge="start"
//               color="primary"
//               aria-label="menu"
//               onClick={toggleDrawer(true)}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Drawer
//               anchor="left"
//               color="primary"
//               open={drawerOpen}
//               onClose={toggleDrawer(false)}
//             >
//               {menuList}
//             </Drawer>
//           </>
//         )}
//         {!isMobile && (
//           <>
//             <S.Profile>
//               <Typography color="primary" fontWeight="bold">
//                 Perfil:&nbsp;
//               </Typography>
//             </S.Profile>
//             <S.Menu>
//               {Object.entries(routes).map(([key, value]) => (
//                 <Fragment key={key}>
//                   {value.map((route) => (
//                     <Link href={route.path} key={route.path}>
//                       <Button color="primary" variant="text" key={route.path}>
//                         {route.name}
//                       </Button>
//                     </Link>
//                   ))}
//                 </Fragment>
//               ))}
//             </S.Menu>
//           </>
//         )}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "flex-end",
//             alignItems: "center",
//           }}
//         >
//           <Button
//             id="basic-button"
//             aria-controls={open ? "profile" : undefined}
//             aria-haspopup="true"
//             aria-expanded={open ? "true" : undefined}
//             onClick={handleClick}
//             color="primary"
//             variant="text"
//             endIcon={
//               <Image
//                 src="/assets/storage/app/public/default.png"
//                 width={50}
//                 height={50}
//                 alt="image-profile"
//               />
//             }
//           >
//             Tiago Persch
//           </Button>
//           <Menu
//             id="profile"
//             anchorEl={anchorEl}
//             open={open}
//             onClose={handleClose}
//             onClick={handleClose}
//             MenuListProps={{
//               "aria-labelledby": "Profile",
//             }}
//             PaperProps={{
//               elevation: 0,
//               sx: {
//                 overflow: "visible",
//                 filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
//                 mt: 1.5,
//                 "& .MuiAvatar-root": {
//                   width: 32,
//                   height: 32,
//                   ml: -0.5,
//                   mr: 1,
//                 },
//                 "&::before": {
//                   content: '""',
//                   display: "block",
//                   position: "absolute",
//                   top: 0,
//                   right: 14,
//                   width: 10,
//                   height: 10,
//                   bgcolor: "background.paper",
//                   transform: "translateY(-50%) rotate(45deg)",
//                   zIndex: 0,
//                 },
//               },
//             }}
//             transformOrigin={{ horizontal: "right", vertical: "top" }}
//             anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
//           >
//             <MenuItem onClick={handleClose}>Perfil</MenuItem>
//             <MenuItem onClick={handleClose}>Sair</MenuItem>
//           </Menu>
//         </Box>
//       </S.Header>
//     </S.Wrapper>
//   );
// };

// export default Navbar;
