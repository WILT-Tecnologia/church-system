import { Person } from './Person';

export type Church = {
  id: string;
  person: Person;
  responsible: Person;
  responsible_id: string;
  name: string;
  email: string;
  cnpj: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  country: string;
  logo: string;
  favicon: string;
  background: string;
  color: string;
  created_at: string;
  updated_at: string;
};
