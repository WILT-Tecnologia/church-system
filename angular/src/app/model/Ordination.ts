import { Members } from './Members';
import { Occupation } from './Occupation';

export type Ordination = {
  id: string;
  member: Members;
  member_id: string;
  occupation: Occupation;
  occupation_id?: string;
  status: boolean;
  initial_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};
