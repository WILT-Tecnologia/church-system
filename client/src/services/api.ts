import axios from 'axios';
import { Session } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

const createApi = (session?: Session | null) => {
  const jwt = session?.user.token;
  const csrfToken = session?.csrfToken || uuidv4();

  const api = axios.create({
    baseURL:
      process.env.NODE_ENV === 'production'
        ? process.env.API_URL
        : process.env.SERVER_API_URL,
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : `Bearer ${uuidv4()}`,
      'X-XSRF-TOKEN': csrfToken,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  api.interceptors.request.use((config) => {
    const params = config.params || {};
    const newParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== '' && value !== undefined && value !== null,
      ),
    );

    newParams._token = csrfToken;

    config.params = newParams;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        /* await signOut({ callbackUrl: "/login", redirect: true }); */
        return;
      }
      return Promise.reject(error);
    },
  );

  return api;
};

export default createApi;
