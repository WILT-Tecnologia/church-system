import { Person } from '@/model/Person';
import dayjs from 'dayjs';

export const personsMapper = (persons: Person): Person => ({
  ...persons,
  created_at: dayjs(persons.created_at).format('DD/MM/YYYY [às] HH:mm:ss'),
  updated_at: dayjs(persons.updated_at).format('DD/MM/YYYY [às] HH:mm:ss'),
});
