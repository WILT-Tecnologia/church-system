import { SESSION_KEYS } from "@/requests/queries/session";
import { isServer } from "@/utils/isServer";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import createApi from "./api";
import queryClient from "./queryClient";

const unstable__api = createApi();

if (!isServer) {
  unstable__api.interceptors.request.use(async (config) => {
    const session = queryClient.getQueryData<{ token?: string }>([
      SESSION_KEYS.all,
    ]);
    let token = session?.token;

    const isSessionRequest =
      config.url === `${process.env.API_URL}/admin/session`;

    if (!token && !isSessionRequest) {
      const newSession = await getSession();
      queryClient.setQueryData([SESSION_KEYS.all], newSession);

      token = newSession?.user.token;
    }

    const authorization = token ? `Bearer ${token}` : undefined;
    config.headers.Authorization = authorization;

    return config;
  });
}

export const createUnstableApi = (session?: Session | null) => {
  const authorization = session?.user.token
    ? `Bearer ${session.user.token}`
    : undefined;
  unstable__api.defaults.headers.head.Authorization = authorization;
  //unstable__api.defaults.headers.authorization = authorization;

  return unstable__api;
};

export { unstable__api };
