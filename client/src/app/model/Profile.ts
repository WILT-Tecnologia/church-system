export type Profile = {
  id: string;
  name: string;
  description: string;
  status: boolean;
  permissions: Module[];
  profilesPermissions: ProfileModule[];
  created_at: string;
  updated_at: string;
};

export type Module = {
  id: string;
  name: string;
  profilesModule: ProfileModule[];
};

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
