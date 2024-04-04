"use client";

import LoadingComponent from "@/components/Loading";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Loading() {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  return (
    <main className="flex justify-center items-center h-screen bg-zinc-200">
      <LoadingComponent />
    </main>
  );
}
