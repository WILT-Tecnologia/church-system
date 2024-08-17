import { unstable__api } from "@/services/unstable-api";
import { isServer } from "@/utils/isServer";

type CreateSessionParams = {
  email: string;
  password: string;
};

export const createSession = (params: CreateSessionParams) => {
  const baseURL = isServer ? process.env.API_URL : process.env.SERVER_API_URL;

  return unstable__api.post(`${baseURL}/admin/session`, params);
};
