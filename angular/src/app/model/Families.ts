import { Kinships } from './Auxiliaries';
import { Members } from './Members';
import { Person } from './Person';

export type Families = {
  id: string;
  name: string;
  is_member: boolean;
  member: Members;
  member_id: string;
  person: Person;
  person_id: string;
  kinship: Kinships;
  kinship_id: string;
};
