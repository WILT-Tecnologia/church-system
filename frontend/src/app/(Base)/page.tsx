"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

import * as S from "./styles";
type Props = {
  children: React.ReactNode;
};
const BasePage = ({ children }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  return (
    <S.Wrapper>
      <S.NavbarWrapper>
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={isSidebarOpen} />
      </S.NavbarWrapper>
      <S.SidebarWrapper>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </S.SidebarWrapper>
      <S.Content>{children}</S.Content>
    </S.Wrapper>
  );
};

export default BasePage;
