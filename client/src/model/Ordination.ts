import { Members } from './Members';
import { Occupation } from './Occupation';

export type Ordination = {
  id: string;
  member_id: Members;
  occupation_id?: Occupation;
  status: boolean;
  initial_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};
