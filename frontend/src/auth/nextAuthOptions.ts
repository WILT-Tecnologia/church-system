import axios from "axios";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "login", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          const res = await axios.post(`${process.env.API_URL}/auth/signin`, {
            login: credentials.login,
            password: credentials.password,
            jwt: credentials.jwt,
          });

          if (res.data.user) {
            return res.data.user;
          } else {
            return null;
          }
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      session.token = token.id;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: false,
};
