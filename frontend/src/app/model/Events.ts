import { Church } from './Church';
import { EventTypes } from './EventTypes';
import { Guest } from './Guest';
import { Members } from './Members';
import { User } from './User';

export type Events = {
  id: string;
  church?: Church;
  eventType?: EventTypes;
  church_id: string;
  event_type_id: string;
  name: string;
  obs?: string;
  participants?: Members[];
  guests?: Guest[];
  participantAndGuests?: ParticipantAndGuest[];
  callToDay?: CallToDay;
  created_at?: string;
  updated_at?: string;
  created_by?: User;
  updated_by?: User | null;
  combinedCreatedByAndCreatedAt?: string;
  combinedUpdatedByAndUpdatedAt?: string;
};

export type CallToDay = {
  id: string;
  event: Events;
  event_id: string;
  theme: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
};

export type MakeCall = {
  id: string;
  participants?: Members[];
  guests?: Guest[];
  callToDay?: CallToDay[];
  created_at?: string;
  updated_at?: string;
};

export type ParticipantAndGuest = {
  id: string;
  name: string;
  selected: boolean;
  isGuest?: boolean;
};
