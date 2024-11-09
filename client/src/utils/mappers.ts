import { Person } from '@/model/Person';
import dayjs from 'dayjs';
import { maskCpf, maskPhone } from './mask';

export const mappers = (persons: Person): Person => ({
  ...persons,
  cpf: persons.cpf ? maskCpf(persons.cpf) : undefined,
  phone_one: persons.phone_one ? maskPhone(persons.phone_one) : undefined,
  birth_date: persons.birth_date
    ? dayjs(persons.birth_date).format('DD/MM/YYYY')
    : undefined,
  created_at: persons.created_at
    ? dayjs(persons.created_at).format('DD/MM/YYYY [às] HH:mm:ss')
    : undefined,
  updated_at: persons.updated_at
    ? dayjs(persons.updated_at).format('DD/MM/YYYY [às] HH:mm:ss')
    : undefined,
});
