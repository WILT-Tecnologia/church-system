"use client";

import Button from "@/components/Button";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-zinc-900 text-white flex flex-col justify-center items-center gap-8 h-screen">
      <p className="text-6xl font-bold">Não encontrada</p>
      <p className="text-2xl">Sorry, this page does not exist 🥺</p>
      <Link href="/">
        <Button color="primary" labelColor="primary" variant="text">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
