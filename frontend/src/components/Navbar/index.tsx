import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DefaultTheme } from "styled-components";

import Logo from "../../assets/storage/app/public/default.png";
import Button from "../Button";
import Typography from "../Typography";

import * as S from "./styles";

export type NavbarProps = {
  color: keyof DefaultTheme["colors"];
  enableColorOnDark?: boolean;
  position?: "absolute" | "fixed" | "relative" | "static" | "sticky";
};

const Navbar = ({ color, position, enableColorOnDark }: NavbarProps) => {
  const [show, setShow] = useState(false);

  const toggleBase = () => {
    setShow((current) => !current);
  };

  return (
    <S.Wrapper
      color={color}
      position={position}
      enableColorOnDark={enableColorOnDark}
    >
      <S.Logo href="/" passHref>
        <Image
          src="next.svg"
          height={50}
          width={150}
          quality={80}
          alt="Logo"
          priority
        />
      </S.Logo>
      <S.ProfileContainer>
        <input type="checkbox" onClick={toggleBase} />
        {show && (
          <Link href="/sign-in">
            <Button color="primary" labelColor="white" variant="contained">
              Login
            </Button>
          </Link>
        )}
        {!show && (
          <Link href="/profile">
            <S.Profile>
              <Typography
                color="gray"
                size="xsmall"
                transform="capitalize"
                mobile
              >
                Tiago Persch
              </Typography>
              <Image
                src={Logo}
                height={32}
                width={32}
                quality={80}
                alt="image profile"
                priority
              />
            </S.Profile>
          </Link>
        )}
      </S.ProfileContainer>
    </S.Wrapper>
  );
};

export default Navbar;
