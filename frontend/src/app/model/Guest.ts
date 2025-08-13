import { Members } from './Members';

export type Guest = {
  id: string;
  person_id?: string;
  name: string;
  phone_one: string;
  phone_two: string;
  member: Members;
  member_id: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  country: string;
};
