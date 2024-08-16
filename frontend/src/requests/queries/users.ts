import { FormattedUsers } from "@/model/User";
import createApi from "@/services/api";
import { userMapper } from "@/utils/mappersDates";
import { Session, User } from "next-auth";

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
  try {
    const api = createApi(session);

    const { ...restParams } = filters;

    const params = { ...restParams } as any;

    const response = await api.get<User[]>("/admin/users", { params });
    return response.data.map(userMapper);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
