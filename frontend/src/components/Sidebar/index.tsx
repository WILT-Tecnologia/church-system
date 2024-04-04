"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

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

type SidebarProps = {
  onClick: () => void;
};

const Sidebar = ({ onClick }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <S.Wrapper onClick={onClick}>
      <S.Logo href="/" passHref>
        <Image src={Logo} width={150} quality={80} alt="Logo" priority />
      </S.Logo>
      <S.Menu>
        {Object.entries(routes).map(([key, value]) => (
          <Fragment key={key}>
            {value.map((route) => (
              <S.MenuItem key={route.path} active={pathname === route.path}>
                <Link href={route.path} passHref>
                  {route.name}
                </Link>
              </S.MenuItem>
            ))}
          </Fragment>
        ))}
      </S.Menu>
    </S.Wrapper>
  );
};

export default Sidebar;
