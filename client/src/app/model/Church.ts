export interface Responsible {
  id: string;
  user_id: string | null;
  image: string | null;
  name: string;
  cpf: string;
  birth_date: string;
  email: string;
  phone_one: string;
  phone_two: string;
  sex: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export type Church = {
  id: string;
  responsible: Responsible;
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
