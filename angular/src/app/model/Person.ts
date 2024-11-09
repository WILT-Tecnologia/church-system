export type Person = {
  id: string;
  user_id?: string;
  image?: string;
  name: string;
  cpf: string;
  birth_date: string;
  email: string;
  phone_one: string;
  phone_two?: string;
  sex: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
  created_at: string;
  updated_at: string;
};

export type PersonForm = Omit<Person, 'created_at' | 'updated_at'>;
