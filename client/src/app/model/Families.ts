import { Kinships } from './Auxiliaries';
import { Members } from './Members';
import { Person } from './Person';

export type Families = {
  id: string;
  name: string;
  member: Members;
  member_id: string;
  person: Person;
  person_id: string;
  kinship: Kinships;
  kinship_id: string;
  created_at: string;
  updated_at: string;
};
