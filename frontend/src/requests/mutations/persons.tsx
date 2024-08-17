import ToastContent from '@/components/ToastContent';
import { Person, PersonForm } from '@/model/Person';
import createApi from '@/services/api';
import useMutation from '@/services/useMutation';
import { Session } from 'next-auth';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useAddPersonsMutation(session?: Session | null) {
  const addPerson = useCallback(
    async (values: PersonForm) => {
      const api = createApi(session);

      const requestData = { ...values, id: values.id ? values.id : undefined };

      console.log(api.post(`/admin/persons`, requestData));

      if (!requestData.id) {
        await api.post(`/admin/persons`, requestData);
      } else {
        await api.put(`/admin/persons/${requestData.id}`, requestData);
      }
    },
    [session],
  );
  return useMutation('add-person', addPerson, {
    linkedQueries: {
      'get-person': (
        old: { person: PersonForm[] } | undefined,
        newPerson: PersonForm,
      ) => {
        if (!old || !old.person) {
          return [{ ...newPerson, id: uuidv4(), disabled: true }];
        }

        const existingPerson = old.person.findIndex(
          (person) => person.id === newPerson.id,
        );

        if (existingPerson > -1) {
          const updatedPerson = [...old.person];
          updatedPerson[existingPerson] = {
            ...newPerson,
            id: old.person[existingPerson].id,
          };
          return { person: updatedPerson };
        } else {
          return {
            person: [
              ...old.person,
              { ...newPerson, id: uuidv4(), disabled: true },
            ],
          };
        }
      },
    },
    renderLoading: function render(newPerson: PersonForm) {
      return (
        <ToastContent showSpinner>Salvando: {newPerson.name}...</ToastContent>
      );
    },
    renderError: () => 'Falha ao inserir o registro!',
    renderSuccess: () => `Inserido com sucesso!`,
  });
}

export function useDeletePersonMutation(session?: Session | null) {
  const deletePerson = useCallback(
    async (person: Person) => {
      const api = createApi(session);
      return api.delete(`/admin/persons/${person.id}`);
    },
    [session],
  );

  return useMutation('delete-person', deletePerson, {
    linkedQueries: {
      'get-person': (oldPerson: Person[], deletedPerson: Person) =>
        oldPerson?.map((person) =>
          person.id === deletedPerson.id
            ? { ...person, disabled: true }
            : person,
        ),
    },
    renderLoading: function render() {
      return <ToastContent showSpinner>Excluindo...</ToastContent>;
    },
    renderError: () => `Falha ao excluir o registro!`,
    renderSuccess: () => `Registro excluído com sucesso!`,
  });
}
