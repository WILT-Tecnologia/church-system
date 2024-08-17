import { Session } from "next-auth";
import { useMemo } from "react";
import createApi from "./api";

export function useApi(session?: Session | null) {
  const store = useMemo(() => createApi(session), [session]);
  return store;
}
