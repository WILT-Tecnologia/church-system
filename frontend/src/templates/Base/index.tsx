"use client";

import Navbar from "@/components/Navbar";
import PageContainer from "@/components/PageContainer";
import Sidebar from "@/components/Sidebar";

import { useState } from "react";

import * as S from "./styles";

type BaseProps = {
  children?: string | React.ReactNode;
};

export default function Base({ children }: BaseProps) {
  const [show, setShow] = useState(false);

  const handleVisible = () => {
    setShow(!show);
  };

  return (
    <S.Wrapper>
      <Navbar color="white" onClick={handleVisible} />
      <Sidebar onClick={handleVisible} />
      <S.Content>
        <PageContainer>{children}</PageContainer>
      </S.Content>
    </S.Wrapper>
  );
}
