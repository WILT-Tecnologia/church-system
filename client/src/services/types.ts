import axios, { AxiosError } from 'axios';

type ApiError = {
  message: string;
  status: 'error';
};

const isApiError = (error: unknown): error is AxiosError<ApiError> => {
  return axios.isAxiosError(error);
};

export { isApiError };
