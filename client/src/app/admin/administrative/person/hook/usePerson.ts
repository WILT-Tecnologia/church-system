import { routes } from '@/config/routes';
import { useSearchCep } from '@/hooks/useSearchCep';

import { Person } from '@/model/Person';
import {
  useCreatePersonMutation,
  useDeletePersonMutation,
} from '@/requests/mutations/persons';
import { listPersons } from '@/requests/queries/persons';
import { zodResolver } from '@hookform/resolvers/zod';
import { GridRowId, GridRowModesModel } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { schema } from '../hook/schema/index';

type Schema = z.infer<typeof schema> & {
  message?: string;
};

export default function usePerson() {
  const [loadingCircular, setLoadingCircular] = useState(false);
  const [rows, setRows] = useState<Person[]>([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [dialogType, setDialogType] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [selectedRow, setSelectedRow] = useState<Person | any>('');
  const router = useRouter();
  const mutation = useCreatePersonMutation();
  const deleteMutation = useDeletePersonMutation();

  const {
    data: persons,
    refetch,
    isLoading,
  } = useQuery<Person[]>({
    queryKey: ['get-Situation'],
    queryFn: () => listPersons(),
  });

  useEffect(() => {
    if (persons) {
      setRows(persons);
    }
  }, [persons]);

  const {
    control,
    register,
    setValue,
    setError,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({
    criteriaMode: 'all',
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      user_id: '',
      image: '',
      name: '',
      cpf: '',
      birth_date: '',
      email: '',
      phone_one: '',
      phone_two: '',
      sex: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      country: '',
    },
  });

  const streetValue = watch('street');
  const districtValue = watch('district');
  const cityValue = watch('city');
  const stateValue = watch('state');
  const messageValue = watch('message');

  const handleCepChange = async (cep: string) => {
    setLoadingCircular(true);

    try {
      const data = await useSearchCep(cep);
      setValue('street', data.street || data.logradouro || '');
      setValue('district', data.district || data.bairro || '');
      setValue('city', data.city || data.cidade || '');
      setValue('state', data.state || data.estado || '');
    } catch (err) {
      setError('cep', { type: 'manual', message: 'CEP não encontrado.' });
      setValue('street', '');
      setValue('district', '');
      setValue('city', '');
      setValue('state', '');
    } finally {
      setLoadingCircular(false);
    }
  };

  const openDialog = (type: 'create' | 'edit' | 'delete', row?: Person) => {
    setDialogType(type);
    setSelectedRow(row ?? '');
    setOpenPopup(true);
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedRow(null);
    setOpenPopup(false);
  };

  const handleCreateClick = () => {
    console.log('criando...');
    openDialog('create');
  };

  /* const handleSaveClick = (id: GridRowId) => () => {
    const values = rows.find((row) => row.id === id);
    if (values) {
      console.log(values);
      openDialog('edit', values);
    }
  }; */

  const handleSaveClick = (id: GridRowId) => () => {
    const values = rows.find((row) => row.id === id);
    if (values) {
      // Atualiza os valores do formulário com os dados da linha selecionada
      Object.keys(values).forEach((key) => {
        setValue(key as keyof Schema, values[key as keyof Person]);
      });
      console.log(values);
      openDialog('edit', values); // Abre o diálogo de edição
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    try {
      const valueToDelete = rows.find((row) => row.id === id);
      openDialog('delete', valueToDelete);
      if (valueToDelete) {
        const updatedRows = rows.filter((row) => row.id === id);
        setRows(updatedRows);
        /* const result = deleteMutation.mutateAsync(id);
        console.log(result); */
      }
    } catch (error) {
      console.log(error);
    } finally {
      refetch();
    }
  };

  const onSubmit: SubmitHandler<Schema> = useCallback(
    async (values: Schema) => {
      try {
        const result = await mutation.mutateAsync(values);

        if (result?.status === 201) {
          router.push(routes.administrative.persons);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 400) {
            setError('message', {
              type: 'validate',
              message: error.response.data,
            });
          } else {
            setError('message', {
              type: 'manual',
              message: 'Algo deu errado!',
            });
          }
        } else {
          setError('message', { type: 'manual', message: 'Algo deu errado!' });
        }
      }
    },
    [mutation, router],
  );

  const handleBack = () => {
    return router.back();
  };

  return {
    streetValue,
    districtValue,
    cityValue,
    stateValue,
    loadingCircular,
    control,
    errors,
    isSubmitting,
    persons,
    isLoading,
    rowModesModel,
    rows,
    openPopup,
    messageValue,
    dialogType,
    selectedRow,
    setError,
    setRows,
    setOpenPopup,
    watch,
    setValue,
    Controller,
    register,
    handleCepChange,
    onSubmit,
    handleSubmit,
    handleBack,
    setRowModesModel,
    handleCreateClick,
    handleSaveClick,
    handleDeleteClick,
    openDialog,
    closeDialog,
  };
}
