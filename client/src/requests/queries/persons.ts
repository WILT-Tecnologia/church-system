import { Person } from '@/model/Person';
import createApi from '@/services/api';
import { personsMapper } from '@/utils/mappersDates';
import { Session } from 'next-auth';

type ListPersonFilters = {
  id?: string;
  user_id?: string;
  image?: string;
  name?: string;
  cpf?: string;
  birth_date?: string;
  email?: string;
  phone_one?: string;
  phone_two?: string;
  sex?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
};

export const listPersons = async (
  session?: Session | null,
  filters: ListPersonFilters = {},
): Promise<Person[]> => {
  try {
    const api = createApi(session);

    const { ...restParams } = filters;

    const params = { ...restParams } as any;

    const response = await api.get<Person[]>('/admin/persons', { params });
    console.log(response);
    return response.data.map(personsMapper);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};
