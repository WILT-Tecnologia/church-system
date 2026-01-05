export interface Modules {
  id: string;
  name: string;
  context: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfilePermissions {
  id: string;
  name: string;
  module_id: string;
  module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
}
