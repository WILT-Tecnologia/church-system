import 'next-auth';

//import { AccessLevel } from 'models/AccessLevel';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      token?: string; // Ajuste aqui para 'token'
    };
    csrfToken: string;
  }

  interface User extends User {
    id: string;
    name: string;
    email: string;
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    token: string;
  }
}
