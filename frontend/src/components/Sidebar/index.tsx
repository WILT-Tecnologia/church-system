"use client";

import { Menu } from "@styled-icons/feather";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import Logo from "../../../public/next.svg";
import { global } from "../../config/global.routes";
import Hamburguer from "../Hamburguer";

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

const Sidebar = ({ isOpen = true, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <S.HamburguerWrapper>
          <Hamburguer onClick={toggleSidebar} icon={<Menu />} />
        </S.HamburguerWrapper>
      )}
      {isOpen && (
        <S.SidebarWrapper isOpen={isOpen}>
          <S.Wrapper>
            <S.Logo href="/" passHref>
              <Image src={Logo} width={150} quality={80} alt="Logo" priority />
            </S.Logo>
            <S.MenuItems>
              {Object.entries(routes).map(([key, value]) => (
                <Fragment key={key}>
                  {value.map((route) => (
                    <S.MenuItem
                      key={route.path}
                      active={pathname === route.path}
                    >
                      <Link href={route.path} passHref>
                        {route.name}
                      </Link>
                    </S.MenuItem>
                  ))}
                </Fragment>
              ))}
            </S.MenuItems>
          </S.Wrapper>
        </S.SidebarWrapper>
      )}
    </>
  );
};

export default Sidebar;
