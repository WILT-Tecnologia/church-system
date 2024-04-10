"use client";

import LoadingComponent from "@/components/Loading";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Loading = () => {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  return <LoadingComponent />;
};

export default Loading;
