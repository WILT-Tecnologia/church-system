export type Profile = {
  id: string;
  name: string;
  description: string;
  status: boolean;
  permissions: Permissions[];
  created_at: string;
  updated_at: string;
};

export type Permissions = {
  id: string;
  module: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
};
