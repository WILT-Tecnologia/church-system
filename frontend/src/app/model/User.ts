import { Profile } from './Profile';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  change_password: boolean;
  status: boolean;
  profile_id: string;
  profile: Profile;
  created_at: Date | string;
  updated_at: Date | string;
};
