"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

import { useState } from "react";

import * as S from "./styles";

type BaseProps = {
  children?: string | React.ReactNode;
};

export default function Base({ children }: BaseProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  return (
    <S.Wrapper>
      <S.NavbarWrapper>
        <Navbar
          color="white"
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
      </S.NavbarWrapper>
      <S.SidebarWrapper>
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </S.SidebarWrapper>
      <S.Content>{children}</S.Content>
    </S.Wrapper>
  );
}
