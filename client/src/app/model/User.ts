export type User = {
  id: string;
  name: string;
  login: string;
  change_password: boolean;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserForm = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
