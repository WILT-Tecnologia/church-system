import axios from 'axios';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export const nextAuthOptions: NextAuthOptions = {
  cookies: { csrfToken: { name: 'XSRF-TOKEN', options: { httpOnly: true } } },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials: any) {
        try {
          const res = await axios.post(`${process.env.API_URL}/teste`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          const { user, token } = res.data;

          if (user && token) {
            return {
              ...user,
              token,
            };
          }
          return null;
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.token = token.token;
      }
      return session;
    },
    async signIn(account: any) {
      const session = await getSession();
      const csrfToken = session?.csrfToken || uuidv4();
      // Armazena o token CSRF em session.csrfToken
      if (session) {
        session.csrfToken = csrfToken;
      }
      // Inclui o token CSRF na requisição
      account.params = { _token: csrfToken };
      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};
