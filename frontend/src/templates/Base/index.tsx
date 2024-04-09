"use client";

import { useState } from "react";

import Navbar from "@/components/Navbar";
import { Box } from "@mui/material";

type BaseProps = {
  children?: string | React.ReactNode;
};

export default function Base({ children }: BaseProps) {
  const [show, setShow] = useState(false);

  const handleVisible = () => {
    setShow(!show);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateAreas: `
        sidebar header
        sidebar main-content`,
        gridTemplateColumns: "29rem 1fr",
      }}
    >
      <Box>
        <Navbar />
      </Box>
      {/* <S.SidebarContent>
        <Sidebar onClick={handleVisible} />
      </S.SidebarContent> */}
      <Box
        sx={{
          gridArea: "main-content",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
