"use client";

import { Button } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-zinc-600 text-white flex flex-col justify-center items-center gap-8 h-screen">
      <p className="text-6xl font-bold">Não encontrada</p>
      <p className="text-2xl">Sorry, this page does not exist 🥺</p>
      <Link href="/">
        <Button color="primary" variant="contained">
          Retornar a página inicial
        </Button>
      </Link>
    </div>
  );
}
