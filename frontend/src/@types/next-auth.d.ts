import "next-auth";

//import { AccessLevel } from 'models/AccessLevel';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      login: string;
      token: string;
      changePassword: boolean;
    };
    configs: {
      name_client?: string;
      status_client?: string;
    };
    token: string;
    id: string;
    profileId?: string;
    // accessLevel?: AccessLevel;
  }

  interface User extends User {
    id: string;
    name: string;
    login: string;
    jwt: string;
    //change_password: boolean;
    //profileId: string;
    //accessLevel: AccessLevel;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    login: string;
    jwt: string;
    changePassword: boolean;
    profileId: string;
    accessLevel: AccessLevel;
    sessionId?: string;
  }
}
