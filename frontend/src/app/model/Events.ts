import { Church } from './Church';
import { EventTypes } from './EventTypes';
import { Guest } from './Guest';
import { Members } from './Members';
import { Person } from './Person';
import { User } from './User';

export interface Events {
  id: string;
  church?: Church;
  church_id: string;
  eventType?: EventTypes;
  event_type_id: string;
  name: string;
  obs?: string;
  participants?: Members[];
  guests?: Guest[];
  frequencies?: Frequency[];
  participantAndGuests?: ParticipantAndGuest[];
  eventCall?: EventCall;
  created_at?: string;
  updated_at?: string;
  created_by?: User;
  updated_by?: User | null;
  combinedCreatedByAndCreatedAt?: string;
  combinedUpdatedByAndUpdatedAt?: string;
}

export interface EventCall {
  id: string;
  event: Events;
  event_id: string;
  theme: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
}

export interface ParticipantAndGuest {
  id: string;
  name: string;
  selected: boolean;
  isGuest?: boolean;
}

export interface Frequency {
  id: string;
  event_call_id: string;
  member_id?: string;
  guest_id?: string;
  present: boolean;
  event_call?: EventCall;
  participants?: Members[] | Person[];
  member?: Members;
  guest?: Person;
}
