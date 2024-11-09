import ToastContent from '@/components/ToastContent';
import { Person, PersonForm } from '@/model/Person';
import createApi from '@/services/api';
import useMutation from '@/services/useMutation';
import { Session } from 'next-auth';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useCreatePersonMutation(session?: Session | null) {
  const createPerson = useCallback(
    async (values: PersonForm) => {
      const api = createApi(session);
      const requestData = { ...values, id: undefined }; // Criação, sem ID
      await api.post(`/admin/persons`, requestData);
    },
    [session],
  );

  return useMutation('create-person', createPerson, {
    linkedQueries: {
      'get-person': (
        old: { person: PersonForm[] } | undefined,
        newPerson: PersonForm,
      ) => {
        if (!old || !old.person) {
          return [{ ...newPerson, id: uuidv4(), disabled: true }];
        }
        return {
          person: [
            ...old.person,
            { ...newPerson, id: uuidv4(), disabled: true },
          ],
        };
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

export function useUpdatePersonMutation(session?: Session | null) {
  const updatePerson = useCallback(
    async (values: PersonForm) => {
      const api = createApi(session);
      if (values.id) {
        await api.put(`/admin/persons/${values.id}`, values);
      }
    },
    [session],
  );

  return useMutation('update-person', updatePerson, {
    linkedQueries: {
      'get-person': (
        old: { person: PersonForm[] } | undefined,
        updatedPerson: PersonForm,
      ) => {
        if (!old || !old.person) return old;

        const existingPersonIndex = old.person.findIndex(
          (person) => person.id === updatedPerson.id,
        );
        if (existingPersonIndex > -1) {
          const updatedPersons = [...old.person];
          updatedPersons[existingPersonIndex] = {
            ...updatedPerson,
            id: old.person[existingPersonIndex].id,
          };
          return { person: updatedPersons };
        }
        return old;
      },
    },
    renderLoading: function render(updatedPerson: PersonForm) {
      return (
        <ToastContent showSpinner>
          Atualizando: {updatedPerson.name}...
        </ToastContent>
      );
    },
    renderError: () => 'Falha ao atualizar o registro!',
    renderSuccess: () => 'Atualizado com sucesso!',
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
    renderError: () => 'Falha ao excluir o registro!',
    renderSuccess: () => 'Registro excluído com sucesso!',
  });
}
