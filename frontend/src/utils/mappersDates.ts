import { FormattedUsers, User } from "@/model/User";
import dayjs from "dayjs";

export const userMapper = (user: User): FormattedUsers => ({
  ...user,
  createdAt: dayjs(user.created_at).format("DD/MM/YYYY [às] HH:mm:ss"),
  updatedAt: dayjs(user.updated_at).format("DD/MM/YYYY [às] HH:mm:ss"),
});
