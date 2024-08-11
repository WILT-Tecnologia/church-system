import { FormattedUsers, UserResponse } from "@/model/User";
import createApi from "@/services/api";
import { userMapper } from "@/utils/mappersDates";
import { Session } from "next-auth";

type ListUsersFilters = {
  status?: string;
  token?: string;
  user?: {
    data?: {
      id?: string;
      name?: string;
      email?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
};

export const listUsers = async (
  session?: Session | null,
  filters: ListUsersFilters = {}
): Promise<FormattedUsers[]> => {
  const api = createApi(session);
  try {
    const response = await api.get<UserResponse[]>("/admin/users", {
      params: filters,
    });
    console.log(response);

    if (!response) return [];

    return response.data.map(userMapper);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
