"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";

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
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  const handleShow = () => {
    setShow(!show);
  };

  return (
    <>
      <S.FloatingButton onClick={handleShow}>
        {show ? <S.CloseIcon /> : <S.OpenIcon />}
      </S.FloatingButton>
      <S.SidebarWrapper show={show}>
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
      </S.SidebarWrapper>
    </>
  );
};

export default Sidebar;
