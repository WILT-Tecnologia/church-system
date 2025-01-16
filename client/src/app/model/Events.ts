import { Church } from './Church';
import { EventTypes } from './EventTypes';
import { Members } from './Members';

export type Events = {
  id: string;
  church: Church;
  church_id: string;
  event_type: EventTypes;
  event_type_id: string;
  name: string;
  obs: string;
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
