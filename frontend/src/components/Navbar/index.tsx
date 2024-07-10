import Link from "next/link";

import { global } from "@/config/global.routes";
import { Button, Typography } from "@mui/material";
import { Fragment } from "react";
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

const Navbar = () => {
  return (
    <S.Wrapper component="nav" sx={{ flexGrow: 1 }}>
      <S.Header color="inherit" position="static">
        <S.Profile>
          <Typography color="primary">Perfil:&nbsp;</Typography>
        </S.Profile>
        <S.Menu>
          {Object.entries(routes).map(([key, value]) => (
            <Fragment key={key}>
              {value.map((route) => (
                <Link href={route.path} key={route.path}>
                  <Button color="primary" variant="text" key={route.path}>
                    {route.name}
                  </Button>
                </Link>
              ))}
            </Fragment>
          ))}
        </S.Menu>
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
