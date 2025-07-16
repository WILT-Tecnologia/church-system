import { Church } from './Church';
import { EventTypes } from './EventTypes';
import { Members } from './Members';
import { User } from './User';

export type EventData = {
  name: string;
  date: string;
  time: string;
  theme: string;
  type: string;
  observations?: string;
};

export type Events = {
  id: string;
  church?: Church;
  church_id: string;
  eventType?: EventTypes;
  event_type_id: string;
  name: string;
  obs?: string;
  participantAndGuests?: ParticipantAndGuest[];
  created_at?: string;
  updated_at?: string;
  created_by?: User;
  updated_by?: User | null;
  combinedCreatedByAndCreatedAt?: string;
  combinedUpdatedByAndUpdatedAt?: string;
};

export type EventCalls = {
  id: string;
  event: Events;
  event_id: string;
  theme: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  created_at: string;
  updated_at: string;
};

export type ParticipantAndGuest = {
  id: string;
  name: string;
  selected: boolean;
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
