import { FormattedPerson, Person } from "@/model/Person";
import { FormattedUsers, UserData } from "@/model/User";
import dayjs from "dayjs";

export const userMapper = (user: UserData): FormattedUsers => ({
  ...user,
  createdAt: dayjs(user.created_at).format("DD/MM/YYYY [às] HH:mm:ss"),
  updatedAt: dayjs(user.updated_at).format("DD/MM/YYYY [às] HH:mm:ss"),
});

export const personsMapper = (persons: Person): FormattedPerson => ({
  ...persons,
  createdAt: dayjs(persons.created_at).format("DD/MM/YYYY [às] HH:mm:ss"),
  updatedAt: dayjs(persons.updated_at).format("DD/MM/YYYY [às] HH:mm:ss"),
});
