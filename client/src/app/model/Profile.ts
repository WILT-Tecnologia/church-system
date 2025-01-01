export type Profile = {
  id: string;
  name: string;
  description: string;
  status: boolean;
  permissions: Permissions[];
};

export type Permissions = {
  id: string;
  module: string;
  profilesPermissions: ProfilePermissions[];
};

export type ProfilePermissions = {
  id: string;
  profile_id: string;
  permission_id: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
};
