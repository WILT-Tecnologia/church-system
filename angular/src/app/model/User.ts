export type User = {
  id: string;
  name: string;
  email: string;
  change_password: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type UserForm = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
