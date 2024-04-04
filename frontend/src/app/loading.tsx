"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Loading() {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  return <main>Loading...</main>;
}
