import { Church } from './Church';
import { EventTypes } from './EventTypes';
import { Members } from './Members';
import { User } from './User';

export type Events = {
  id: string;
  church: Church;
  church_id: string;
  event_type: EventTypes;
  event_type_id: string;
  name: string;
  obs: string;
  theme: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  created_at: string;
  updated_at: string;
  created_by: User;
  updated_by: User | null;
};

export type Guest = {
  id: string;
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
