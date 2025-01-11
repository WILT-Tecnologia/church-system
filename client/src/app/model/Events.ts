import { Church } from './Church';
import { EventTypes } from './EventTypes';
import { User } from './User';

export type Events = {
  id: string;
  church: Church;
  church_id: string;
  event_type: EventTypes;
  event_type_id: string;
  name: string;
  obs: string;
  user: User;
  created_at: Date;
  updated_at: Date;
  created_by: User;
  updated_by: User;
};
