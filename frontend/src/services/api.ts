import axios from "axios";

const createApi = (session?: any) => {
  const jwt = session?.jwt;

  const api = axios.create({
    baseURL:
      process.env.NODE_ENV === "production"
        ? process.env.API_URL
        : process.env.SERVER_API_URL,
    headers: {
      Authorization: jwt ? `Bearer ${jwt}` : "",
    },
    timeout: 30000,
  });

  api.interceptors.request.use((config) => {
    const params = config.params || {};
    const newParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== "" && value !== undefined && value !== null
      )
    );

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
    }
  );

  return api;
};

export default createApi;
