import ToastContent from "@/components/ToastContent";
import { UserData } from "@/model/User";
import createApi from "@/services/api";
import useMutation from "@/services/useMutation";
import { Session } from "next-auth";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export function useAddUserMutation(session?: Session | null) {
  const addUser = useCallback(
    async (values: UserData) => {
      const api = createApi(session);
      const requestData = { ...values, id: values.id ? values.id : undefined };

      if (!requestData.id) {
        return api.post("/admin/users", requestData);
      } else {
        return api.patch(`/admin/users/${requestData.id}`, requestData);
      }
    },
    [session]
  );

  return useMutation("add-user", addUser, {
    linkedQueries: {
      "get-users": (
        old: { users: UserData[] } | undefined,
        newUser: UserData
      ) => {
        if (!old || !old.users) {
          return [{ ...newUser, id: uuidv4(), disabled: true }];
        }

        const existingUserIndex = old.users.findIndex(
          (user) => user.id === newUser.id
        );

        if (existingUserIndex > -1) {
          const updatedUsers = [...old.users];
          updatedUsers[existingUserIndex] = {
            ...newUser,
            id: old.users[existingUserIndex].id,
          };
          return { users: updatedUsers };
        } else {
          return {
            users: [...old.users, { ...newUser, id: uuidv4(), disabled: true }],
          };
        }
      },
    },
    renderLoading: function render(newUser: UserData) {
      return <ToastContent showSpinner>Salvando registro ...</ToastContent>;
    },
    renderError: () => "Falha ao inserir registro!",
    renderSuccess: () => `Registro inserido com sucesso`,
  });
}

export function useDeleteUserMutation(session?: Session | null) {
  const deleteUser = useCallback(
    async (user: UserData) => {
      const api = createApi(session);
      return api.delete(`/admin/users/${user.id}`);
    },
    [session]
  );

  return useMutation("delete-user", deleteUser, {
    linkedQueries: {
      "get-users": (oldUsers: UserData[], deletedUser: UserData) =>
        oldUsers?.map((user) =>
          user.id === deletedUser.id ? { ...user, disabled: true } : user
        ),
    },
    renderLoading: (deletedUser: UserData) => (
      <ToastContent showSpinner>
        Removendo o usuário: {deletedUser.name}...
      </ToastContent>
    ),
    renderError: () => "Falha ao remover o registro!",
    renderSuccess: () => `Deletado o registro com sucesso!`,
  });
}
