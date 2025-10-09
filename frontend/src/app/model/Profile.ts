export type Profile = {
  id: string;
  name: string;
  description: string;
  guard_name: string;
  modules: Module[];
  permissions: ProfileModule[];
  status: boolean;
  created_at: string;
  updated_at: string;
};

export interface Module {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export type ProfileModule = {
  id: string;
  profile: Profile;
  profile_id: string;
  permission: Permissions;
  permission_id: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
};
