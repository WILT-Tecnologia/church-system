export type UserData = {
  id: string;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserResponse = {
  status: boolean;
  token: string;
  user: {
    //current_page: number;
    data: UserData[];
    /* first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number; */
  };
};

export type FormattedUsers = UserData & {
  createdAt?: string;
  updatedAt?: string;
};
