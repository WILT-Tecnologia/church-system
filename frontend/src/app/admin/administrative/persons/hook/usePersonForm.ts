import { routes } from '@/config/global.routes';
import { useSearchCep } from '@/hooks/useSearchCep';
import { FormattedPerson } from '@/model/Person';
import { useAddPersonsMutation } from '@/requests/mutations/persons';
import { listPersons } from '@/requests/queries/persons';
import { zodResolver } from '@hookform/resolvers/zod';
import { GridRowId, GridRowModesModel } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { schema } from '../hook/schema';

type Schema = z.infer<typeof schema> & {
  message?: string;
};

export default function usePersonForm() {
  const [loadingCircular, setLoadingCircular] = useState(false);
  const [rows, setRows] = useState<FormattedPerson[]>([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const router = useRouter();

  const {
    data: persons,
    isLoading: loading,
    refetch,
  } = useQuery<FormattedPerson[]>({
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
    formState: { errors, isSubmitting, isLoading },
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

  const handleSaveClick = (id: GridRowId) => () => {
    const valueToEdit = rows.find((row) => row.id === id);
    if (valueToEdit) {
      console.log(valueToEdit);
      setOpenPopup(true);
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    try {
      const valueToDelete = rows.find((row) => row.id === id);
      if (valueToDelete) {
        const updatedRows = rows.filter((row) => row.id === id);
        setRows(updatedRows);
      }
    } catch (error) {
      console.log(error);
    } finally {
      refetch();
    }
  };

  const mutation = useAddPersonsMutation();

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
    loading,
    rowModesModel,
    rows,
    openPopup,
    messageValue,
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
    handleSaveClick,
    handleDeleteClick,
  };
}
